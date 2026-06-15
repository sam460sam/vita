import { jsPDF } from 'jspdf';
import type { Cantiere } from '@/data/types';
import { calcolaCemento, formatEuro } from './logic';

const TIPO_LABELS: Record<string, string> = {
  industriale: 'Industriale',
  residenziale: 'Residenziale',
  esterno: 'Esterno / Piazzale',
  garage: 'Garage',
  altro: 'Altro',
};

const CONDIZIONI_GENERALI =
  'Il presente preventivo è valido per 30 giorni dalla data di emissione. Il prezzo indicato ' +
  'si intende comprensivo di manodopera, mezzi e materiali salvo diversa indicazione. ' +
  'Non sono inclusi: lavori di preparazione del fondo, demolizioni, smaltimento macerie, ' +
  'ponteggi e lavori murari accessori. Eventuali variazioni quantitative rispetto alle ' +
  'superfici indicate saranno valorizzate ai medesimi prezzi unitari. I lavori verranno ' +
  'eseguiti a regola d\'arte secondo le norme tecniche UNI EN 206 e UNI 11146.';

const NOTA_METEO =
  'Temperature di getto raccomandate: min +5 °C — max +35 °C. La programmazione dei ' +
  'lavori terrà conto delle condizioni meteorologiche previste. In caso di pioggia ' +
  'intensa o gelo nelle 48h precedenti o successive al getto, la data di esecuzione ' +
  'potrà essere posticipata senza oneri aggiuntivi per il committente.';

