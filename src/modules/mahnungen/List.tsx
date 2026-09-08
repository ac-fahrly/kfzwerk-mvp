import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { TableToolbar } from '@/components/shared/table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { StatusBadge, useStatusLabel } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useRechnungen } from '@/modules/rechnungen/store';
import { rechnungById } from '@/modules/rechnungen/store';
import { istUeberfaellig, offenerBetrag } from '@/modules/rechnungen/types';
import { useMahnungen } from './store';
import { mahnungStatusList, type Mahnung } from './types';
import { MahnungForm } from './Form';

type Modal = { kind: 'create' } | { kind: 'edit'; item: Mahnung } | { kind: 'view'; item: Mahnung } | null;

const BASE = '/mahnungen';

export function MahnungenList() {
  const { t } = useT('mahnungen');
  const { t: tc } = useT('common');
  usePageTitle(t('list.title'));
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useMahnungen();
  const rechnungen = useRechnungen((s) => s.items);
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

  useEffect(() => {
    setFirstMatchPath(filtered.length > 0 ? `${BASE}/${filtered[0].id}` : null);
  }, [filtered, setFirstMatchPath]);

  function closeViewRoute() {
    setModal(null);
    if (id) navigate(BASE);
  }

  const columns: Column<Mahnung>[] = [
    { key: 'nummer', header: t('cols.nummer'), sortValue: (r) => r.nummer, cell: (r) => <span className="num text-xs">{r.nummer}</span>, csvValue: (r) => r.nummer, width: '130px' },
    { key: 'datum', header: t('cols.datum'), align: 'right', sortValue: (r) => r.datum, cell: (r) => <DateCell value={r.datum} />, csvValue: (r) => r.datum, width: '110px' },
    { key: 'kunde', header: t('cols.kunde'), sortValue: (r) => customerById(r.customerId)?.name ?? '', cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span>, csvValue: (r) => customerById(r.customerId)?.name ?? '' },
    { key: 'rechnung', header: t('cols.rechnung'), sortValue: (r) => rechnungById(r.rechnungId)?.nummer ?? '', cell: (r) => <span className="num text-xs text-muted-foreground">{rechnungById(r.rechnungId)?.nummer ?? '—'}</span>, csvValue: (r) => rechnungById(r.rechnungId)?.nummer ?? '', width: '140px' },
    { key: 'status', header: t('cols.stufe'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, csvValue: (r) => statusLabel(r.status), width: '190px' },
    { key: 'faellig', header: t('cols.faellig'), align: 'right', sortValue: (r) => r.faelligDatum, cell: (r) => <DateCell value={r.faelligDatum} />, csvValue: (r) => r.faelligDatum, width: '110px' },
    { key: 'offen', header: t('cols.offen'), align: 'right', sortValue: (r) => r.offenerBetrag, cell: (r) => <Money value={r.offenerBetrag} />, csvValue: (r) => r.offenerBetrag.toFixed(2), width: '120px' },
    { key: 'gebuehr', header: t('cols.gebuehr'), align: 'right', sortValue: (r) => r.mahngebuehr, cell: (r) => <Money value={r.mahngebuehr} />, csvValue: (r) => r.mahngebuehr.toFixed(2), width: '110px' },
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
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allLevels')}</SelectItem>
                {mahnungStatusList.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setModal({ kind: 'create' })}>
              <Plus size={16} />
              {t('list.newMahnung')}
            </Button>
          </>
        }
      />

      {kandidaten.length > 0 ? (
        <Card className="mb-4 border-warning/60 bg-warning/15 dark:bg-warning/20">
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

      <TableToolbar
        onExport={() => downloadCsv(`mahnungen-${new Date().toISOString().slice(0, 10)}`, columns, filtered)}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`${BASE}/${r.id}`)}
        emptyState={
          items.length === 0 ? (
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
          ) : (
            <EmptyState icon={Receipt} title={tc('empty.noMatches')} description={tc('empty.noMatchesDescription')} />
          )
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <MahnungForm onSubmit={(m) => { add(m); toast.success(tc('toasts.created')); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <MahnungForm
              initial={modal.item}
              onSubmit={(m) => { update(modal.item.id, m); toast.success(tc('toasts.saved')); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => { if (!o) closeViewRoute(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? (
            <MahnungView
              m={modal.item}
              onEdit={() => { const item = modal.item; setModal({ kind: 'edit', item }); if (id) navigate(BASE); }}
              onDismiss={closeViewRoute}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MahnungView({ m, onEdit, onDismiss }: { m: Mahnung; onEdit: () => void; onDismiss: () => void }) {
  const { t } = useT('mahnungen');
  const { t: tc } = useT('common');
  const kunde = customerById(m.customerId);
  const r = rechnungById(m.rechnungId);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="num text-xs text-muted-foreground">{m.nummer}</div>
          {kunde ? (
            <Link to={`/kunden/${kunde.id}`} onClick={() => onDismiss()} className="mt-1 block text-lg font-semibold text-primary hover:underline">
              {kunde.name}
            </Link>
          ) : (
            <div className="mt-1 text-lg font-semibold">—</div>
          )}
          <div className="num text-xs text-muted-foreground">
            {t('detail.invoiceRef')}{' '}
            {r ? (
              <Link to={`/rechnungen/${r.id}`} onClick={() => onDismiss()} className="text-primary hover:underline">
                {r.nummer}
              </Link>
            ) : (
              '—'
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={m.status} />
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil size={14} />
            {tc('actions.edit')}
          </Button>
        </div>
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
