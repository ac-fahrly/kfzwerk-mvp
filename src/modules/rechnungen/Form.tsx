import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/form-field';
import { newId } from '@/lib/id';
import { useT } from '@/i18n';
import { customers, vehiclesForCustomer } from '@/modules/shared/customers';
import { useBestellungen } from '@/modules/bestellungen/store';
import { berechneSumme } from '@/modules/bestellungen/types';
import { useStatusLabel } from '@/components/shared/status-badge';
import { rechnungSchema, type RechnungInput } from './schema';
import { rechnungStatusList, type Rechnung } from './types';
import { nextRechnungNummer } from './store';

type Props = {
  initial?: Rechnung;
  onSubmit: (r: Rechnung) => void;
  onCancel: () => void;
};

export function RechnungForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useT('rechnungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const bestellungen = useBestellungen((s) => s.items);
  const today = new Date();
  const in14 = new Date(today.getTime() + 14 * 86400_000);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RechnungInput>({
    resolver: zodResolver(rechnungSchema),
    defaultValues:
      initial ??
      {
        id: newId(),
        nummer: nextRechnungNummer(),
        bestellungId: '',
        customerId: '',
        vehicleId: '',
        datum: today.toISOString().slice(0, 10),
        faelligDatum: in14.toISOString().slice(0, 10),
        betrag: 0,
        bezahltBetrag: 0,
        status: 'entwurf',
        notiz: '',
      },
  });

  const customerId = watch('customerId');
  const status = watch('status');
  const bestellungId = watch('bestellungId');
  const kundenFahrzeuge = customerId ? vehiclesForCustomer(customerId) : [];

  function fillFromBestellung(id: string) {
    const b = bestellungen.find((x) => x.id === id);
    if (!b) return;
    setValue('bestellungId', b.id);
    setValue('customerId', b.customerId);
    setValue('vehicleId', b.vehicleId);
    setValue('betrag', Number(berechneSumme(b.positionen).brutto.toFixed(2)));
  }

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as Rechnung))} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.nummer')}>
          <Input {...register('nummer')} className="num" />
        </FormField>
        <FormField label={t('form.datum')}>
          <Input type="date" {...register('datum')} />
        </FormField>
        <FormField label={t('form.faellig')}>
          <Input type="date" {...register('faelligDatum')} />
        </FormField>
      </div>

      <FormField label={t('form.fromOrder')} hint={t('form.fromOrderHint')}>
        <Select value={bestellungId ?? ''} onValueChange={(v) => fillFromBestellung(v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('form.fromOrderPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {bestellungen.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.nummer} — {b.beschreibung}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label={tc('form.kunde')} error={errors.customerId?.message}>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => { field.onChange(v); setValue('vehicleId', ''); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tc('form.chooseCustomer')} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label={t('form.vehicleOptional')}>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={!customerId}>
                <SelectTrigger>
                  <SelectValue placeholder={customerId ? tc('form.chooseVehicle') : tc('form.chooseCustomerFirst')} />
                </SelectTrigger>
                <SelectContent>
                  {kundenFahrzeuge.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.kennzeichen} — {v.hersteller} {v.modell}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.amount')}>
          <Input type="number" step="0.01" {...register('betrag')} />
        </FormField>
        <FormField label={t('form.paid')}>
          <Input type="number" step="0.01" {...register('bezahltBetrag')} />
        </FormField>
        <FormField label={tc('form.status')}>
          <Select value={status} onValueChange={(v) => setValue('status', v as Rechnung['status'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {rechnungStatusList.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label={tc('form.note')}>
        <Textarea rows={2} {...register('notiz')} />
      </FormField>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>{tc('actions.cancel')}</Button>
        <Button type="submit">{initial ? tc('actions.save') : tc('actions.create')}</Button>
      </DialogFooter>
    </form>
  );
}
