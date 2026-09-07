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
import { useRechnungen } from '@/modules/rechnungen/store';
import { offenerBetrag as offenR } from '@/modules/rechnungen/types';
import { useStatusLabel } from '@/components/shared/status-badge';
import { mahnungSchema, type MahnungInput } from './schema';
import { mahnstufen, mahnungStatusList, type Mahnung, type MahnungStatus } from './types';
import { nextMahnNummer } from './store';

type Props = {
  initial?: Mahnung;
  onSubmit: (m: Mahnung) => void;
  onCancel: () => void;
};

function computeFaellig(datum: string, status: MahnungStatus): string {
  const d = new Date(datum);
  d.setDate(d.getDate() + mahnstufen[status].fristTage);
  return d.toISOString().slice(0, 10);
}

export function MahnungForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useT('mahnungen');
  const { t: tc } = useT('common');
  const statusLabel = useStatusLabel();
  const rechnungen = useRechnungen((s) => s.items);
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MahnungInput>({
    mode: 'onBlur',
    resolver: zodResolver(mahnungSchema),
    defaultValues:
      initial ??
      {
        id: newId(),
        nummer: nextMahnNummer(),
        rechnungId: '',
        customerId: '',
        datum: today,
        faelligDatum: computeFaellig(today, 'stufe_1'),
        status: 'stufe_1',
        offenerBetrag: 0,
        mahngebuehr: 0,
        notiz: '',
      },
  });

  const status = watch('status');
  const datum = watch('datum');

  function pickRechnung(rid: string) {
    const r = rechnungen.find((x) => x.id === rid);
    if (!r) return;
    setValue('rechnungId', r.id);
    setValue('customerId', r.customerId);
    setValue('offenerBetrag', Number(offenR(r).toFixed(2)));
  }

  function pickStatus(s: MahnungStatus) {
    setValue('status', s);
    setValue('mahngebuehr', mahnstufen[s].gebuehr);
    setValue('faelligDatum', computeFaellig(datum, s));
  }

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as Mahnung))} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.nummer')}>
          <Input {...register('nummer')} className="num" />
        </FormField>
        <FormField label={t('form.datum')}>
          <Input
            type="date"
            {...register('datum')}
            onChange={(e) => {
              setValue('datum', e.target.value);
              setValue('faelligDatum', computeFaellig(e.target.value, status));
            }}
          />
        </FormField>
        <FormField label={t('form.faellig')}>
          <Input type="date" {...register('faelligDatum')} />
        </FormField>
      </div>

      <FormField label={t('form.rechnung')} required error={errors.rechnungId?.message}>
        <Controller
          control={control}
          name="rechnungId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => { field.onChange(v); pickRechnung(v); }}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.chooseInvoice')} />
              </SelectTrigger>
              <SelectContent>
                {rechnungen
                  .filter((r) => r.status !== 'bezahlt' && r.status !== 'entwurf')
                  .map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nummer} · {t('form.openLabel')} {offenR(r).toFixed(2)} €
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.mahnstufe')}>
          <Select value={status} onValueChange={(v) => pickStatus(v as MahnungStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {mahnungStatusList.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t('form.offenerBetrag')}>
          <Input type="number" step="0.01" {...register('offenerBetrag')} />
        </FormField>
        <FormField label={t('form.mahngebuehr')}>
          <Input type="number" step="0.01" {...register('mahngebuehr')} />
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
