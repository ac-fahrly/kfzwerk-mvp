import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, ChevronDown, ChevronUp, Pencil, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { StatusBadge } from '@/components/shared/status-badge';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  useBestellungenForCustomer,
  useBestellungenForVehicle,
  useMahnungenForCustomer,
  useOpenAmountForCustomer,
  useRechnungenForCustomer,
  useTermineForCustomer,
} from '@/modules/shared/queries';
import { berechneSumme } from '@/modules/bestellungen/types';
import { offenerBetrag } from '@/modules/rechnungen/types';
import { useVehiclesForCustomer } from './store';
import type { Customer, Vehicle } from './types';

type Props = { customer: Customer; onEdit: () => void };

export function KundeDetail({ customer, onEdit }: Props) {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  const vehicles = useVehiclesForCustomer(customer.id);

  const bestellungen = useBestellungenForCustomer(customer.id);
  const rechnungen = useRechnungenForCustomer(customer.id);
  const mahnungen = useMahnungenForCustomer(customer.id);
  const termine = useTermineForCustomer(customer.id);

  const { sum: openAmount, count: openInvoiceCount } = useOpenAmountForCustomer(customer.id);

  const activeOrders = bestellungen.filter((b) => b.status !== 'abgeholt' && b.status !== 'storniert');
  const openInvoices = rechnungen.filter((r) => r.status !== 'bezahlt' && r.status !== 'entwurf');
  const activeReminders = mahnungen.filter((m) => m.status !== 'erledigt');

  const now = Date.now();
  const upcomingAppointments = termine
    .filter((x) => new Date(x.datum).getTime() >= now - 86_400_000 && x.status !== 'abgesagt')
    .sort((a, b) => (a.datum + a.von).localeCompare(b.datum + b.von));
  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.title')}</div>
          <div className="mt-1 text-lg font-semibold">{customer.name}</div>
          {customer.email ? <div className="text-xs text-muted-foreground">{customer.email}</div> : null}
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil size={14} />
          {tc('actions.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          label={t('detail.kpi.openAmount')}
          value={<Money value={openAmount} />}
          sub={openInvoiceCount > 0 ? `${openInvoiceCount}` : undefined}
          accent={openAmount > 0 ? 'destructive' : undefined}
        />
        <Kpi label={t('detail.kpi.activeOrders')} value={<span className="num">{activeOrders.length}</span>} />
        <Kpi
          label={t('detail.kpi.nextAppointment')}
          value={
            nextAppointment ? (
              <span className="num text-sm">
                <DateCell value={nextAppointment.datum} /> · {nextAppointment.von}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )
          }
        />
        <Kpi label={t('detail.kpi.vehicleCount')} value={<span className="num">{vehicles.length}</span>} />
      </div>

      <Section
        title={t('detail.vehicles')}
        count={vehicles.length}
        empty={t('detail.noVehicles')}
        hasItems={vehicles.length > 0}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Section>

      <Section
        title={t('detail.sections.activeOrders')}
        count={activeOrders.length}
        empty={t('detail.sections.noActiveOrders')}
        hasItems={activeOrders.length > 0}
      >
        <div className="rounded-md border">
          {activeOrders.map((b) => (
            <Link
              key={b.id}
              to={`/bestellungen/${b.id}`}
              className="flex items-center justify-between gap-3 border-b p-2 text-sm last:border-b-0 hover:bg-accent/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="num text-xs text-muted-foreground">{b.nummer}</span>
                <span className="truncate">{b.beschreibung}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={b.status} />
                <Money value={berechneSumme(b.positionen).brutto} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title={t('detail.sections.openInvoices')}
        count={openInvoices.length}
        empty={t('detail.sections.noOpenInvoices')}
        hasItems={openInvoices.length > 0}
      >
        <div className="rounded-md border">
          {openInvoices.map((r) => (
            <Link
              key={r.id}
              to={`/rechnungen/${r.id}`}
              className="flex items-center justify-between gap-3 border-b p-2 text-sm last:border-b-0 hover:bg-accent/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="num text-xs text-muted-foreground">{r.nummer}</span>
                <DateCell value={r.datum} />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={r.status} />
                <Money value={offenerBetrag(r)} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {activeReminders.length > 0 ? (
        <Section
          title={t('detail.sections.activeReminders')}
          count={activeReminders.length}
          empty={t('detail.sections.noActiveReminders')}
          hasItems
        >
          <div className="rounded-md border border-destructive/40 bg-destructive/5">
            {activeReminders.map((m) => (
              <Link
                key={m.id}
                to={`/mahnungen/${m.id}`}
                className="flex items-center justify-between gap-3 border-b p-2 text-sm last:border-b-0 hover:bg-destructive/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="num text-xs text-muted-foreground">{m.nummer}</span>
                  <DateCell value={m.faelligDatum} />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={m.status} />
                  <Money value={m.offenerBetrag + m.mahngebuehr} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        title={t('detail.sections.upcomingAppointments')}
        count={upcomingAppointments.length}
        empty={t('detail.sections.noUpcomingAppointments')}
        hasItems={upcomingAppointments.length > 0}
      >
        <div className="rounded-md border">
          {upcomingAppointments.slice(0, 5).map((x) => (
            <Link
              key={x.id}
              to={`/termine/${x.id}`}
              className="flex items-center justify-between gap-3 border-b p-2 text-sm last:border-b-0 hover:bg-accent/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="num text-xs">
                  <DateCell value={x.datum} /> · {x.von}
                </span>
                <span className="truncate">{tc(`grund.${x.grund}`)}</span>
              </div>
              <StatusBadge status={x.status} />
            </Link>
          ))}
        </div>
      </Section>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('detail.sections.serviceHistory')}
        </div>
        {bestellungen.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            {t('detail.sections.noHistory')}
          </div>
        ) : (
          <div className="rounded-md border">
            {bestellungen
              .slice()
              .sort((a, b) => b.eingangDatum.localeCompare(a.eingangDatum))
              .slice(0, 10)
              .map((b) => (
                <Link
                  key={b.id}
                  to={`/bestellungen/${b.id}`}
                  className="flex items-center justify-between gap-3 border-b p-2 text-sm last:border-b-0 hover:bg-accent/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <DateCell value={b.eingangDatum} />
                    <span className="num text-xs text-muted-foreground">{b.nummer}</span>
                    <span className="truncate">{b.beschreibung}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={b.status} />
                    <Money value={berechneSumme(b.positionen).brutto} />
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: 'destructive' | 'warning';
}) {
  const accentClass = accent === 'destructive' ? 'bg-destructive' : accent === 'warning' ? 'bg-warning' : 'bg-transparent';
  return (
    <div className="relative overflow-hidden rounded-md border p-3">
      <div className={cn('absolute inset-y-0 left-0 w-0.5', accentClass)} />
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Section({
  title,
  count,
  hasItems,
  empty,
  children,
}: {
  title: string;
  count: number;
  hasItems: boolean;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
        {count > 0 ? <Badge variant="secondary" className="num">{count}</Badge> : null}
      </div>
      {hasItems ? (
        children
      ) : (
        <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
          {empty}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  const [open, setOpen] = useState(false);
  const history = useBestellungenForVehicle(vehicle.id);
  const sorted = history.slice().sort((a, b) => b.eingangDatum.localeCompare(a.eingangDatum));
  return (
    <div className="rounded-md border">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Car size={14} className="text-muted-foreground" />
          <div className="num text-sm font-medium">{vehicle.kennzeichen}</div>
        </div>
        <div className="mt-1 text-sm">
          {vehicle.hersteller} {vehicle.modell}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          <span className="num">{vehicle.baujahr}</span>
          {vehicle.vin ? <span className="num"> · {vehicle.vin}</span> : null}
        </div>
        {history.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Wrench size={12} />
            {open ? t('detail.sections.hideHistory') : t('detail.sections.showHistory')}
            <span className="num">({history.length})</span>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        ) : null}
      </div>
      {open && sorted.length > 0 ? (
        <div className="border-t bg-muted/20">
          {sorted.slice(0, 8).map((b) => (
            <Link
              key={b.id}
              to={`/bestellungen/${b.id}`}
              className="flex items-center justify-between gap-2 border-b border-border/50 p-2 text-xs last:border-b-0 hover:bg-accent/40"
            >
              <div className="flex min-w-0 items-center gap-2">
                <DateCell value={b.eingangDatum} className="text-[10px]" />
                <span className="truncate">{b.beschreibung}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={b.status} />
                <Money value={berechneSumme(b.positionen).brutto} />
              </div>
            </Link>
          ))}
        </div>
      ) : null}
      {open && sorted.length === 0 ? (
        <div className="border-t bg-muted/20 p-2 text-center text-xs text-muted-foreground">
          {tc('command.empty')}
        </div>
      ) : null}
    </div>
  );
}
