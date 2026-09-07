import type { Column } from '@/components/shared/data-table';

function escapeCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv<T>(filename: string, columns: Column<T>[], rows: T[]) {
  const exportable = columns.filter((c) => c.csvValue);
  if (exportable.length === 0) return;
  const header = exportable.map((c) => escapeCell(c.header)).join(';');
  const body = rows.map((r) => exportable.map((c) => escapeCell(c.csvValue!(r))).join(';')).join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
