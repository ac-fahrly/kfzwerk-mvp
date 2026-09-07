import { Pencil } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { useT } from '@/i18n';
import { customerById, vehicleById } from '@/modules/shared/customers';
import { berechneSumme, type Bestellung } from './types';

export function BestellungDetail({ b, onEdit }: { b: Bestellung; onEdit?: () => void }) {
  const { t } = useT('bestellungen');
  const { t: tc } = useT('common');
  const kunde = customerById(b.customerId);
  const fahrzeug = vehicleById(b.vehicleId);
  const s = berechneSumme(b.positionen);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="num text-xs text-muted-foreground">{b.nummer}</div>
          <div className="mt-1 text-lg font-semibold">{b.beschreibung}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={b.status} />
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              {tc('actions.edit')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{tc('form.kunde')}</div>
          <div className="font-medium">{kunde?.name ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{kunde?.telefon} · {kunde?.email}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{tc('form.fahrzeug')}</div>
          <div className="font-medium">
            {fahrzeug ? `${fahrzeug.kennzeichen} — ${fahrzeug.hersteller} ${fahrzeug.modell}` : '—'}
          </div>
          <div className="num text-xs text-muted-foreground">VIN {fahrzeug?.vin}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.eingang')}</div>
          <DateCell value={b.eingangDatum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.fertigstellung')}</div>
          {b.fertigstellungDatum ? <DateCell value={b.fertigstellungDatum} /> : <span className="text-muted-foreground">—</span>}
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              <th className="p-2 text-left">{t('form.art')}</th>
              <th className="p-2 text-left">{t('form.bezeichnung')}</th>
              <th className="p-2 text-right">{t('form.menge')}</th>
              <th className="p-2 text-right">{t('form.einzelpreis')}</th>
              <th className="p-2 text-right">{t('form.summe')}</th>
            </tr>
          </thead>
          <tbody>
            {b.positionen.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0">
                <td className="p-2 text-xs uppercase text-muted-foreground">
                  {p.kind === 'teil' ? t('form.kindTeil') : t('form.kindArbeit')}
                </td>
                <td className="p-2">{p.bezeichnung}</td>
                <td className="p-2 text-right"><span className="num">{formatNumber(p.menge)} {tc(`einheit.${p.einheit}`)}</span></td>
                <td className="p-2 text-right"><Money value={p.einzelpreis} /></td>
                <td className="p-2 text-right"><Money value={p.menge * p.einzelpreis} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/20 text-xs">
              <td colSpan={4} className="p-2 text-right text-muted-foreground">{tc('form.netto')}</td>
              <td className="p-2 text-right"><Money value={s.netto} /></td>
            </tr>
            <tr className="text-xs">
              <td colSpan={4} className="p-2 text-right text-muted-foreground">{tc('form.mwst')}</td>
              <td className="p-2 text-right"><Money value={s.mwst} /></td>
            </tr>
            <tr className="border-t font-semibold">
              <td colSpan={4} className="p-2 text-right">{tc('form.brutto')}</td>
              <td className="p-2 text-right"><Money value={s.brutto} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
