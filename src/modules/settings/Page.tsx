import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { serverError } from '@/lib/api';
import { usePageTitle } from '@/lib/use-page-title';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';
import { legacyBusinessSettings, useBusinessSettings } from './store';
import { businessSettingsSchema, type BusinessSettingsInput } from './schema';
import type { BusinessSettings } from './types';

export function SettingsPage() {
  const { t } = useT('settings');
  usePageTitle(t('title'));

  const { business, loading, loaded, hydrate, save } = useBusinessSettings();

  // Values a previous build left in this browser, offered as a prefill only
  // while the server has nothing. Read during render because it is a synchronous
  // localStorage read and the form below is mounted with it as its defaults.
  const legacy = loaded && !business.name ? legacyBusinessSettings() : null;

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('title')} description={t('description')} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {/* A failed load must NOT fall through to a blank form: saving it would
          PUT twelve empty strings over a perfectly good server row. */}
      {!loading && !loaded ? (
        <div className="rounded-lg border p-6 text-sm">
          <p className="text-muted-foreground">{t('loadFailed')}</p>
          {/* `hydrate` rethrows like every other store, so catch here — an
              unhandled rejection is not a retry button's answer. */}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void hydrate().catch(() => toast.error(t('loadFailed')))}
          >
            {t('retry')}
          </Button>
        </div>
      ) : null}

      {!loading && loaded ? (
        <>
          {legacy ? (
            <p className="mb-4 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              {t('legacy.notice')}
            </p>
          ) : null}
          <SettingsForm initial={legacy ?? business} fromLegacy={legacy !== null} onSave={save} />
        </>
      ) : null}
    </div>
  );
}

type FormProps = {
  /** Mounted only after hydration, so these ARE the current values and plain
   * `defaultValues` is enough — no `values` prop, no reset-in-effect. */
  initial: BusinessSettings;
  /** `initial` came from the old localStorage copy, so the server does NOT have
   * it yet: Save must be pressable without touching a field first. */
  fromLegacy: boolean;
  onSave: (b: BusinessSettings) => Promise<void>;
};

function SettingsForm({ initial, fromLegacy, onSave }: FormProps) {
  const { t } = useT('settings');
  const { t: tc } = useT('common');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BusinessSettingsInput>({
    mode: 'onBlur',
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: initial,
  });

  // The store's `save` is optimistic and rethrows, so success is only true once
  // the server has agreed — toasting before that would lie on the next reload.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(values);
      toast.success(tc('toasts.saved'));
      reset(values);
    } catch (err) {
      toast.error(serverError(err, tc('toasts.saveFailed')));
    }
  });

  return (
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
        <Button type="submit" disabled={isSubmitting || (!isDirty && !fromLegacy)}>
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {tc('actions.save')}
        </Button>
      </div>
    </form>
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
