import { useMemo, useState } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm';
import { formatNumber } from '@/lib/format';
import { useT } from '@/i18n';
import { useTeile } from './store';
import type { Teil } from './types';
import { TeilForm } from './Form';

export function TeileList() {
  const { t } = useT('teile');
  const { t: tc } = useT('common');
  const { items, add, update, remove } = useTeile();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Teil | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) =>
        x.artikelnr.toLowerCase().includes(s) ||
        x.bezeichnung.toLowerCase().includes(s) ||
        x.lieferant.toLowerCase().includes(s) ||
        x.kategorie.toLowerCase().includes(s),
    );
  }, [items, q]);

  const columns: Column<Teil>[] = [
    { key: 'artikelnr', header: t('cols.artikelnr'), sortValue: (r) => r.artikelnr, cell: (r) => <span className="num text-xs">{r.artikelnr}</span>, width: '120px' },
    { key: 'bezeichnung', header: t('cols.bezeichnung'), sortValue: (r) => r.bezeichnung, cell: (r) => <span className="font-medium">{r.bezeichnung}</span> },
    { key: 'kategorie', header: t('cols.kategorie'), sortValue: (r) => r.kategorie, cell: (r) => <Badge variant="secondary">{tc(`kategorie.${r.kategorie}`)}</Badge>, width: '140px' },
    { key: 'lieferant', header: t('cols.lieferant'), sortValue: (r) => r.lieferant, cell: (r) => <span className="text-muted-foreground">{r.lieferant}</span>, width: '140px' },
    {
      key: 'bestand',
      header: t('cols.bestand'),
      align: 'right',
      sortValue: (r) => r.bestand,
      cell: (r) => (
        <span className={r.bestand <= r.mindestbestand ? 'num text-destructive font-medium' : 'num'}>
          {formatNumber(r.bestand)} {tc(`einheit.${r.einheit}`)}
        </span>
      ),
      width: '130px',
    },
    { key: 'ekPreis', header: t('cols.ek'), align: 'right', sortValue: (r) => r.ekPreis, cell: (r) => <Money value={r.ekPreis} />, width: '110px' },
    { key: 'vkPreis', header: t('cols.vk'), align: 'right', sortValue: (r) => r.vkPreis, cell: (r) => <Money value={r.vkPreis} />, width: '110px' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => setEditing(r)} aria-label={tc('actions.edit')}>
            <Pencil size={16} />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label={tc('actions.delete')}>
                <Trash2 size={16} />
              </Button>
            }
            title={t('delete.title')}
            description={t('delete.description', { name: r.bezeichnung })}
            onConfirm={() => remove(r.id)}
          />
        </div>
      ),
      width: '96px',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <>
            <Input
              placeholder={tc('actions.search')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-64"
            />
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              {t('list.newPart')}
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => setEditing(r)}
        emptyState={
          <EmptyState
            icon={Package}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} />
                {t('list.newPart')}
              </Button>
            }
          />
        }
      />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('form.newTitle')}</DialogTitle>
          </DialogHeader>
          <TeilForm
            onSubmit={(x) => { add(x); setCreating(false); }}
            onCancel={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('form.editTitle')}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <TeilForm
              initial={editing}
              onSubmit={(x) => { update(editing.id, x); setEditing(null); }}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
