import { jsPDF } from 'jspdf';
import type { Cantiere } from '@/data/types';
import { getMioProfilo } from './profiloRepo';
import { calcolaCemento, formatEuro } from './logic';
import { CHECKLIST_ITEMS } from './VerbaleSheet';

// ── Legal texts ──────────────────────────────────────────────────────────────

const ACCETTAZIONE_OPERA =
  "Il committente, avendo proceduto alla verifica dell'opera ai sensi dell'art. 1665 c.c., " +
  'dichiara che i lavori di pavimentazione in calcestruzzo risultano eseguiti a regola d\'arte ' +
  'e conformi alle condizioni contrattuali pattuite. Con la sottoscrizione del presente ' +
  "verbale, il committente accetta definitivamente l'opera nella sua interezza.";

const GARANZIA_VIZI =
  "Ai sensi dell'art. 1667 c.c., il prestatore d'opera risponde dei vizi e delle difformità " +
  "dell'opera per un periodo di due anni dalla consegna. Il committente decade dal diritto " +
  'alla garanzia se non denuncia i vizi entro sessanta (60) giorni dalla loro scoperta. ' +
  "L'azione si prescrive in due anni dalla consegna dell'opera.";

const VIZI_APPARENTI =
  '— CLAUSOLA SPECIFICAMENTE APPROVATA AI SENSI DELL\'ART. 1341 COMMA 2 C.C. — ' +
  'Il committente dichiara di non aver rilevato, al momento della presente accettazione, ' +
  'alcun vizio apparente o difformità visibile o rilevabile con la normale diligenza. ' +
  'È pertanto esclusa qualsiasi contestazione successiva relativa a difetti apparenti ' +
  'percepibili al momento della consegna, ai sensi degli artt. 1665-1667 c.c.';

const IMPEGNO_PAGAMENTO =
  "Il committente, prendendo atto del completamento dell'opera e della sua accettazione " +
  'definitiva ai sensi del presente verbale, si impegna irrevocabilmente al pagamento del ' +
  "saldo residuo entro la data di scadenza indicata nel presente documento. L'obbligo di " +
  'pagamento è autonomo rispetto a qualsiasi successiva contestazione relativa a vizi ' +
  "apparenti, rinunciati con la firma del presente atto.";

const MORA_AUTOMATICA =
  '— CLAUSOLA SPECIFICAMENTE APPROVATA AI SENSI DELL\'ART. 1341 COMMA 2 C.C. — ' +
  'In caso di mancato pagamento alla scadenza, gli interessi moratori decorrono ' +
  'automaticamente dal giorno successivo alla scadenza, senza necessità di formale ' +
  "costituzione in mora (art. 1219 comma 2 n. 3 c.c.), nella misura prevista dall'art. 5 " +
  'del D.Lgs. 231/2002 (tasso BCE maggiorato di 8 punti percentuali) per le transazioni ' +
  'commerciali, ovvero al tasso legale ex art. 1284 e 1224 c.c. per i rapporti civili con ' +
  'consumatori. Sono inoltre dovute le spese di recupero nella misura minima di €40,00 ' +
  "ai sensi dell'art. 6 del D.Lgs. 231/2002.";

const FORO_COMPETENTE =
  '— CLAUSOLA SPECIFICAMENTE APPROVATA AI SENSI DELL\'ART. 1341 COMMA 2 C.C. — ' +
  'Per qualsiasi controversia derivante dal presente contratto o dal presente verbale di ' +
  "accettazione è competente in via esclusiva il Tribunale di Treviso, con espressa " +
  "rinuncia a qualsiasi altro foro eventualmente competente.";

const VALORE_FES =
  'La firma apposta sul presente documento costituisce Firma Elettronica Semplice (FES) ' +
  'ai sensi del Regolamento UE 910/2014 (eIDAS), art. 3 n. 10, e del D.Lgs. 82/2005 ' +
  '(CAD), artt. 20-21. Ai sensi dell\'art. 25 del Reg. UE 910/2014, alla firma elettronica ' +
  'non possono essere negati gli effetti giuridici né l\'ammissibilità come prova in ' +
  "procedimenti giudiziali per il solo motivo della sua forma elettronica. Il presente " +
  "documento informatico, unitamente ai metadati di firma (nominativo del firmatario, " +
  'data e ora in formato ISO 8601, identificativo univoco del documento), costituisce piena ' +
  "prova delle dichiarazioni rese ai sensi dell'art. 2702 e 2712 c.c.";

