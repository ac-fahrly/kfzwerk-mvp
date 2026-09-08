import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/form-field';
import { Badge } from '@/components/ui/badge';
import { newId } from '@/lib/id';
import { useT } from '@/i18n';
import { customerWithVehiclesSchema, type CustomerWithVehiclesInput } from './schema';
import type { Customer, Vehicle } from './types';

type Props = {
  initial?: { customer: Customer; vehicles: Vehicle[] };
  onSubmit: (customer: Customer, vehicles: Vehicle[]) => void;
  onCancel: () => void;
};

export function KundeForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  const customerId = initial?.customer.id ?? newId();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CustomerWithVehiclesInput>({
    mode: 'onBlur',
    resolver: zodResolver(customerWithVehiclesSchema),
    defaultValues: initial ?? {
      customer: {
        id: customerId,
        name: '',
        email: '',
        telefon: '',
        strasse: '',
        plz: '',
        ort: '',
      },
      vehicles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'vehicles' });
  const vehiclesWatch = watch('vehicles');
  const submit = handleSubmit((v) => onSubmit(v.customer as Customer, v.vehicles as Vehicle[]));

  function addBlank() {
    append({
      id: newId(),
      customerId,
      kennzeichen: '',
      hersteller: '',
      modell: '',
      baujahr: new Date().getFullYear(),
      vin: '',
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('form.name')} required error={errors.customer?.name?.message}>
          <Input {...register('customer.name')} />
        </FormField>
        <FormField label={t('form.email')} error={errors.customer?.email?.message}>
          <Input type="email" {...register('customer.email')} />
        </FormField>
        <FormField label={t('form.telefon')}>
          <Input {...register('customer.telefon')} />
        </FormField>
        <FormField label={t('form.strasse')}>
          <Input {...register('customer.strasse')} />
        </FormField>
        <FormField label={t('form.plz')}>
          <Input {...register('customer.plz')} className="num" />
        </FormField>
        <FormField label={t('form.ort')}>
          <Input {...register('customer.ort')} />
        </FormField>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{t('form.vehicles')}</div>
            {fields.length > 0 ? <Badge variant="secondary" className="num">{fields.length}</Badge> : null}
          </div>
          {fields.length > 0 ? (
            <Button type="button" size="sm" variant="outline" onClick={addBlank}>
              <Plus size={14} />
              {t('form.addVehicle')}
            </Button>
          ) : null}
        </div>

        {fields.length === 0 ? (
          <button
            type="button"
            onClick={addBlank}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 hover:text-foreground"
          >
            <Car size={20} />
            <span>{t('detail.noVehicles')}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Plus size={12} />
              {t('form.addVehicle')}
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            {fields.map((f, i) => {
              const preview = vehiclesWatch?.[i];
              return (
                <div key={f.id} className="rounded-lg border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Car size={14} className="shrink-0 text-muted-foreground" />
                      <div className="num truncate text-sm font-medium">
                        {preview?.kennzeichen || t('form.kennzeichen')}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => remove(i)}
                      aria-label={tc('actions.remove')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t('form.kennzeichen')}
                      </label>
                      <Input
                        {...register(`vehicles.${i}.kennzeichen`)}
                        className="num h-8"
                        placeholder="M-AB 1234"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t('form.hersteller')}
                      </label>
                      <Input {...register(`vehicles.${i}.hersteller`)} className="h-8" placeholder="BMW" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t('form.modell')}
                      </label>
                      <Input {...register(`vehicles.${i}.modell`)} className="h-8" placeholder="320d" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t('form.baujahr')}
                      </label>
                      <Input type="number" {...register(`vehicles.${i}.baujahr`)} className="num h-8" />
                    </div>
                    <div className="md:col-span-12">
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t('form.vinOptional')}
                      </label>
                      <Input {...register(`vehicles.${i}.vin`)} className="num h-8" placeholder="WBA…" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tc('actions.cancel')}
        </Button>
        <Button type="submit">{initial ? tc('actions.save') : tc('actions.create')}</Button>
      </DialogFooter>
    </form>
  );
}
