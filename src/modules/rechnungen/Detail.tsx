import { Pencil, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/status-badge';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { customerById, vehicleById } from '@/modules/shared/customers';
import { offenerBetrag, type Rechnung } from './types';

type Props = { r: Rechnung; onEdit?: () => void; onDismiss?: () => void };

export function RechnungDetail({ r, onEdit, onDismiss }: Props) {
  const { t } = useT('rechnungen');
  const { t: tc } = useT('common');
  const kunde = customerById(r.customerId);
  const fahrzeug = r.vehicleId ? vehicleById(r.vehicleId) : undefined;
  return (
    <div className="print-area space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="num text-xs text-muted-foreground">{r.nummer}</div>
          {kunde ? (
            <Link
              to={`/kunden/${kunde.id}`}
              onClick={() => onDismiss?.()}
              className="mt-1 block text-lg font-semibold text-primary hover:underline"
            >
              {kunde.name}
            </Link>
          ) : (
            <div className="mt-1 text-lg font-semibold">—</div>
          )}
          {fahrzeug ? (
            <div className="text-sm text-muted-foreground">
              <span className="num">{fahrzeug.kennzeichen}</span> · {fahrzeug.hersteller} {fahrzeug.modell}
            </div>
          ) : null}
        </div>
        <div className="no-print flex items-center gap-2">
          <StatusBadge status={r.status} />
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              {tc('actions.edit')}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={14} />
            {t('detail.print')}
          </Button>
        </div>
      </div>

      {kunde ? (
        <div className="hidden print:block">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{t('detail.invoiceTo')}</div>
          <div className="mt-1 text-sm">
            <div>{kunde.name}</div>
            <div>{kunde.strasse}</div>
            <div>{kunde.plz} {kunde.ort}</div>
          </div>
        </div>
      ) : null}

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
