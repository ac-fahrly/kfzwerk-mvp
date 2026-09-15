import { jsPDF } from 'jspdf';
import { formatDate, formatMoney } from '@/lib/format';
import type { Customer, Vehicle } from '@/modules/kunden/types';
import type { Rechnung } from '@/modules/rechnungen/types';
import { offenerBetrag } from '@/modules/rechnungen/types';

export type InvoicePdfLabels = {
  title: string;         // "Rechnung" / "Invoice"
  number: string;        // "Nr." / "No."
  invoiceDate: string;
  dueDate: string;
  billTo: string;
  vehicle: string;
  total: string;
  paid: string;
  open: string;
  note: string;
  page: (current: number, total: number) => string;
};

type Args = {
  r: Rechnung;
  customer: Customer | undefined;
  vehicle: Vehicle | undefined;
  labels: InvoicePdfLabels;
  filename?: string;
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 18;

export function saveInvoicePdf({ r, customer, vehicle, labels, filename }: Args): void {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  pdf.setFont('helvetica', 'normal');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(labels.title.toUpperCase(), MARGIN_X, MARGIN_TOP + 4);

  // Invoice number (top-right)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`${labels.number} ${r.nummer}`, PAGE_W - MARGIN_X, MARGIN_TOP, { align: 'right' });

  // Divider
  pdf.setDrawColor(210);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, MARGIN_TOP + 8, PAGE_W - MARGIN_X, MARGIN_TOP + 8);

  // Bill-to (left) + invoice meta (right)
  let y = MARGIN_TOP + 16;
  const colRightX = 130;

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(labels.billTo, MARGIN_X, y);
  pdf.text(labels.invoiceDate, colRightX, y);
  pdf.text(labels.dueDate, colRightX + 35, y);

  pdf.setFontSize(11);
  pdf.setTextColor(20);
  y += 5;
  if (customer) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(customer.name, MARGIN_X, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(customer.strasse || '', MARGIN_X, y + 5);
    pdf.text(`${customer.plz ?? ''} ${customer.ort ?? ''}`.trim(), MARGIN_X, y + 10);
  } else {
    pdf.text('—', MARGIN_X, y);
  }

  pdf.setFontSize(11);
  pdf.text(formatDate(r.datum), colRightX, y);
  pdf.text(formatDate(r.faelligDatum), colRightX + 35, y);

  y += 22;

  // Vehicle (optional)
  if (vehicle) {
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(labels.vehicle, MARGIN_X, y);
    y += 5;
    pdf.setFontSize(11);
    pdf.setTextColor(20);
    const vLine = `${vehicle.kennzeichen}  ·  ${vehicle.hersteller} ${vehicle.modell}${vehicle.baujahr ? `  ·  ${vehicle.baujahr}` : ''}`;
    pdf.text(vLine, MARGIN_X, y);
    y += 10;
  }

  // Amounts block
  pdf.setDrawColor(210);
  pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 8;

  const amountRightX = PAGE_W - MARGIN_X;
  const drawRow = (label: string, value: string, bold = false, size = 11) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(bold ? 0 : 60);
    pdf.text(label, MARGIN_X, y);
    pdf.text(value, amountRightX, y, { align: 'right' });
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
      if (y > PAGE_H - MARGIN_BOTTOM - 6) {
        pdf.addPage();
        y = MARGIN_TOP;
      }
      pdf.text(line, MARGIN_X, y);
      y += 5;
    }
  }

  // Footer: page numbers
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(labels.page(i, total), PAGE_W - MARGIN_X, PAGE_H - 10, { align: 'right' });
  }

  pdf.save(`${filename ?? r.nummer}.pdf`);
}
