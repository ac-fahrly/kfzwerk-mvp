import { type ReactNode, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Align = 'left' | 'right' | 'center';
export type Density = 'comfortable' | 'compact';

export type Column<T> = {
  key: string;
  header: string;
  align?: Align;
  width?: string;
  sortValue?: (row: T) => string | number | Date;
  cell: (row: T) => ReactNode;
  hideUntilHover?: boolean;
  csvValue?: (row: T) => string | number;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  density?: Density;
};

function alignClass(a?: Align) {
  if (a === 'right') return 'text-right';
  if (a === 'center') return 'text-center';
  return 'text-left';
}

export function DataTable<T>({ columns, rows, getRowId, onRowClick, emptyState, density = 'comfortable' }: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const arr = [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, sortKey, sortDir, columns]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  const headerHeight = density === 'compact' ? 'h-9' : 'h-10';
  const rowHeight = density === 'compact' ? 'h-9' : 'h-12';
  const cellPad = density === 'compact' ? 'px-2' : 'px-3';

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b bg-muted/40" role="row">
              {columns.map((c) => {
                const sortable = !!c.sortValue;
                const active = sortKey === c.key;
                const ariaSort = !active ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending';
                return (
                  <th
                    key={c.key}
                    role="columnheader"
                    aria-sort={sortable ? ariaSort : undefined}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(
                      headerHeight,
                      cellPad,
                      'font-medium text-muted-foreground',
                      alignClass(c.align),
                      sortable && 'cursor-pointer select-none hover:text-foreground',
                    )}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span className={cn('inline-flex items-center gap-1', c.align === 'right' && 'flex-row-reverse')}>
                      {c.header}
                      {sortable ? (
                        active ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="opacity-40" />
                        )
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={getRowId(row)}
                role="row"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'group border-b last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/40 focus-within:bg-muted/40',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    role="gridcell"
                    className={cn(
                      rowHeight,
                      cellPad,
                      alignClass(c.align),
                      c.hideUntilHover && 'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
