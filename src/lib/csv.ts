import type { Column } from '@/components/shared/data-table';

/**
 * CSV export for the list screens. The target is Excel on a German desktop, and
 * that dictates every choice here:
 *
 *  - `;` as the separator, because German Excel's list separator is `;`, not `,`
 *    (a comma is the DECIMAL separator here).
 *  - A leading `sep=;` line, because Excel picks the separator from the
 *    machine's locale, not from the file. Without it the same export that opens
 *    correctly in Berlin lands entirely in column A on any desktop configured
 *    for `,` — which is what happens on most non-German installs. Excel eats
 *    this line; Google Sheets and LibreOffice also honour it.
 *  - A UTF-8 BOM, or Excel reads the file as ANSI and Straße becomes StraÃŸe.
 *  - CRLF, the line ending Excel writes itself.
 *
 * Mirrors the same helper in the fahrly frontend (lib/csvExport.ts), which
 * solved this first — keep the two in step.
 */

const SEP = ';';

function escapeCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  // Only the separator, quotes and newlines need quoting. A comma deliberately
  // does NOT: German decimals arrive as "1428,00" and Excel reads an unquoted
  // one as a number, a quoted one as text that no SUM() will touch.
  if (/["\n\r]/.test(s) || s.includes(SEP)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv<T>(filename: string, columns: Column<T>[], rows: T[]) {
  const exportable = columns.filter((c) => c.csvValue);
  if (exportable.length === 0) return;

  const lines = [
    `sep=${SEP}`,
    exportable.map((c) => escapeCell(c.header)).join(SEP),
    ...rows.map((r) => exportable.map((c) => escapeCell(c.csvValue!(r))).join(SEP)),
  ];
  const csv = `\uFEFF${lines.join('\r\n')}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
