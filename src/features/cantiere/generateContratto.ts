import { jsPDF } from 'jspdf';
import type { Cantiere } from '@/data/types';
import { calcolaCemento, formatEuro } from './logic';

// ── Legal texts ───────────────────────────────────────────────────────────────

const OBBLIGHI_APPALTATORE =
  "L'appaltatore si obbliga a eseguire i lavori di pavimentazione in calcestruzzo " +
  'descritti nel presente contratto con la perizia e diligenza richieste dalla natura ' +
  "dell'opera, nel rispetto delle norme tecniche vigenti (UNI EN 206, UNI 11146) e a " +
  "regola d'arte ai sensi dell'art. 1655 c.c. I materiali impiegati saranno conformi " +
  'alle specifiche tecniche indicate. In caso di vizi o difformità denunciati entro ' +
  "60 giorni dalla scoperta, l'appaltatore provvederà all'eliminazione a proprie " +
  "spese nei limiti di legge (artt. 1667-1668 c.c.).";

const OBBLIGHI_COMMITTENTE =
  'Il committente si obbliga a corrispondere il corrispettivo pattuito nei termini ' +
  'indicati, a garantire il libero accesso al cantiere nelle date concordate, a ' +
  'fornire le utenze necessarie (acqua, energia elettrica) e a segnalare ' +
  "tempestivamente all'appaltatore qualsiasi variazione delle condizioni del sito " +
  'che possa influire sulla corretta esecuzione dei lavori.';

const MORA_CONTRATTO =
  "— CLAUSOLA SPECIFICAMENTE APPROVATA AI SENSI DELL'ART. 1341 COMMA 2 C.C. — " +
  'In caso di mancato pagamento del corrispettivo o di qualsiasi sua rata alle ' +
  'scadenze pattuite, gli interessi moratori decorrono automaticamente dal giorno ' +
  'successivo alla scadenza, senza necessità di formale costituzione in mora ' +
  "(art. 1219 comma 2 n. 3 c.c.), nella misura prevista dall'art. 5 del D.Lgs. " +
  '231/2002 (tasso BCE maggiorato di 8 punti percentuali) per le transazioni ' +
  'commerciali, ovvero al tasso legale ex artt. 1284 e 1224 c.c. per i rapporti ' +
  'civili con consumatori. Sono altresì dovute le spese di recupero nella misura ' +
  "minima di €40,00 ai sensi dell'art. 6 del D.Lgs. 231/2002.";

const FORO_CONTRATTO =
  "— CLAUSOLA SPECIFICAMENTE APPROVATA AI SENSI DELL'ART. 1341 COMMA 2 C.C. — " +
  'Per qualsiasi controversia derivante dal presente contratto o dalla sua ' +
  'esecuzione, incluse quelle relative alla validità, interpretazione, esecuzione ' +
  'e risoluzione del medesimo, è esclusivamente competente il Tribunale di Treviso, ' +
  'con espressa rinuncia a qualsiasi altro foro eventualmente competente.';

const VALORE_FES =
  'La firma apposta sul presente documento costituisce Firma Elettronica Semplice (FES) ' +
  'ai sensi del Regolamento UE 910/2014 (eIDAS), art. 3 n. 10, e del D.Lgs. 82/2005 ' +
  "(CAD), artt. 20-21. Ai sensi dell'art. 25 del Reg. UE 910/2014, alla firma " +
  "elettronica non possono essere negati gli effetti giuridici né l'ammissibilità " +
  'come prova in procedimenti giudiziali per il solo motivo della sua forma ' +
  'elettronica. Il presente documento informatico, unitamente ai metadati di firma ' +
  '(nominativo del firmatario, data e ora in formato ISO 8601, identificativo ' +
  "univoco del documento), costituisce piena prova delle dichiarazioni rese ai " +
  "sensi degli artt. 2702 e 2712 c.c.";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  industriale: 'Industriale', residenziale: 'Residenziale',
  esterno: 'Esterno / Piazzale', garage: 'Garage', altro: 'Altro',
};

