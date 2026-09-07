import { useMemo, useState } from 'react';
import { ClipboardList, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { toast } from '@/store/toast-store';
import { customerById, vehicleById } from '@/modules/shared/customers';
import { useBestellungen } from './store';
import { berechneSumme, bestellStatusList, type Bestellung } from './types';
import { BestellungForm } from './Form';
import { BestellungDetail } from './Detail';

type ModalMode = { kind: 'create' } | { kind: 'edit'; item: Bestellung } | { kind: 'view'; item: Bestellung } | null;

export function BestellungenList() {
  const { t } = useT('bestellungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const { items, add, update, remove } = useBestellungen();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('alle');
  const [modal, setModal] = useState<ModalMode>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((b) => {
      if (statusFilter !== 'alle' && b.status !== statusFilter) return false;
      if (!s) return true;
      const kunde = customerById(b.customerId)?.name.toLowerCase() ?? '';
      const fzg = vehicleById(b.vehicleId)?.kennzeichen.toLowerCase() ?? '';
      return b.nummer.toLowerCase().includes(s) || b.beschreibung.toLowerCase().includes(s) || kunde.includes(s) || fzg.includes(s);
    });
  }, [items, q, statusFilter]);

  const columns: Column<Bestellung>[] = [
    { key: 'nummer', header: t('cols.nummer'), sortValue: (r) => r.nummer, cell: (r) => <span className="num text-xs">{r.nummer}</span>, width: '130px' },
    { key: 'eingang', header: t('cols.eingang'), align: 'right', sortValue: (r) => r.eingangDatum, cell: (r) => <DateCell value={r.eingangDatum} />, width: '110px' },
    {
      key: 'kunde',
      header: t('cols.kunde'),
      sortValue: (r) => customerById(r.customerId)?.name ?? '',
      cell: (r) => <span className="font-medium">{customerById(r.customerId)?.name ?? '—'}</span>,
    },
    {
      key: 'fahrzeug',
      header: t('cols.fahrzeug'),
      sortValue: (r) => vehicleById(r.vehicleId)?.kennzeichen ?? '',
      cell: (r) => {
        const v = vehicleById(r.vehicleId);
        return v ? (
          <span>
            <span className="num text-xs">{v.kennzeichen}</span> <span className="text-muted-foreground">· {v.hersteller} {v.modell}</span>
          </span>
        ) : (
          '—'
        );
      },
    },
    { key: 'status', header: t('cols.status'), sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} />, width: '160px' },
    { key: 'brutto', header: t('cols.brutto'), align: 'right', sortValue: (r) => berechneSumme(r.positionen).brutto, cell: (r) => <Money value={berechneSumme(r.positionen).brutto} />, width: '120px' },
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
            onConfirm={() => { remove(r.id); toast.success(tc('toasts.deleted')); }}
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
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">{tc('filters.allStatus')}</SelectItem>
                {bestellStatusList.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={tc('actions.search')} value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64" />
            <Button onClick={() => setModal({ kind: 'create' })}>
              <Plus size={16} />
              {t('list.newOrder')}
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
          items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('empty.title')}
              description={t('empty.description')}
              action={
                <Button onClick={() => setModal({ kind: 'create' })}>
                  <Plus size={16} />
                  {t('list.newOrder')}
                </Button>
              }
            />
          ) : (
            <EmptyState icon={ClipboardList} title={tc('empty.noMatches')} description={tc('empty.noMatchesDescription')} />
          )
        }
      />

      <Dialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{t('form.newTitle')}</DialogTitle></DialogHeader>
          <BestellungForm onSubmit={(b) => { add(b); toast.success(tc('toasts.created')); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{t('form.editTitle')}</DialogTitle></DialogHeader>
          {modal?.kind === 'edit' ? (
            <BestellungForm
              initial={modal.item}
              onSubmit={(b) => { update(modal.item.id, b); toast.success(tc('toasts.saved')); setModal(null); }}
              onCancel={() => setModal(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={modal?.kind === 'view'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{t('detail.title')}</DialogTitle></DialogHeader>
          {modal?.kind === 'view' ? <BestellungDetail b={modal.item} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
