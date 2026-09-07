import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/form-field';
import { newId } from '@/lib/id';
import { useT } from '@/i18n';
import { teilSchema, type TeilInput } from './schema';
import { kategorien, type Teil } from './types';

type Props = {
  initial?: Teil;
  onSubmit: (t: Teil) => void;
  onCancel: () => void;
};

export function TeilForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useT('teile');
  const { t: tc } = useT('common');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeilInput>({
    mode: 'onBlur',
    resolver: zodResolver(teilSchema),
    defaultValues: initial ?? {
      id: newId(),
      artikelnr: '',
      bezeichnung: '',
      kategorie: 'Motor',
      einheit: 'Stk',
      bestand: 0,
      mindestbestand: 0,
      ekPreis: 0,
      vkPreis: 0,
      lieferant: '',
      lagerort: '',
    },
  });

  const kategorie = watch('kategorie');

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as Teil))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label={t('form.artikelnr')} required error={errors.artikelnr?.message}>
          <Input {...register('artikelnr')} placeholder={t('form.artikelnrPlaceholder')} />
        </FormField>
        <FormField label={t('form.kategorie')}>
          <Select value={kategorie} onValueChange={(v) => setValue('kategorie', v as Teil['kategorie'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kategorien.map((k) => (
                <SelectItem key={k} value={k}>
                  {tc(`kategorie.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <FormField label={t('form.bezeichnung')} required error={errors.bezeichnung?.message}>
        <Input {...register('bezeichnung')} placeholder={t('form.bezeichnungPlaceholder')} />
      </FormField>
      <div className="grid grid-cols-3 gap-4">
        <FormField label={t('form.einheit')}>
          <Input {...register('einheit')} />
        </FormField>
        <FormField label={t('form.bestand')}>
          <Input type="number" step="1" {...register('bestand')} />
        </FormField>
        <FormField label={t('form.mindestbestand')}>
          <Input type="number" step="1" {...register('mindestbestand')} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label={t('form.ekPrice')}>
          <Input type="number" step="0.01" {...register('ekPreis')} />
        </FormField>
        <FormField label={t('form.vkPrice')}>
          <Input type="number" step="0.01" {...register('vkPreis')} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label={t('form.lieferant')} required error={errors.lieferant?.message}>
          <Input {...register('lieferant')} />
        </FormField>
        <FormField label={t('form.lagerort')}>
          <Input {...register('lagerort')} placeholder={t('form.lagerortPlaceholder')} />
        </FormField>
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