function docId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PRV-${ts}-${rnd}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function generatePreventivo(cantiere: Cantiere, teamName: string): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210;
  const mL = 16;
  const mR = 16;
  const cW = W - mL - mR;
  let y = 16;
  const id = docId();
  const oggi = new Date();
  const validita = new Date(oggi);
  validita.setDate(validita.getDate() + 30);

  function checkPage(needed: number) {
    if (y + needed > 275) { doc.addPage(); y = 16; }
  }

  function sectionTitle(text: string) {
    checkPage(12);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 40, 0);
    doc.text(text.toUpperCase(), mL, y);
    y += 1.5;
    doc.setDrawColor(245, 81, 0);
    doc.setLineWidth(0.35);
    doc.line(mL, y, W - mR, y);
    y += 5;
    doc.setTextColor(20, 20, 20);
  }

  function row(label: string, value: string) {
    checkPage(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label, mL, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(value, mL + 60, y);
    y += 5.5;
  }

  function para(text: string, size = 8, indent = 0, lineH = 4.5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(50, 50, 50);
    (doc.splitTextToSize(text, cW - indent) as string[]).forEach((line) => {
      checkPage(lineH + 1);
      doc.text(line, mL + indent, y);
      y += lineH;
    });
  }

  // ═══════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════
  doc.setFillColor(245, 81, 0);
  doc.rect(0, 0, W, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(teamName.toUpperCase(), mL, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 200, 160);
  doc.text('Pavimentazioni in calcestruzzo · Getti industriali e civili', mL, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PREVENTIVO', W - mR, y + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 200, 160);
  doc.text(id, W - mR, y + 11, { align: 'right' });
  doc.text(fmtDate(oggi), W - mR, y + 17, { align: 'right' });

  y = 40;
  doc.setTextColor(20, 20, 20);

  // ═══════════════════════════════════════════════════════
  // VALIDITÀ + CLIENTE
  // ═══════════════════════════════════════════════════════
  const colW = (cW - 4) / 2;
  const col2x = mL + colW + 4;

  // Left: client box
  doc.setFillColor(252, 248, 245);
  doc.setDrawColor(245, 81, 0);
  doc.setLineWidth(0.25);
  doc.roundedRect(mL, y - 2, colW, 30, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(245, 81, 0);
  doc.text('SPETT.LE', mL + 3, y + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(cantiere.cliente, mL + 3, y + 10);
  if (cantiere.telefono) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Tel: ${cantiere.telefono}`, mL + 3, y + 17);
  }
  if (cantiere.indirizzo) {
    const addrLines = doc.splitTextToSize(cantiere.indirizzo, colW - 6) as string[];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const addrY = cantiere.telefono ? y + 22 : y + 17;
    addrLines.slice(0, 2).forEach((l, i) => doc.text(l, mL + 3, addrY + i * 4.5));
  }

  // Right: validity box
  doc.setFillColor(245, 245, 252);
  doc.setDrawColor(100, 100, 180);
  doc.setLineWidth(0.25);
  doc.roundedRect(col2x, y - 2, colW, 30, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 150);
  doc.text('VALIDITÀ PREVENTIVO', col2x + 3, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(`Emesso il: ${fmtDate(oggi)}`, col2x + 3, y + 10);
  doc.text(`Valido fino al: ${fmtDate(validita)}`, col2x + 3, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('CODICE PREVENTIVO', col2x + 3, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text(id, col2x + 3, y + 28);

  y += 38;

  // ═══════════════════════════════════════════════════════
  // DESCRIZIONE LAVORI
  // ═══════════════════════════════════════════════════════
  sectionTitle('Descrizione lavori');

  if (cantiere.indirizzo) row('Cantiere / ubicazione', cantiere.indirizzo);
  row('Tipo utilizzo', TIPO_LABELS[cantiere.tipoUso] ?? cantiere.tipoUso);
  row('Superficie netta', `${cantiere.mq} m²`);
  row('Spessore getto', `${cantiere.spessore} cm`);
  const m3 = calcolaCemento(cantiere.mq, cantiere.spessore);
  row('Volume calcestruzzo stimato', `${m3} m³ (+ 5% scarto standard)`);
  if (cantiere.classeCemento) row('Classe calcestruzzo', cantiere.classeCemento);
  if (cantiere.additivi.length > 0) row('Additivi previsti', cantiere.additivi.join(', '));
  if (cantiere.dataPrevista) {
    row('Data prevista inizio lavori', new Date(cantiere.dataPrevista).toLocaleDateString('it-IT'));
  }
  if (cantiere.note) {
    y += 1;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    para(cantiere.note, 7.5);
    y += 2;
  }

  // ═══════════════════════════════════════════════════════
  // IMPORTO
  // ═══════════════════════════════════════════════════════
  sectionTitle('Corrispettivo economico');

  checkPage(26);
  doc.setFillColor(35, 30, 25);
  doc.roundedRect(mL, y - 1, cW, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 200, 160);
  doc.text('IMPORTO TOTALE PREVENTIVATO', mL + 4, y + 6);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(formatEuro(cantiere.importo), mL + 4, y + 14);

  if (cantiere.acconto != null && cantiere.acconto > 0) {
    const saldo = cantiere.importo - cantiere.acconto;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(
      `Acconto alla firma: ${formatEuro(cantiere.acconto)}  ·  Saldo alla consegna: ${formatEuro(saldo)}`,
      W - mR - 4, y + 14, { align: 'right' },
    );
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Pagamento alla consegna e accettazione dell\'opera', W - mR - 4, y + 14, { align: 'right' });
  }

  y += 26;
  doc.setTextColor(20, 20, 20);

  // Price per m²
  if (cantiere.mq > 0) {
    const perMq = cantiere.importo / cantiere.mq;
    checkPage(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Prezzo unitario: ${formatEuro(perMq)} /m²  ·  ${cantiere.mq} m² × ${cantiere.spessore} cm`,
      mL, y,
    );
    y += 6;
  }

  // ═══════════════════════════════════════════════════════
  // CONDIZIONI GENERALI
  // ═══════════════════════════════════════════════════════
  sectionTitle('Condizioni generali');

  checkPage(20);
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.25);
  const lines1 = doc.splitTextToSize(CONDIZIONI_GENERALI, cW - 6) as string[];
  const bh1 = lines1.length * 4.3 + 6;
  doc.roundedRect(mL, y - 2, cW, bh1, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  lines1.forEach((line, i) => doc.text(line, mL + 3, y + 2 + i * 4.3));
  y += bh1 + 3;

  sectionTitle('Note tecniche — calcestruzzo');

  checkPage(16);
  doc.setFillColor(255, 251, 245);
  doc.setDrawColor(245, 81, 0);
  doc.setLineWidth(0.2);
  const lines2 = doc.splitTextToSize(NOTA_METEO, cW - 6) as string[];
  const bh2 = lines2.length * 4.3 + 6;
  doc.roundedRect(mL, y - 2, cW, bh2, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 40, 10);
  lines2.forEach((line, i) => doc.text(line, mL + 3, y + 2 + i * 4.3));
  y += bh2 + 8;

  // ═══════════════════════════════════════════════════════
  // ACCETTAZIONE
  // ═══════════════════════════════════════════════════════
  sectionTitle('Accettazione preventivo');

  checkPage(30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(
    'Il/La sottoscritto/a, prendendo atto del preventivo n. ' + id + ', accetta le condizioni ' +
    'economiche e tecniche sopra riportate.',
    mL, y, { maxWidth: cW },
  );
  y += 8;

  // Signature lines
  const halfCW = (cW - 8) / 2;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(mL, y + 16, mL + halfCW, y + 16);
  doc.line(col2x, y + 16, col2x + halfCW, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`${fmtDate(oggi)}`, mL, y + 21);
  doc.text('Data e firma del committente', col2x, y + 21);
  doc.setFontSize(7);
  doc.text('Data di emissione', mL, y + 21);
  y += 28;

  // ═══════════════════════════════════════════════════════
  // FOOTER SU OGNI PAGINA
  // ═══════════════════════════════════════════════════════
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } })
    .internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = 289;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.25);
    doc.line(mL, fy - 3, W - mR, fy - 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${teamName}  ·  Preventivo ${id}  ·  Valido fino al ${fmtDate(validita)}`,
      mL, fy,
    );
    doc.text(`${p} / ${totalPages}`, W - mR, fy, { align: 'right' });
  }

  return doc.output('blob');
}

export async function condividiPreventivo(cantiere: Cantiere, teamName: string): Promise<void> {
  const blob = generatePreventivo(cantiere, teamName);
  const nomeCliente = cantiere.cliente.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const data = new Date().toISOString().slice(0, 10);
  const filename = `preventivo_${nomeCliente}_${data}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: `Preventivo — ${cantiere.cliente}`,
      text: `Preventivo lavori — ${cantiere.cliente} — ${data}`,
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
