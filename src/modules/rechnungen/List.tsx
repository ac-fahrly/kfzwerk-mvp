import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { TableToolbar } from '@/components/shared/table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { StatusBadge, useStatusLabel } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm';
import { downloadCsv } from '@/lib/csv';
import { usePageTitle } from '@/lib/use-page-title';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';
import { useUiStore } from '@/store/ui-store';
import { customerById } from '@/modules/shared/customers';
import { useRechnungen } from './store';
import { istUeberfaellig, offenerBetrag, rechnungStatusList, type Rechnung } from './types';
import { RechnungForm } from './Form';
import { RechnungDetail } from './Detail';

type Modal = { kind: 'create' } | { kind: 'edit'; item: Rechnung } | { kind: 'view'; item: Rechnung } | null;

const BASE = '/rechnungen';
const MS_DAY = 86_400_000;

function daysOverdue(r: Rechnung): number {
  const due = new Date(r.faelligDatum).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - due) / MS_DAY));
}

export function RechnungenList() {
  const { t } = useT('rechnungen');
  const { t: tc } = useT('common');
  usePageTitle(t('list.title'));
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useRechnungen();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const q = useUiStore((s) => s.listQuery);
  const setFirstMatchPath = useUiStore((s) => s.setFirstMatchPath);
  const [statusFilter, setStatusFilter] = useState('alle');
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (!id) {
      if (modal?.kind === 'view') setModal(null);
      return;
    }
    const item = items.find((x) => x.id === id);
    if (item) setModal({ kind: 'view', item });
    else navigate(BASE, { replace: true });
  }, [id, items, navigate]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((r) => {
      if (statusFilter !== 'alle' && r.status !== statusFilter) return false;
      if (!s) return true;
      const kunde = customerById(r.customerId)?.name.toLowerCase() ?? '';
      return r.nummer.toLowerCase().includes(s) || kunde.includes(s) || r.notiz?.toLowerCase().includes(s);
    });
  }, [items, q, statusFilter]);

  useEffect(() => {
    setFirstMatchPath(filtered.length > 0 ? `${BASE}/${filtered[0].id}` : null);
  }, [filtered, setFirstMatchPath]);

  function closeViewRoute() {
    setModal(null);
    if (id) navigate(BASE);
  }

  const columns: Column<Rechnung>[] = [
    { key: 'nummer', header: t('cols.nummer'), sortValue: (r) => r.nummer, cell: (r) => <span className="num text-xs">{r.nummer}</span>, csvValue: (r) => r.nummer, width: '140px' },
    { key: 'datum', header: t('cols.datum'), align: 'right', sortValue: (r) => r.datum, cell: (r) => <DateCell value={r.datum} />, csvValue: (r) => r.datum, width: '110px' },
    { key: 'kunde', header: t('cols.kunde'), sortValue: (r) => customerById(r.customerId)?.name ?? '', cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span>, csvValue: (r) => customerById(r.customerId)?.name ?? '' },
    {
      key: 'faellig',
      header: t('cols.faellig'),
      align: 'right',
      sortValue: (r) => r.faelligDatum,
      cell: (r) => {
        const over = istUeberfaellig(r);
        const days = over ? daysOverdue(r) : 0;
        return (
          <div className="flex flex-col items-end leading-tight">
            <DateCell value={r.faelligDatum} />
            {over ? (
              <span className="num inline-flex items-center gap-0.5 text-[10px] font-medium text-destructive">
                <AlertCircle size={10} />
                {t('cols.overdueDays', { n: days })}
              </span>
            ) : null}
          </div>
        );
      },
      csvValue: (r) => r.faelligDatum,
      width: '120px',
    },
    { key: 'status', header: t('cols.status'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, csvValue: (r) => statusLabel(r.status), width: '150px' },
    { key: 'betrag', header: t('cols.gesamt'), align: 'right', sortValue: (r) => r.betrag, cell: (r) => <Money value={r.betrag} />, csvValue: (r) => r.betrag.toFixed(2), width: '120px' },
    { key: 'offen', header: t('cols.offen'), align: 'right', sortValue: (r) => offenerBetrag(r), cell: (r) => <Money value={offenerBetrag(r)} />, csvValue: (r) => offenerBetrag(r).toFixed(2), width: '120px' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      hideUntilHover: true,
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => setModal({ kind: 'edit', item: r })} aria-label={tc('actions.edit')}><Pencil size={16} /></Button>
          <ConfirmDialog
            trigger={<Button variant="ghost" size="icon" aria-label={tc('actions.delete')}><Trash2 size={16} /></Button>}
            title={t('delete.title')}
            description={t('delete.description', { nummer: r.nummer })}
            onConfirm={() => { remove(r.id); toast.success(tc('toasts.deleted')); }}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allStatus')}</SelectItem>
                {rechnungStatusList.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setModal({ kind: 'create' })}>
              <Plus size={16} />
              {t('list.newInvoice')}
            </Button>
          </>
        }
      />

      <TableToolbar
        onExport={() => downloadCsv(`rechnungen-${new Date().toISOString().slice(0, 10)}`, columns, filtered)}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`${BASE}/${r.id}`)}
        emptyState={
          items.length === 0 ? (
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
          ) : (
            <EmptyState icon={FileText} title={tc('empty.noMatches')} description={tc('empty.noMatchesDescription')} />
          )
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <RechnungForm onSubmit={(r) => { add(r); toast.success(tc('toasts.created')); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <RechnungForm
              initial={modal.item}
              onSubmit={(r) => { update(modal.item.id, r); toast.success(tc('toasts.saved')); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => { if (!o) closeViewRoute(); }}>
        <DialogContent className="max-w-2xl print:max-w-none print:shadow-none">
          <DialogHeader className="print:hidden"><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? (
            <RechnungDetail
              r={modal.item}
              onEdit={() => { const item = modal.item; setModal({ kind: 'edit', item }); if (id) navigate(BASE); }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