// ── Helpers ───────────────────────────────────────────────────────────────────

function docId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VDC-${ts}-${rnd}`;
}

function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateVerbale(cantiere: Cantiere): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210;
  const mL = 16;
  const mR = 16;
  const cW = W - mL - mR;
  let y = 16;
  const id = docId();

  function checkPage(needed: number) {
    if (y + needed > 275) { doc.addPage(); y = 16; }
  }

  function sectionTitle(text: string) {
    checkPage(12);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 60, 20);
    doc.text(text.toUpperCase(), mL, y);
    y += 1.5;
    doc.setDrawColor(200, 160, 40);
    doc.setLineWidth(0.35);
    doc.line(mL, y, W - mR, y);
    y += 5;
    doc.setTextColor(20, 20, 20);
  }

  function row(label: string, value: string, bold = false) {
    checkPage(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, mL, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(value, mL + 50, y);
    y += 5.5;
  }

  function para(text: string, size = 8, indent = 0, lineH = 4.5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    splitLines(doc, text, cW - indent).forEach((line) => {
      checkPage(lineH + 1);
      doc.text(line, mL + indent, y);
      y += lineH;
    });
  }

  function legalBox(text: string, bgColor: [number, number, number] = [248, 245, 235]) {
    const lines = splitLines(doc, text, cW - 6);
    const bh = lines.length * 4.3 + 6;
    checkPage(bh + 4);
    doc.setFillColor(...bgColor);
    doc.setDrawColor(200, 180, 120);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y - 2, cW, bh, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 35, 10);
    lines.forEach((line, i) => {
      doc.text(line, mL + 3, y + 2 + i * 4.3);
    });
    y += bh + 3;
  }

  function checkItem(text: string, checked: boolean) {
    checkPage(7);
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.35);
    doc.rect(mL, y - 3.2, 3.2, 3.2);
    if (checked) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 130, 60);
      doc.text('✓', mL + 0.4, y - 0.3);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(text, mL + 6, y - 0.2);
    y += 5.5;
  }

  // ═══════════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(35, 40, 50);
  doc.rect(mL, y - 2, cW, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('VERBALE DI CONSEGNA E ACCETTAZIONE DEFINITIVA', mL + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text('Verbale di collaudo ai sensi dell\'art. 1665 c.c. — valore probatorio FES ex Reg. UE 910/2014', mL + 4, y + 10);

  doc.setTextColor(180, 180, 180);
  doc.text(`ID: ${id}`, W - mR - 4, y + 5, { align: 'right' });

  const profilo = getMioProfilo();
  const contrattistaName = profilo?.nome ?? 'Impresa Edile';
  const contrattistaLuogo = profilo?.provincia ? `Provincia di ${profilo.provincia}` : 'Veneto';
  const tsISO = cantiere.verbaleTimestamp ?? new Date().toISOString();
  const tsLabel = new Date(tsISO).toLocaleString('it-IT', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  doc.text(`Data firma: ${tsLabel}`, W - mR - 4, y + 10, { align: 'right' });
  y += 22;

  doc.setTextColor(20, 20, 20);

  // ═══════════════════════════════════════════════════════════════════
  // PARTI CONTRATTUALI
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Parti del contratto');

  // Two-column layout
  const colW = (cW - 4) / 2;
  const col2x = mL + colW + 4;
  const partiY = y;

  doc.setFillColor(248, 248, 252);
  doc.roundedRect(mL, partiY - 2, colW, 26, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 120);
  doc.text('PRESTATORE D\'OPERA (Appaltatore)', mL + 3, partiY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(contrattistaName, mL + 3, partiY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(contrattistaLuogo, mL + 3, partiY + 14);
  doc.text('Posatore pavimentazioni in calcestruzzo', mL + 3, partiY + 19);

  doc.setFillColor(252, 248, 245);
  doc.roundedRect(col2x, partiY - 2, colW, 26, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 60, 20);
  doc.text('COMMITTENTE (Cliente)', col2x + 3, partiY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  const signerName = cantiere.verbaleClienteNome ?? cantiere.cliente;
  doc.text(signerName, col2x + 3, partiY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  if (cantiere.telefono) doc.text(`Tel: ${cantiere.telefono}`, col2x + 3, partiY + 14);
  if (cantiere.indirizzo) {
    const indirizzoLines = splitLines(doc, cantiere.indirizzo, colW - 6);
    indirizzoLines.slice(0, 2).forEach((l, i) => doc.text(l, col2x + 3, partiY + 14 + (cantiere.telefono ? 5 : 0) + i * 4.5));
  }
  y = partiY + 30;

  // ═══════════════════════════════════════════════════════════════════
  // DESCRIZIONE LAVORI
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Descrizione dei lavori eseguiti');

  row('Cantiere / Ubicazione', cantiere.indirizzo ?? cantiere.cliente);
  row('Tipo di utilizzo', cantiere.tipoUso ?? '—');
  row('Superficie', `${cantiere.mq} m²`);
  row('Spessore getto', `${cantiere.spessore} cm`);
  row('Volume calcestruzzo', `${calcolaCemento(cantiere.mq, cantiere.spessore)} m³`);
  if (cantiere.classeCemento) row('Classe calcestruzzo', cantiere.classeCemento);
  if (cantiere.additivi.length > 0) row('Additivi impiegati', cantiere.additivi.join(', '));
  if (cantiere.dataPrevista) row('Data inizio lavori', cantiere.dataPrevista);
  if (cantiere.dataCompletamento) row('Data completamento', cantiere.dataCompletamento);
  if (cantiere.note) {
    y += 1;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    para(cantiere.note, 7.5);
    y += 1;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SITUAZIONE ECONOMICA
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Situazione economica');

  const saldo = cantiere.importo - (cantiere.acconto ?? 0);
  const scadenza = cantiere.scadenzaPagamento
    ? new Date(cantiere.scadenzaPagamento).toLocaleDateString('it-IT')
    : 'non specificata';

  // Highlighted saldo box
  checkPage(20);
  doc.setFillColor(35, 40, 50);
  doc.roundedRect(mL, y - 1, cW, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('SALDO DOVUTO:', mL + 4, y + 6);
  doc.setFontSize(14);
  doc.text(formatEuro(saldo), mL + 40, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text(`Scadenza: ${scadenza}`, mL + 4, y + 12);
  if (cantiere.acconto != null && cantiere.acconto > 0) {
    doc.text(
      `Importo totale: ${formatEuro(cantiere.importo)}  ·  Acconto ricevuto: ${formatEuro(cantiere.acconto)}`,
      W - mR - 4, y + 12, { align: 'right' },
    );
  }
  y += 20;

  doc.setTextColor(20, 20, 20);

  // ═══════════════════════════════════════════════════════════════════
  // ACCETTAZIONE OPERA E GARANZIA
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Verifica e accettazione definitiva dell\'opera');

  para(ACCETTAZIONE_OPERA, 8);
  y += 2;

  // Checklist — mark all as confirmed (verbale is generated after signature, so all items were verified)
  CHECKLIST_ITEMS.forEach((item) => checkItem(item, true));
  y += 2;

  para(GARANZIA_VIZI, 7.5);
  y += 3;

  // ═══════════════════════════════════════════════════════════════════
  // IMPEGNO DI PAGAMENTO
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Impegno di pagamento');

  para(IMPEGNO_PAGAMENTO, 8);
  y += 3;

  // ═══════════════════════════════════════════════════════════════════
  // CLAUSOLE SPECIFICAMENTE APPROVATE — ART. 1341 C.C.
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Clausole specificamente approvate — art. 1341 c.c.');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 10);
  doc.text('A) Esclusione dei vizi apparenti', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  legalBox(VIZI_APPARENTI);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 10);
  doc.text('B) Interessi moratori automatici', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  legalBox(MORA_AUTOMATICA);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 10);
  doc.text('C) Foro esclusivo — Tribunale di Treviso', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  legalBox(FORO_COMPETENTE);

  // ═══════════════════════════════════════════════════════════════════
  // FIRMA DEL COMMITTENTE
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Firma autografa del committente');

  // Two signature columns: left = contract acceptance, right = Art. 1341 specific approval
  checkPage(45);
  const sigColW = (cW - 5) / 2;
  const sig2x = mL + sigColW + 5;
  const sigY = y;

  // Metadata above signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Nome e cognome: ${signerName}`, mL, sigY);
  doc.text(`ID documento: ${id}`, sig2x, sigY);
  y += 4.5;
  doc.text(`Data e ora (ISO 8601): ${tsISO}`, mL, y);
  doc.text(`Approvazione art. 1341: SI`, sig2x, y);
  y += 7;

  // Signature image or blank box
  const sigBoxH = 32;
  if (cantiere.firmaCliente) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, cW, sigBoxH, 2, 2, 'FD');
    doc.addImage(cantiere.firmaCliente, 'PNG', mL + 2, y + 2, cW - 4, sigBoxH - 4);
  } else {
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, cW, sigBoxH, 2, 2, 'D');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Firma del committente', mL + cW / 2, y + sigBoxH / 2 + 2, { align: 'center' });
  }
  y += sigBoxH + 4;

  // Label under signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Firma autografa apposta su dispositivo digitale · ' +
    'Per l\'accettazione generale e per la specifica approvazione delle clausole A, B, C ex art. 1341 c.c.',
    mL, y, { maxWidth: cW },
  );
  y += 7;

  // ═══════════════════════════════════════════════════════════════════
  // VALORE PROBATORIO FES
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Valore probatorio della firma elettronica');
  legalBox(VALORE_FES, [245, 245, 250]);

  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENTAZIONE FOTOGRAFICA
  // ═══════════════════════════════════════════════════════════════════
  if (cantiere.foto.length > 0) {
    sectionTitle('Documentazione fotografica allegata');
    const photoW = (cW - 8) / 3;
    const photoH = photoW * 0.75;
    let col = 0;
    let rowStartY = y;
    cantiere.foto.forEach((dataUrl, i) => {
      if (col === 0 && i > 0) { rowStartY = y; }
      const xPos = mL + col * (photoW + 4);
      checkPage(photoH + 6);
      try {
        doc.addImage(dataUrl, 'JPEG', xPos, rowStartY, photoW, photoH);
      } catch {
        try { doc.addImage(dataUrl, 'PNG', xPos, rowStartY, photoW, photoH); } catch { /* skip */ }
      }
      col++;
      if (col === 3) { col = 0; y = rowStartY + photoH + 4; rowStartY = y; }
    });
    if (col > 0) y = rowStartY + photoH + 4;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER SU OGNI PAGINA
  // ═══════════════════════════════════════════════════════════════════
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } })
    .internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = 289;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.25);
    doc.line(mL, fy - 3, W - mR, fy - 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `ID: ${id}  ·  FES ai sensi Reg. UE 910/2014 (eIDAS) e D.Lgs. 82/2005 (CAD)  ·  ` +
      `Art. 1665/1667/1341 c.c. — D.Lgs. 231/2002  ·  Foro: Tribunale di Treviso`,
      mL, fy,
    );
    doc.text(`${p} / ${totalPages}`, W - mR, fy, { align: 'right' });
  }

  return doc.output('blob');
}

// ── Share / download ──────────────────────────────────────────────────────────

export async function condividiVerbale(cantiere: Cantiere) {
  const blob = generateVerbale(cantiere);
  const nomeCliente = cantiere.cliente.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const data = (cantiere.verbaleTimestamp ?? new Date().toISOString()).slice(0, 10);
  const filename = `verbale_${nomeCliente}_${data}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Verbale di consegna lavori',
      text: `Verbale di accettazione definitiva — ${cantiere.cliente} — ${data}`,
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
