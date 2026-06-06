import { jsPDF } from 'jspdf';
import type { Cantiere } from '@/data/types';
import { getMioProfilo } from './profiloRepo';
import { calcolaCemento, formatEuro } from './logic';

const CHECKLIST = [
  'Spessore conforme al contratto',
  'Planarità entro tolleranza (3mm/3m — UNI 10966)',
  'Superficie priva di crepe o distacchi visibili',
  'Stagionatura completata correttamente',
  'Cantiere pulito e sgombrato',
];

const DISCLAIMER =
  'Firmando il presente verbale, il sottoscritto dichiara di aver ispezionato il lavoro eseguito ' +
  'e di accettarlo come conforme alle condizioni contrattuali concordate. ' +
  'La presente firma elettronica semplice ha valore probatorio ai sensi del Regolamento UE 910/2014 ' +
  '(eIDAS) e del D.Lgs. 82/2005 (CAD). Eventuali vizi occulti potranno essere segnalati entro 60 ' +
  "giorni ai sensi dell'art. 1667 c.c. È esclusa qualsiasi contestazione relativa a difetti visibili " +
  'al momento della presente accettazione.';

function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function generateVerbale(cantiere: Cantiere): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210;
  const marginL = 18;
  const marginR = 18;
  const contentW = W - marginL - marginR;
  let y = 18;

  // ── helpers ──────────────────────────────────────────────────────────────
  function checkPage(needed: number) {
    if (y + needed > 277) {
      doc.addPage();
      y = 18;
    }
  }

  function sectionTitle(text: string) {
    checkPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 80, 30);
    doc.text(text.toUpperCase(), marginL, y);
    y += 1.5;
    doc.setDrawColor(220, 180, 60);
    doc.setLineWidth(0.4);
    doc.line(marginL, y, W - marginR, y);
    y += 5;
    doc.setTextColor(30, 30, 30);
  }

  function row(label: string, value: string) {
    checkPage(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(label, marginL, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginL + 48, y);
    y += 6;
  }

  function paragraph(text: string, fontSize = 8.5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(50, 50, 50);
    const lines = splitLines(doc, text, contentW);
    lines.forEach((line) => {
      checkPage(5);
      doc.text(line, marginL, y);
      y += 4.8;
    });
    doc.setTextColor(30, 30, 30);
  }

  // ── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(marginL, y - 4, contentW, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('VERBALE DI CONSEGNA LAVORI', marginL + 4, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const profilo = getMioProfilo();
  const aziendaNome = profilo?.nome ?? 'Impresa Edile';
  doc.text(`Redatto da: ${aziendaNome}`, marginL + 4, y + 8);

  const tsLabel = cantiere.verbaleTimestamp
    ? new Date(cantiere.verbaleTimestamp).toLocaleString('it-IT')
    : new Date().toLocaleString('it-IT');
  doc.text(`Data firma: ${tsLabel}`, W - marginR - 50, y + 8);
  y += 18;
  doc.setTextColor(30, 30, 30);

  // ── DATI CANTIERE ─────────────────────────────────────────────────────────
  sectionTitle('Dati del cantiere');
  row('Cliente', cantiere.cliente);
  if (cantiere.indirizzo) row('Indirizzo', cantiere.indirizzo);
  if (cantiere.telefono) row('Telefono cliente', cantiere.telefono);
  row('Superfice', `${cantiere.mq} m²`);
  row('Spessore getto', `${cantiere.spessore} cm`);
  row('m³ stimati', `${calcolaCemento(cantiere.mq, cantiere.spessore)} m³`);
  if (cantiere.classeCemento) row('Classe cemento', cantiere.classeCemento);
  if (cantiere.additivi.length > 0) row('Additivi', cantiere.additivi.join(', '));
  if (cantiere.dataPrevista) row('Data lavori', cantiere.dataPrevista);
  if (cantiere.dataCompletamento) row('Data completamento', cantiere.dataCompletamento);
  row('Importo', formatEuro(cantiere.importo));
  if (cantiere.acconto != null && cantiere.acconto > 0) {
    row('Acconto ricevuto', formatEuro(cantiere.acconto));
    row('Saldo residuo', formatEuro(cantiere.importo - cantiere.acconto));
  }
  if (cantiere.note) {
    y += 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    paragraph(cantiere.note);
    y += 2;
  }

  // ── CHECKLIST CONFORMITÀ ─────────────────────────────────────────────────
  y += 3;
  sectionTitle('Conformità lavoro (UNI 10966)');
  CHECKLIST.forEach((item) => {
    checkPage(7);
    // draw checkbox (simple square)
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.4);
    doc.rect(marginL, y - 3.5, 3.5, 3.5);
    // always mark as checked when generating verbale after signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('✓', marginL + 0.3, y - 0.3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(item, marginL + 6, y - 0.2);
    y += 6;
  });

  // ── DICHIARAZIONE ────────────────────────────────────────────────────────
  y += 3;
  sectionTitle('Dichiarazione del cliente');
  paragraph(DISCLAIMER);

  // ── FIRMA ────────────────────────────────────────────────────────────────
  y += 5;
  checkPage(55);
  sectionTitle('Firma del cliente');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const signerName = cantiere.verbaleClienteNome ?? cantiere.cliente;
  doc.text(`Nome e cognome: ${signerName}`, marginL, y);
  y += 5;
  doc.text(`Data e ora firma: ${tsLabel}`, marginL, y);
  y += 8;

  if (cantiere.firmaCliente) {
    const sigBox = { x: marginL, y, w: 80, h: 28 };
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.roundedRect(sigBox.x, sigBox.y, sigBox.w, sigBox.h, 2, 2, 'FD');
    doc.addImage(cantiere.firmaCliente, 'PNG', sigBox.x + 2, sigBox.y + 2, sigBox.w - 4, sigBox.h - 4);
    y += sigBox.h + 4;
  } else {
    // blank signature line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(marginL, y + 18, marginL + 80, y + 18);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma del cliente', marginL, y + 22);
    y += 28;
  }

  // ── FOTO CANTIERE ────────────────────────────────────────────────────────
  if (cantiere.foto.length > 0) {
    y += 5;
    checkPage(12);
    sectionTitle('Documentazione fotografica');
    const photoW = (contentW - 6) / 3;
    const photoH = photoW * 0.75;
    let col = 0;
    const rowStartY = y;
    cantiere.foto.forEach((dataUrl, i) => {
      const xPos = marginL + col * (photoW + 3);
      const yPos = rowStartY + Math.floor(i / 3) * (photoH + 3);
      checkPage(photoH + 5);
      doc.addImage(dataUrl, 'JPEG', xPos, yPos, photoW, photoH);
      col = (col + 1) % 3;
    });
    const photoRows = Math.ceil(cantiere.foto.length / 3);
    y = rowStartY + photoRows * (photoH + 3) + 5;
  }

  // ── FOOTER LEGALE ────────────────────────────────────────────────────────
  const totalPages: number = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = 290;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginL, fy - 3, W - marginR, fy - 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma Elettronica Semplice (FES) · Reg. UE 910/2014 (eIDAS) · D.Lgs. 82/2005 (CAD) · Generato da Cantieri App', marginL, fy);
    doc.text(`Pag. ${p}/${totalPages}`, W - marginR, fy, { align: 'right' });
  }

  return doc.output('blob');
}

export async function condividiVerbale(cantiere: Cantiere) {
  const blob = generateVerbale(cantiere);
  const nomeCliente = cantiere.cliente.replace(/\s+/g, '_').toLowerCase();
  const data = cantiere.verbaleTimestamp
    ? cantiere.verbaleTimestamp.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const filename = `verbale_${nomeCliente}_${data}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Verbale di consegna', text: `Verbale lavori — ${cantiere.cliente}` });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
