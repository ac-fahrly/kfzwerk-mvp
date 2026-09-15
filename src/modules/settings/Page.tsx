import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/use-page-title';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';
import { useBusinessSettings } from './store';
import { businessSettingsSchema, type BusinessSettingsInput } from './schema';

export function SettingsPage() {
  const { t } = useT('settings');
  const { t: tc } = useT('common');
  usePageTitle(t('title'));

  const { business, save } = useBusinessSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessSettingsInput>({
    mode: 'onBlur',
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: business,
  });

  const onSubmit = handleSubmit((values) => {
    save(values);
    toast.success(tc('toasts.saved'));
    reset(values);
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('title')} description={t('description')} />

      <form onSubmit={onSubmit} className="space-y-8">
        <Section title={t('sections.business')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('form.name')} required error={errors.name?.message} className="sm:col-span-2">
              <Input {...register('name')} placeholder="Muster Kfz-Werk GmbH" />
            </FormField>
            <FormField label={t('form.strasse')} className="sm:col-span-2">
              <Input {...register('strasse')} />
            </FormField>
            <FormField label={t('form.plz')}>
              <Input {...register('plz')} className="num" />
            </FormField>
            <FormField label={t('form.ort')}>
              <Input {...register('ort')} />
            </FormField>
            <FormField label={t('form.land')} className="sm:col-span-2">
              <Input {...register('land')} placeholder="Deutschland" />
            </FormField>
          </div>
        </Section>

        <Section title={t('sections.tax')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('form.ustId')}>
              <Input {...register('ustId')} className="num" placeholder="DE123456789" />
            </FormField>
            <FormField label={t('form.steuernummer')}>
              <Input {...register('steuernummer')} className="num" />
            </FormField>
          </div>
        </Section>

        <Section title={t('sections.contact')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('form.email')} error={errors.email?.message}>
              <Input type="email" {...register('email')} />
            </FormField>
            <FormField label={t('form.telefon')}>
              <Input {...register('telefon')} className="num" />
            </FormField>
          </div>
        </Section>

        <Section title={t('sections.bank')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('form.iban')} className="sm:col-span-2">
              <Input {...register('iban')} className="num" placeholder="DE00 0000 0000 0000 0000 00" />
            </FormField>
            <FormField label={t('form.bic')}>
              <Input {...register('bic')} className="num" />
            </FormField>
            <FormField label={t('form.bank')}>
              <Input {...register('bank')} />
            </FormField>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty}>
            {tc('actions.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
