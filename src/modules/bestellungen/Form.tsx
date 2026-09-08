import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/form-field';
import { Money } from '@/components/shared/money';
import { newId } from '@/lib/id';
import { useCustomers, useVehiclesForCustomer } from '@/modules/shared/customers';
import { KundeQuickAdd } from '@/modules/kunden';
import { useTeile } from '@/modules/teile/store';
import { useT } from '@/i18n';
import { useStatusLabel } from '@/components/shared/status-badge';
import { bestellungSchema, type BestellungInput } from './schema';
import { berechneSumme, bestellStatusList, type Bestellung } from './types';
import { nextBestellNummer } from './store';

type Props = {
  initial?: Bestellung;
  onSubmit: (b: Bestellung) => void;
  onCancel: () => void;
};

export function BestellungForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useT('bestellungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const teile = useTeile((s) => s.items);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BestellungInput>({
    mode: 'onBlur',
    resolver: zodResolver(bestellungSchema),
    defaultValues:
      initial ??
      {
        id: newId(),
        nummer: nextBestellNummer(),
        customerId: '',
        vehicleId: '',
        status: 'neu',
        eingangDatum: new Date().toISOString().slice(0, 10),
        fertigstellungDatum: '',
        beschreibung: '',
        positionen: [
          { id: newId(), kind: 'arbeit', bezeichnung: '', menge: 1, einheit: 'h', einzelpreis: 95 },
        ],
      },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'positionen' });
  const positionen = watch('positionen');
  const customerId = watch('customerId');
  const status = watch('status');
  const summen = berechneSumme(positionen as BestellungInput['positionen']);

  const customers = useCustomers();
  const kundenFahrzeuge = useVehiclesForCustomer(customerId ?? '');

  function addTeilPosition(teilId: string) {
    const x = teile.find((y) => y.id === teilId);
    if (!x) return;
    append({
      id: newId(),
      kind: 'teil',
      teilId: x.id,
      bezeichnung: x.bezeichnung,
      menge: 1,
      einheit: x.einheit,
      einzelpreis: x.vkPreis,
    });
  }

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as Bestellung))} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.nummer')}>
          <Input {...register('nummer')} className="num" />
        </FormField>
        <FormField label={t('form.eingang')}>
          <Input type="date" {...register('eingangDatum')} />
        </FormField>
        <FormField label={tc('form.status')}>
          <Select value={status} onValueChange={(v) => setValue('status', v as Bestellung['status'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bestellStatusList.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label={tc('form.kunde')} required error={errors.customerId?.message}>
          <div className="flex gap-2">
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue('vehicleId', '');
                  }}
                >
                  <SelectTrigger className="flex-1">
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
            <KundeQuickAdd
              onCreated={(c, vs) => {
                setValue('customerId', c.id);
                if (vs.length === 1) setValue('vehicleId', vs[0].id);
                else setValue('vehicleId', '');
              }}
            />
          </div>
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

      <FormField label={t('form.beschreibung')} required error={errors.beschreibung?.message}>
        <Textarea rows={2} {...register('beschreibung')} />
      </FormField>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">{t('form.positionen')}</div>
          <div className="flex gap-2">
            <Select onValueChange={(v) => addTeilPosition(v)}>
              <SelectTrigger className="h-8 w-[240px] text-xs">
                <SelectValue placeholder={t('form.addPart')} />
              </SelectTrigger>
              <SelectContent>
                {teile.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.artikelnr} · {x.bezeichnung}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                append({ id: newId(), kind: 'arbeit', bezeichnung: '', menge: 1, einheit: 'h', einzelpreis: 95 })
              }
            >
              <Plus size={14} />
              {t('form.addWork')}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="p-2 text-left">{t('form.art')}</th>
                <th className="p-2 text-left">{t('form.bezeichnung')}</th>
                <th className="p-2 text-right">{t('form.menge')}</th>
                <th className="p-2 text-left">{t('form.einheit')}</th>
                <th className="p-2 text-right">{t('form.einzelpreis')}</th>
                <th className="p-2 text-right">{t('form.summe')}</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const p = positionen[i];
                const total = (p?.menge ?? 0) * (p?.einzelpreis ?? 0);
                return (
                  <tr key={f.id} className="border-b last:border-b-0">
                    <td className="p-2">
                      <Controller
                        control={control}
                        name={`positionen.${i}.kind`}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 w-[110px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="arbeit">{t('form.kindArbeit')}</SelectItem>
                              <SelectItem value="teil">{t('form.kindTeil')}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    <td className="p-2">
                      <Input {...register(`positionen.${i}.bezeichnung`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input type="number" step="0.01" {...register(`positionen.${i}.menge`)} className="h-8 w-20 text-right" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`positionen.${i}.einheit`)} className="h-8 w-16" />
                    </td>
                    <td className="p-2">
                      <Input type="number" step="0.01" {...register(`positionen.${i}.einzelpreis`)} className="h-8 w-24 text-right" />
                    </td>
                    <td className="p-2 text-right">
                      <Money value={total} />
                    </td>
                    <td className="p-2">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={tc('actions.remove')}>
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/20 text-xs">
                <td colSpan={5} className="p-2 text-right text-muted-foreground">{tc('form.netto')}</td>
                <td className="p-2 text-right"><Money value={summen.netto} /></td>
                <td></td>
              </tr>
              <tr className="text-xs">
                <td colSpan={5} className="p-2 text-right text-muted-foreground">{tc('form.mwst')}</td>
                <td className="p-2 text-right"><Money value={summen.mwst} /></td>
                <td></td>
              </tr>
              <tr className="border-t font-semibold">
                <td colSpan={5} className="p-2 text-right">{tc('form.brutto')}</td>
                <td className="p-2 text-right"><Money value={summen.brutto} /></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {errors.positionen && !Array.isArray(errors.positionen) ? (
          <p className="mt-1 text-xs text-destructive">
            {(() => {
              const m = (errors.positionen as { message?: string }).message ?? '';
              return m.startsWith('errors.') ? tc(m) : m;
            })()}
          </p>
        ) : null}
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
