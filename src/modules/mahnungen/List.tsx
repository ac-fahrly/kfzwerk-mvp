import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { StatusBadge, useStatusLabel } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm';
import { useT } from '@/i18n';
import { customerById } from '@/modules/shared/customers';
import { useRechnungen } from '@/modules/rechnungen/store';
import { rechnungById } from '@/modules/rechnungen/store';
import { istUeberfaellig, offenerBetrag } from '@/modules/rechnungen/types';
import { useMahnungen } from './store';
import { mahnungStatusList, type Mahnung } from './types';
import { MahnungForm } from './Form';

type Modal = { kind: 'create' } | { kind: 'edit'; item: Mahnung } | { kind: 'view'; item: Mahnung } | null;

export function MahnungenList() {
  const { t } = useT('mahnungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useMahnungen();
  const rechnungen = useRechnungen((s) => s.items);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [modal, setModal] = useState<Modal>(null);

  const kandidaten = useMemo(
    () => rechnungen.filter((r) => istUeberfaellig(r) && !items.some((m) => m.rechnungId === r.id && m.status !== 'erledigt')),
    [rechnungen, items],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((m) => {
      if (statusFilter !== 'alle' && m.status !== statusFilter) return false;
      if (!s) return true;
      const k = customerById(m.customerId)?.name.toLowerCase() ?? '';
      const rn = rechnungById(m.rechnungId)?.nummer.toLowerCase() ?? '';
      return m.nummer.toLowerCase().includes(s) || k.includes(s) || rn.includes(s);
    });
  }, [items, q, statusFilter]);

  const columns: Column<Mahnung>[] = [
    { key: 'nummer', header: t('cols.nummer'), sortValue: (r) => r.nummer, cell: (r) => <span className="num text-xs">{r.nummer}</span>, width: '130px' },
    { key: 'datum', header: t('cols.datum'), sortValue: (r) => r.datum, cell: (r) => <DateCell value={r.datum} />, width: '110px' },
    { key: 'kunde', header: t('cols.kunde'), sortValue: (r) => customerById(r.customerId)?.name ?? '', cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span> },
    { key: 'rechnung', header: t('cols.rechnung'), sortValue: (r) => rechnungById(r.rechnungId)?.nummer ?? '', cell: (r) => <span className="num text-xs text-muted-foreground">{rechnungById(r.rechnungId)?.nummer ?? '—'}</span>, width: '140px' },
    { key: 'status', header: t('cols.stufe'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, width: '190px' },
    { key: 'faellig', header: t('cols.faellig'), sortValue: (r) => r.faelligDatum, cell: (r) => <DateCell value={r.faelligDatum} />, width: '110px' },
    { key: 'offen', header: t('cols.offen'), align: 'right', sortValue: (r) => r.offenerBetrag, cell: (r) => <Money value={r.offenerBetrag} />, width: '120px' },
    { key: 'gebuehr', header: t('cols.gebuehr'), align: 'right', sortValue: (r) => r.mahngebuehr, cell: (r) => <Money value={r.mahngebuehr} />, width: '110px' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => setModal({ kind: 'view', item: r })} aria-label={tc('actions.view')}><Eye size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={() => setModal({ kind: 'edit', item: r })} aria-label={tc('actions.edit')}><Pencil size={16} /></Button>
          <ConfirmDialog
            trigger={<Button variant="ghost" size="icon" aria-label={tc('actions.delete')}><Trash2 size={16} /></Button>}
            title={t('delete.title')}
            onConfirm={() => remove(r.id)}
          />
        </div>
      ),
      width: '130px',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allLevels')}</SelectItem>
                {mahnungStatusList.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder={tc('actions.search')} value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64" />
            <Button onClick={() => setModal({ kind: 'create' })}>
              <Plus size={16} />
              {t('list.newMahnung')}
            </Button>
          </>
        }
      />

      {kandidaten.length > 0 ? (
        <Card className="mb-4 border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="mb-2 text-sm font-medium">
              {kandidaten.length === 1
                ? t('kandidaten.singular', { count: kandidaten.length })
                : t('kandidaten.plural', { count: kandidaten.length })}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {kandidaten.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-md border bg-background px-2 py-1">
                  <span className="num">{r.nummer}</span> · {customerById(r.customerId)?.name} · <Money value={offenerBetrag(r)} />
                </div>
              ))}
              {kandidaten.length > 6 ? (
                <div className="text-muted-foreground">{t('kandidaten.andMore', { n: kandidaten.length - 6 })}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => setModal({ kind: 'view', item: r })}
        emptyState={
          <EmptyState
            icon={Receipt}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={() => setModal({ kind: 'create' })}>
                <Plus size={16} />
                {t('list.newMahnung')}
              </Button>
            }
          />
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <MahnungForm onSubmit={(m) => { add(m); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <MahnungForm
              initial={modal.item}
              onSubmit={(m) => { update(modal.item.id, m); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? <MahnungView m={modal.item} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MahnungView({ m }: { m: Mahnung }) {
  const { t } = useT('mahnungen');
  const kunde = customerById(m.customerId);
  const r = rechnungById(m.rechnungId);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="num text-xs text-muted-foreground">{m.nummer}</div>
          <div className="mt-1 text-lg font-semibold">{kunde?.name ?? '—'}</div>
          <div className="num text-xs text-muted-foreground">{t('detail.invoiceRef')} {r?.nummer ?? '—'}</div>
        </div>
        <StatusBadge status={m.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.datum')}</div>
          <DateCell value={m.datum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.faellig')}</div>
          <DateCell value={m.faelligDatum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.openAmount')}</div>
          <div className="text-right"><Money value={m.offenerBetrag} /></div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.fee')}</div>
          <div className="text-right"><Money value={m.mahngebuehr} /></div>
        </div>
        <div className="col-span-2 border-t pt-3">
          <div className="text-xs text-muted-foreground">{t('detail.total')}</div>
          <div className="text-right text-lg font-semibold"><Money value={m.offenerBetrag + m.mahngebuehr} /></div>
        </div>
      </div>
      {m.notiz ? (
        <div className="rounded-md border p-3">
          <div className="mb-1 text-xs text-muted-foreground">{t('detail.note')}</div>
          {m.notiz}
        </div>
      ) : null}
    </div>
  );
}
