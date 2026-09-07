import { useMemo, useState } from 'react';
import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { StatusBadge, useStatusLabel } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useRechnungen } from './store';
import { offenerBetrag, rechnungStatusList, type Rechnung } from './types';
import { RechnungForm } from './Form';
import { RechnungDetail } from './Detail';

type Modal = { kind: 'create' } | { kind: 'edit'; item: Rechnung } | { kind: 'view'; item: Rechnung } | null;

export function RechnungenList() {
  const { t } = useT('rechnungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useRechnungen();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [modal, setModal] = useState<Modal>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((r) => {
      if (statusFilter !== 'alle' && r.status !== statusFilter) return false;
      if (!s) return true;
      const kunde = customerById(r.customerId)?.name.toLowerCase() ?? '';
      return r.nummer.toLowerCase().includes(s) || kunde.includes(s) || r.notiz?.toLowerCase().includes(s);
    });
  }, [items, q, statusFilter]);

  const columns: Column<Rechnung>[] = [
    { key: 'nummer', header: t('cols.nummer'), sortValue: (r) => r.nummer, cell: (r) => <span className="num text-xs">{r.nummer}</span>, width: '140px' },
    { key: 'datum', header: t('cols.datum'), sortValue: (r) => r.datum, cell: (r) => <DateCell value={r.datum} />, width: '110px' },
    { key: 'kunde', header: t('cols.kunde'), sortValue: (r) => customerById(r.customerId)?.name ?? '', cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span> },
    { key: 'faellig', header: t('cols.faellig'), sortValue: (r) => r.faelligDatum, cell: (r) => <DateCell value={r.faelligDatum} />, width: '110px' },
    { key: 'status', header: t('cols.status'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, width: '150px' },
    { key: 'betrag', header: t('cols.gesamt'), align: 'right', sortValue: (r) => r.betrag, cell: (r) => <Money value={r.betrag} />, width: '120px' },
    { key: 'offen', header: t('cols.offen'), align: 'right', sortValue: (r) => offenerBetrag(r), cell: (r) => <Money value={offenerBetrag(r)} />, width: '120px' },
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
            description={t('delete.description', { nummer: r.nummer })}
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
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allStatus')}</SelectItem>
                {rechnungStatusList.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={tc('actions.search')} value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64" />
            <Button onClick={() => setModal({ kind: 'create' })}>
              <Plus size={16} />
              {t('list.newInvoice')}
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => setModal({ kind: 'view', item: r })}
        emptyState={
          <EmptyState
            icon={FileText}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={() => setModal({ kind: 'create' })}>
                <Plus size={16} />
                {t('list.newInvoice')}
              </Button>
            }
          />
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <RechnungForm onSubmit={(r) => { add(r); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <RechnungForm
              initial={modal.item}
              onSubmit={(r) => { update(modal.item.id, r); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? <RechnungDetail r={modal.item} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
