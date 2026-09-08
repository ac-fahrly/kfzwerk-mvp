import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { TableToolbar } from '@/components/shared/table-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm';
import { downloadCsv } from '@/lib/csv';
import { usePageTitle } from '@/lib/use-page-title';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';
import { useUiStore } from '@/store/ui-store';
import { useKunden, useVehicles } from './store';
import type { Customer } from './types';
import { KundeForm } from './Form';
import { KundeDetail } from './Detail';

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; customer: Customer }
  | { kind: 'view'; customer: Customer }
  | null;

const BASE = '/kunden';

export function KundenList() {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  usePageTitle(t('list.title'));
  const { customers, saveCustomerWithVehicles, removeCustomer } = useKunden();
  const vehicles = useVehicles();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const q = useUiStore((s) => s.listQuery);
  const setFirstMatchPath = useUiStore((s) => s.setFirstMatchPath);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (!id) {
      if (modal?.kind === 'view') setModal(null);
      return;
    }
    const customer = customers.find((x) => x.id === id);
    if (customer) setModal({ kind: 'view', customer });
    else navigate(BASE, { replace: true });
  }, [id, customers, navigate]);

  const vehiclesByCustomer = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of vehicles) m.set(v.customerId, (m.get(v.customerId) ?? 0) + 1);
    return m;
  }, [vehicles]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.ort.toLowerCase().includes(s) ||
        c.telefon.toLowerCase().includes(s),
    );
  }, [customers, q]);

  useEffect(() => {
    setFirstMatchPath(filtered.length > 0 ? `${BASE}/${filtered[0].id}` : null);
  }, [filtered, setFirstMatchPath]);

  function closeViewRoute() {
    setModal(null);
    if (id) navigate(BASE);
  }

  const columns: Column<Customer>[] = [
    { key: 'name', header: t('cols.name'), sortValue: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span>, csvValue: (r) => r.name },
    { key: 'kontakt', header: t('cols.kontakt'), sortValue: (r) => r.email, cell: (r) => (
      <div className="text-xs">
        <div>{r.email}</div>
        <div className="num text-muted-foreground">{r.telefon}</div>
      </div>
    ), csvValue: (r) => `${r.email} ${r.telefon}` },
    { key: 'ort', header: t('cols.ort'), sortValue: (r) => r.ort, cell: (r) => <span><span className="num text-xs text-muted-foreground">{r.plz}</span> {r.ort}</span>, csvValue: (r) => `${r.plz} ${r.ort}`, width: '160px' },
    {
      key: 'fahrzeuge',
      header: t('cols.fahrzeuge'),
      align: 'right',
      sortValue: (r) => vehiclesByCustomer.get(r.id) ?? 0,
      cell: (r) => {
        const n = vehiclesByCustomer.get(r.id) ?? 0;
        return n > 0 ? <Badge variant="secondary" className="num">{n}</Badge> : <span className="text-muted-foreground">—</span>;
      },
      csvValue: (r) => vehiclesByCustomer.get(r.id) ?? 0,
      width: '110px',
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      hideUntilHover: true,
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => setModal({ kind: 'edit', customer: r })} aria-label={tc('actions.edit')}>
            <Pencil size={16} />
          </Button>
          <ConfirmDialog
            trigger={<Button variant="ghost" size="icon" aria-label={tc('actions.delete')}><Trash2 size={16} /></Button>}
            title={t('delete.title')}
            description={t('delete.description', { name: r.name })}
            onConfirm={() => { removeCustomer(r.id); toast.success(tc('toasts.deleted')); }}
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
            {t('list.newCustomer')}
          </Button>
        }
      />

      <TableToolbar
        onExport={() => downloadCsv(`kunden-${new Date().toISOString().slice(0, 10)}`, columns, filtered)}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`${BASE}/${r.id}`)}
        emptyState={
          customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('empty.title')}
              description={t('empty.description')}
              action={
                <Button onClick={() => setModal({ kind: 'create' })}>
                  <Plus size={16} />
                  {t('list.newCustomer')}
                </Button>
              }
            />
          ) : (
            <EmptyState icon={Users} title={tc('empty.noMatches')} description={tc('empty.noMatchesDescription')} />
          )
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <KundeForm
            onSubmit={(c, v) => { saveCustomerWithVehicles(c, v); toast.success(tc('toasts.created')); setModal(null); }}
            onCancel={() => setModal(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <KundeForm
              initial={{ customer: modal.customer, vehicles: vehicles.filter((v) => v.customerId === modal.customer.id) }}
              onSubmit={(c, v) => { saveCustomerWithVehicles(c, v); toast.success(tc('toasts.saved')); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => { if (!o) closeViewRoute(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? (
            <KundeDetail
              customer={modal.customer}
              onEdit={() => { const c = modal.customer; setModal({ kind: 'edit', customer: c }); if (id) navigate(BASE); }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
