import { Car, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { useVehiclesForCustomer } from './store';
import type { Customer } from './types';

type Props = { customer: Customer; onEdit: () => void };

export function KundeDetail({ customer, onEdit }: Props) {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  const vehicles = useVehiclesForCustomer(customer.id);
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.title')}</div>
          <div className="mt-1 text-lg font-semibold">{customer.name}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil size={14} />
          {tc('actions.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">{t('detail.contact')}</div>
          {customer.email ? <div className="truncate">{customer.email}</div> : null}
          {customer.telefon ? <div className="num text-muted-foreground">{customer.telefon}</div> : null}
        </div>
        <div>
          <div className="mb-1 text-xs text-muted-foreground">{t('detail.address')}</div>
          {customer.strasse ? <div>{customer.strasse}</div> : null}
          {customer.plz || customer.ort ? (
            <div>
              <span className="num">{customer.plz}</span> {customer.ort}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('detail.vehicles')}
        </div>
        {vehicles.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            {t('detail.noVehicles')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {vehicles.map((v) => (
              <div key={v.id} className="rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-muted-foreground" />
                  <div className="num text-sm font-medium">{v.kennzeichen}</div>
                </div>
                <div className="mt-1 text-sm">
                  {v.hersteller} {v.modell}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  <span className="num">{v.baujahr}</span>
                  {v.vin ? <span className="num"> · {v.vin}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
