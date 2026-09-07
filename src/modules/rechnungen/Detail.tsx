import { StatusBadge } from '@/components/shared/status-badge';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { useT } from '@/i18n';
import { customerById, vehicleById } from '@/modules/shared/customers';
import { offenerBetrag, type Rechnung } from './types';

export function RechnungDetail({ r }: { r: Rechnung }) {
  const { t } = useT('rechnungen');
  const kunde = customerById(r.customerId);
  const fahrzeug = r.vehicleId ? vehicleById(r.vehicleId) : undefined;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="num text-xs text-muted-foreground">{r.nummer}</div>
          <div className="mt-1 text-lg font-semibold">{kunde?.name ?? '—'}</div>
          {fahrzeug ? (
            <div className="text-sm text-muted-foreground">
              <span className="num">{fahrzeug.kennzeichen}</span> · {fahrzeug.hersteller} {fahrzeug.modell}
            </div>
          ) : null}
        </div>
        <StatusBadge status={r.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.invoiceDate')}</div>
          <DateCell value={r.datum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.faellig')}</div>
          <DateCell value={r.faelligDatum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.gesamt')}</div>
          <div className="text-right"><Money value={r.betrag} /></div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.paid')}</div>
          <div className="text-right"><Money value={r.bezahltBetrag} /></div>
        </div>
        <div className="col-span-2 border-t pt-3">
          <div className="text-xs text-muted-foreground">{t('detail.openAmount')}</div>
          <div className="text-right text-lg font-semibold"><Money value={offenerBetrag(r)} /></div>
        </div>
      </div>

      {r.notiz ? (
        <div className="rounded-md border p-4 text-sm">
          <div className="mb-1 text-xs text-muted-foreground">{t('detail.note')}</div>
          {r.notiz}
        </div>
      ) : null}
    </div>
  );
}
