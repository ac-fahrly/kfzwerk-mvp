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
import { useStatusLabel } from '@/components/shared/status-badge';
import { terminSchema, type TerminInput } from './schema';
import { servicegruende, techniker, terminStatusList, type Termin } from './types';

type Props = {
  initial?: Termin;
  onSubmit: (t: Termin) => void;
  onCancel: () => void;
  defaultDate?: string;
};

export function TerminForm({ initial, onSubmit, onCancel, defaultDate }: Props) {
  const { t } = useT('termine');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TerminInput>({
    mode: 'onBlur',
    resolver: zodResolver(terminSchema),
    defaultValues:
      initial ??
      {
        id: newId(),
        customerId: '',
        vehicleId: '',
        datum: defaultDate ?? new Date().toISOString().slice(0, 10),
        von: '09:00',
        bis: '10:00',
        grund: 'Inspektion',
        techniker: 'Andreas',
        status: 'geplant',
        notiz: '',
      },
  });

  const customerId = watch('customerId');
  const status = watch('status');
  const grund = watch('grund');
  const tech = watch('techniker');
  const kundenFahrzeuge = customerId ? vehiclesForCustomer(customerId) : [];

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as Termin))} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField label={tc('form.date')}>
          <Input type="date" {...register('datum')} />
        </FormField>
        <FormField label={tc('form.from')} error={errors.von?.message}>
          <Input type="time" {...register('von')} />
        </FormField>
        <FormField label={tc('form.to')} error={errors.bis?.message}>
          <Input type="time" {...register('bis')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label={tc('form.kunde')} required error={errors.customerId?.message}>
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
        <FormField label={tc('form.fahrzeug')} required error={errors.vehicleId?.message}>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!customerId}>
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
        <FormField label={t('form.servicegrund')}>
          <Select value={grund} onValueChange={(v) => setValue('grund', v as Termin['grund'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {servicegruende.map((g) => <SelectItem key={g} value={g}>{tc(`grund.${g}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t('form.techniker')}>
          <Select value={tech} onValueChange={(v) => setValue('techniker', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {techniker.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={tc('form.status')}>
          <Select value={status} onValueChange={(v) => setValue('status', v as Termin['status'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {terminStatusList.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
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