function docId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CCA-${ts}-${rnd}`;
}

function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateContratto(cantiere: Cantiere, teamName: string): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210;
  const mL = 16;
  const mR = 16;
  const cW = W - mL - mR;
  let y = 16;
  const id = docId();

  const signerName = cantiere.contrattoClienteNome ?? cantiere.cliente;
  const tsISO = cantiere.contrattoTimestamp ?? new Date().toISOString();
  const tsLabel = new Date(tsISO).toLocaleString('it-IT', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

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

  function row(label: string, value: string) {
    checkPage(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, mL, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(value, mL + 52, y);
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

  // ═══════════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(35, 40, 50);
  doc.rect(mL, y - 2, cW, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('CONTRATTO DI APPALTO — PAVIMENTAZIONE IN CALCESTRUZZO', mL + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text(
    "Contratto di appalto ai sensi dell'art. 1655 c.c. — FES ex Reg. UE 910/2014 (eIDAS)",
    mL + 4, y + 11,
  );

  doc.setTextColor(180, 180, 180);
  doc.text(`ID: ${id}`, W - mR - 4, y + 5, { align: 'right' });
  doc.text(`Data firma: ${tsLabel}`, W - mR - 4, y + 11, { align: 'right' });
  y += 25;

  doc.setTextColor(20, 20, 20);

  // ═══════════════════════════════════════════════════════════════════
  // PARTI CONTRATTUALI
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Parti del contratto');

  const colW = (cW - 4) / 2;
  const col2x = mL + colW + 4;
  const partiY = y;

  doc.setFillColor(248, 248, 252);
  doc.roundedRect(mL, partiY - 2, colW, 28, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 120);
  doc.text("APPALTATORE", mL + 3, partiY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(teamName, mL + 3, partiY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Posatore pavimentazioni in calcestruzzo', mL + 3, partiY + 14);
  doc.text('Veneto, Italia', mL + 3, partiY + 19);

  doc.setFillColor(252, 248, 245);
  doc.roundedRect(col2x, partiY - 2, colW, 28, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 60, 20);
  doc.text('COMMITTENTE', col2x + 3, partiY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(signerName, col2x + 3, partiY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  if (cantiere.telefono) doc.text(`Tel: ${cantiere.telefono}`, col2x + 3, partiY + 14);
  if (cantiere.indirizzo) {
    const lines = splitLines(doc, cantiere.indirizzo, colW - 6);
    const off = cantiere.telefono ? 19 : 14;
    lines.slice(0, 2).forEach((l, i) => doc.text(l, col2x + 3, partiY + off + i * 4.5));
  }
  y = partiY + 32;

  // ═══════════════════════════════════════════════════════════════════
  // OGGETTO DEL CONTRATTO
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Oggetto del contratto — descrizione lavori');

  if (cantiere.indirizzo) row('Cantiere / Ubicazione', cantiere.indirizzo);
  row('Tipo utilizzo', TIPO_LABELS[cantiere.tipoUso] ?? cantiere.tipoUso);
  row('Superficie netta', `${cantiere.mq} m²`);
  row('Spessore getto', `${cantiere.spessore} cm`);
  row('Volume calcestruzzo stimato', `${calcolaCemento(cantiere.mq, cantiere.spessore)} m³`);
  if (cantiere.classeCemento) row('Classe calcestruzzo', cantiere.classeCemento);
  if (cantiere.additivi.length > 0) row('Additivi previsti', cantiere.additivi.join(', '));
  if (cantiere.dataPrevista) row('Data prevista inizio lavori', cantiere.dataPrevista);
  if (cantiere.note) {
    y += 1;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    para(cantiere.note, 7.5);
    y += 1;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CORRISPETTIVO E CONDIZIONI DI PAGAMENTO
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Corrispettivo e condizioni di pagamento');

  const saldo = cantiere.importo - (cantiere.acconto ?? 0);

  checkPage(22);
  doc.setFillColor(35, 40, 50);
  doc.roundedRect(mL, y - 1, cW, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('IMPORTO TOTALE:', mL + 4, y + 7);
  doc.setFontSize(14);
  doc.text(formatEuro(cantiere.importo), mL + 48, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  if (cantiere.acconto != null && cantiere.acconto > 0) {
    doc.text(
      `Acconto: ${formatEuro(cantiere.acconto)}  ·  Saldo alla consegna: ${formatEuro(saldo)}`,
      mL + 4, y + 14,
    );
  } else {
    doc.text('Pagamento alla consegna e accettazione dell\'opera', mL + 4, y + 14);
  }
  y += 22;

  doc.setTextColor(20, 20, 20);

  // ═══════════════════════════════════════════════════════════════════
  // OBBLIGHI DELLE PARTI
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle("Obblighi delle parti");

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 120);
  doc.text('Appaltatore', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  para(OBBLIGHI_APPALTATORE, 8);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 60, 20);
  doc.text('Committente', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  para(OBBLIGHI_COMMITTENTE, 8);
  y += 3;

  // ═══════════════════════════════════════════════════════════════════
  // CLAUSOLE SPECIFICAMENTE APPROVATE — ART. 1341 C.C.
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Clausole specificamente approvate — art. 1341 c.c.');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 10);
  doc.text('A) Interessi moratori automatici', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  legalBox(MORA_CONTRATTO);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 10);
  doc.text('B) Foro esclusivo — Tribunale di Treviso', mL, y);
  y += 4;
  doc.setTextColor(20, 20, 20);
  legalBox(FORO_CONTRATTO);

  // ═══════════════════════════════════════════════════════════════════
  // FIRMA DEL COMMITTENTE
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Firma autografa del committente');

  checkPage(12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Nome e cognome: ${signerName}`, mL, y);
  doc.text(`ID documento: ${id}`, mL + cW / 2, y);
  y += 4.5;
  doc.text(`Data e ora (ISO 8601): ${tsISO}`, mL, y);
  doc.text('Approvazione art. 1341: SI', mL + cW / 2, y);
  y += 7;

  const sigBoxH = 32;
  if (cantiere.contrattoFirmaCliente) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, cW, sigBoxH, 2, 2, 'FD');
    doc.addImage(cantiere.contrattoFirmaCliente, 'PNG', mL + 2, y + 2, cW - 4, sigBoxH - 4);
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Firma autografa apposta su dispositivo digitale · ' +
    'Per la sottoscrizione del contratto e per la specifica approvazione delle clausole A, B ex art. 1341 c.c.',
    mL, y, { maxWidth: cW },
  );
  y += 7;

  // ═══════════════════════════════════════════════════════════════════
  // VALORE PROBATORIO FES
  // ═══════════════════════════════════════════════════════════════════
  sectionTitle('Valore probatorio della firma elettronica');
  legalBox(VALORE_FES, [245, 245, 250]);

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
      `Art. 1655/1667/1341 c.c. — D.Lgs. 231/2002  ·  Foro: Tribunale di Treviso`,
      mL, fy,
    );
    doc.text(`${p} / ${totalPages}`, W - mR, fy, { align: 'right' });
  }

  return doc.output('blob');
}

// ── Share / download ──────────────────────────────────────────────────────────

export async function condividiContratto(cantiere: Cantiere, teamName: string) {
  const blob = generateContratto(cantiere, teamName);
  const nomeCliente = cantiere.cliente.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const data = (cantiere.contrattoTimestamp ?? new Date().toISOString()).slice(0, 10);
  const filename = `contratto_${nomeCliente}_${data}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Contratto di appalto lavori',
      text: `Contratto di appalto — ${cantiere.cliente} — ${data}`,
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
