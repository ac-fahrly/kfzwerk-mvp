import { jsPDF } from 'jspdf';
import { formatDate, formatMoney } from '@/lib/format';
import type { Customer, Vehicle } from '@/modules/kunden/types';
import type { Rechnung } from '@/modules/rechnungen/types';
import { offenerBetrag } from '@/modules/rechnungen/types';
import type { BusinessSettings } from '@/modules/settings/types';

export type InvoicePdfLabels = {
  title: string;
  number: string;
  invoiceDate: string;
  dueDate: string;
  from: string;
  billTo: string;
  vehicle: string;
  total: string;
  paid: string;
  open: string;
  note: string;
  ustId: string;
  steuernummer: string;
  iban: string;
  bic: string;
  bank: string;
  page: (current: number, total: number) => string;
};

type Args = {
  r: Rechnung;
  customer: Customer | undefined;
  vehicle: Vehicle | undefined;
  business: BusinessSettings;
  labels: InvoicePdfLabels;
  filename?: string;
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 18;

export function saveInvoicePdf({ r, customer, vehicle, business, labels, filename }: Args): void {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  pdf.setFont('helvetica', 'normal');

  // Sender line at the very top: business address as a compact one-liner,
  // matches the German "Absenderzeile" above the bill-to window.
  let y = MARGIN_TOP;
  if (business.name) {
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    const senderParts = [business.name, business.strasse, `${business.plz} ${business.ort}`.trim(), business.land].filter(Boolean);
    pdf.text(senderParts.join('  ·  '), MARGIN_X, y);
    y += 6;
  }

  // Title row: RECHNUNG left, invoice number right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(0);
  pdf.text(labels.title.toUpperCase(), MARGIN_X, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60);
  pdf.text(`${labels.number} ${r.nummer}`, PAGE_W - MARGIN_X, y + 2, { align: 'right' });

  y += 12;
  pdf.setDrawColor(210);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 8;

  // Two-column block: bill-to (left) + invoice meta (right)
  const rightX = 130;
  const rightDateX = rightX + 35;
  const leftBlockTop = y;

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(labels.billTo, MARGIN_X, y);
  pdf.text(labels.invoiceDate, rightX, y);
  pdf.text(labels.dueDate, rightDateX, y);

  y += 5;
  pdf.setFontSize(11);
  pdf.setTextColor(20);
  if (customer) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(customer.name || '—', MARGIN_X, y);
    pdf.setFont('helvetica', 'normal');
    if (customer.strasse) pdf.text(customer.strasse, MARGIN_X, y + 5);
    const cityLine = `${customer.plz ?? ''} ${customer.ort ?? ''}`.trim();
    if (cityLine) pdf.text(cityLine, MARGIN_X, y + 10);
    if (customer.ustId) {
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`${labels.ustId} ${customer.ustId}`, MARGIN_X, y + 16);
    }
  } else {
    pdf.text('—', MARGIN_X, y);
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(20);
  pdf.text(formatDate(r.datum), rightX, y);
  pdf.text(formatDate(r.faelligDatum), rightDateX, y);

  y = leftBlockTop + 30;

  // Vehicle (optional)
  if (vehicle) {
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(labels.vehicle, MARGIN_X, y);
    y += 5;
    pdf.setFontSize(11);
    pdf.setTextColor(20);
    const parts = [vehicle.kennzeichen, `${vehicle.hersteller} ${vehicle.modell}`.trim()];
    if (vehicle.baujahr) parts.push(String(vehicle.baujahr));
    pdf.text(parts.filter(Boolean).join('  ·  '), MARGIN_X, y);
    y += 10;
  }

  // Amounts block
  pdf.setDrawColor(210);
  pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 8;

  const drawRow = (label: string, value: string, bold = false, size = 11) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(bold ? 0 : 60);
    pdf.text(label, MARGIN_X, y);
    pdf.text(value, PAGE_W - MARGIN_X, y, { align: 'right' });
  };

  drawRow(labels.total, formatMoney(r.betrag));
  y += 7;
  drawRow(labels.paid, formatMoney(r.bezahltBetrag));
  y += 4;
  pdf.setDrawColor(210);
  pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 7;
  drawRow(labels.open, formatMoney(offenerBetrag(r)), true, 14);
  y += 14;

  // Note (optional)
  if (r.notiz && r.notiz.trim().length > 0) {
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(labels.note, MARGIN_X, y);
    y += 5;
    pdf.setFontSize(10);
    pdf.setTextColor(20);
    const noteWidth = PAGE_W - MARGIN_X * 2;
    const lines = pdf.splitTextToSize(r.notiz, noteWidth) as string[];
    for (const line of lines) {
      if (y > PAGE_H - MARGIN_BOTTOM - 30) {
        pdf.addPage();
        y = MARGIN_TOP;
      }
      pdf.text(line, MARGIN_X, y);
      y += 5;
    }
  }

  // Footer block: business tax + bank details, drawn on every page.
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    drawFooter(pdf, business, labels);
  }

  pdf.save(`${filename ?? r.nummer}.pdf`);
}

function drawFooter(pdf: jsPDF, business: BusinessSettings, labels: InvoicePdfLabels) {
  const footerTop = PAGE_H - 32;
  pdf.setDrawColor(210);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, footerTop, PAGE_W - MARGIN_X, footerTop);

  const col1: string[] = [];
  if (business.name) col1.push(business.name);
  if (business.strasse) col1.push(business.strasse);
  const cityLine = `${business.plz} ${business.ort}`.trim();
  if (cityLine) col1.push(cityLine);
  if (business.email) col1.push(business.email);
  if (business.telefon) col1.push(business.telefon);

  const col2: string[] = [];
  if (business.ustId) col2.push(`${labels.ustId} ${business.ustId}`);
  if (business.steuernummer) col2.push(`${labels.steuernummer} ${business.steuernummer}`);

  const col3: string[] = [];
  if (business.bank) col3.push(`${labels.bank} ${business.bank}`);
  if (business.iban) col3.push(`${labels.iban} ${business.iban}`);
  if (business.bic) col3.push(`${labels.bic} ${business.bic}`);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120);

  const colWidth = (PAGE_W - MARGIN_X * 2) / 3;
  const startY = footerTop + 5;
  writeLines(pdf, col1, MARGIN_X, startY, colWidth - 4);
  writeLines(pdf, col2, MARGIN_X + colWidth, startY, colWidth - 4);
  writeLines(pdf, col3, MARGIN_X + colWidth * 2, startY, colWidth - 4);

  const current = pdf.getCurrentPageInfo().pageNumber;
  const total = pdf.getNumberOfPages();
  pdf.text(labels.page(current, total), PAGE_W - MARGIN_X, PAGE_H - 8, { align: 'right' });
}

function writeLines(pdf: jsPDF, lines: string[], x: number, y: number, maxWidth: number) {
  let cy = y;
  for (const raw of lines) {
    const wrapped = pdf.splitTextToSize(raw, maxWidth) as string[];
    for (const line of wrapped) {
      pdf.text(line, x, cy);
      cy += 3.5;
    }
  }
}
