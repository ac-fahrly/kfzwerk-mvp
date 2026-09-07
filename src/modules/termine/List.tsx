import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar as CalIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { TableToolbar } from '@/components/shared/table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { DateCell, TimeCell } from '@/components/shared/date-cell';
import { StatusBadge, useStatusLabel } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm';
import { downloadCsv } from '@/lib/csv';
import { usePageTitle } from '@/lib/use-page-title';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';
import { customerById, vehicleById } from '@/modules/shared/customers';
import { useTermine } from './store';
import { terminStatusList, type Termin } from './types';
import { TerminForm } from './Form';
import { TermineCalendar } from './Calendar';

type Modal =
  | { kind: 'create'; defaultDate?: string }
  | { kind: 'edit'; item: Termin }
  | { kind: 'view'; item: Termin }
  | null;

const BASE = '/termine';

export function TermineList() {
  const { t } = useT('termine');
  const { t: tc } = useT('common');
  usePageTitle(t('list.title'));
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useTermine();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
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
      const fzg = vehicleById(r.vehicleId)?.kennzeichen.toLowerCase() ?? '';
      return kunde.includes(s) || fzg.includes(s) || r.grund.toLowerCase().includes(s) || r.techniker.toLowerCase().includes(s);
    });
  }, [items, q, statusFilter]);

  function closeViewRoute() {
    setModal(null);
    if (id) navigate(BASE);
  }

  const columns: Column<Termin>[] = [
    { key: 'datum', header: t('cols.datum'), align: 'right', sortValue: (r) => `${r.datum} ${r.von}`, cell: (r) => <DateCell value={r.datum} />, csvValue: (r) => r.datum, width: '110px' },
    { key: 'zeit', header: t('cols.zeit'), align: 'right', sortValue: (r) => r.von, cell: (r) => (
      <span className="num"><TimeCell value={`${r.datum}T${r.von}`} />–<TimeCell value={`${r.datum}T${r.bis}`} /></span>
    ), csvValue: (r) => `${r.von}-${r.bis}`, width: '130px' },
    { key: 'kunde', header: t('cols.kunde'), sortValue: (r) => customerById(r.customerId)?.name ?? '', cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span>, csvValue: (r) => customerById(r.customerId)?.name ?? '' },
    { key: 'fahrzeug', header: t('cols.fahrzeug'), sortValue: (r) => vehicleById(r.vehicleId)?.kennzeichen ?? '', cell: (r) => {
      const v = vehicleById(r.vehicleId);
      return v ? <span className="num text-xs">{v.kennzeichen}</span> : '—';
    }, csvValue: (r) => vehicleById(r.vehicleId)?.kennzeichen ?? '', width: '140px' },
    { key: 'grund', header: t('cols.grund'), sortValue: (r) => r.grund, cell: (r) => <Badge variant="secondary">{tc(`grund.${r.grund}`)}</Badge>, csvValue: (r) => r.grund, width: '170px' },
    { key: 'tech', header: t('cols.techniker'), sortValue: (r) => r.techniker, cell: (r) => r.techniker, csvValue: (r) => r.techniker, width: '110px' },
    { key: 'status', header: t('cols.status'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, csvValue: (r) => statusLabel(r.status), width: '140px' },
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
          <Button onClick={() => setModal({ kind: 'create' })}>
            <Plus size={16} />
            {t('list.newAppointment')}
          </Button>
        }
      />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">{t('list.calendarTab')}</TabsTrigger>
          <TabsTrigger value="list">{t('list.listTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <TermineCalendar
            termine={items}
            onCreate={(iso) => setModal({ kind: 'create', defaultDate: iso })}
            onOpen={(x) => navigate(`${BASE}/${x.id}`)}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allStatus')}</SelectItem>
                {terminStatusList.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={tc('actions.search')} value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64" />
          </div>

          <TableToolbar
            onExport={() => downloadCsv(`termine-${new Date().toISOString().slice(0, 10)}`, columns, filtered)}
          />

          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(r) => r.id}
            onRowClick={(r) => navigate(`${BASE}/${r.id}`)}
            emptyState={
              items.length === 0 ? (
                <EmptyState
                  icon={CalIcon}
                  title={t('empty.title')}
                  description={t('empty.description')}
                  action={
                    <Button onClick={() => setModal({ kind: 'create' })}>
                      <Plus size={16} />
                      {t('list.newAppointment')}
                    </Button>
                  }
                />
              ) : (
                <EmptyState icon={CalIcon} title={tc('empty.noMatches')} description={tc('empty.noMatchesDescription')} />
              )
            }
          />
        </TabsContent>
      </Tabs>

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <TerminForm
            defaultDate={modal?.kind === 'create' ? modal.defaultDate : undefined}
            onSubmit={(x) => { add(x); toast.success(tc('toasts.created')); setModal(null); }}
            onCancel={() => setModal(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <TerminForm
              initial={modal.item}
              onSubmit={(x) => { update(modal.item.id, x); toast.success(tc('toasts.saved')); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => { if (!o) closeViewRoute(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? (
            <TerminView
              termin={modal.item}
              onEdit={() => { const item = modal.item; setModal({ kind: 'edit', item }); if (id) navigate(BASE); }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TerminView({ termin, onEdit }: { termin: Termin; onEdit: () => void }) {
  const { t: tt } = useT('termine');
  const { t: tc } = useT('common');
  const kunde = customerById(termin.customerId);
  const fzg = vehicleById(termin.vehicleId);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{tt('detail.title')}</div>
          <div className="num text-lg font-semibold">
            <DateCell value={termin.datum} /> · {termin.von}–{termin.bis}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={termin.status} />
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil size={14} />
            {tc('actions.edit')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
        <div>
          <div className="text-xs text-muted-foreground">{tc('form.kunde')}</div>
          <div className="font-medium">{kunde?.name ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{kunde?.telefon}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{tc('form.fahrzeug')}</div>
          <div>{fzg ? `${fzg.kennzeichen} — ${fzg.hersteller} ${fzg.modell}` : '—'}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{tt('detail.grund')}</div>
          <div>{tc(`grund.${termin.grund}`)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{tt('detail.techniker')}</div>
          <div>{termin.techniker}</div>
        </div>
      </div>
      {termin.notiz ? (
        <div className="rounded-md border p-3">
          <div className="mb-1 text-xs text-muted-foreground">{tc('form.note')}</div>
          {termin.notiz}
        </div>
      ) : null}
    </div>
  );
}
