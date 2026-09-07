import { useI18n, useT } from '@/i18n';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const { t } = useT('common');
  return (
    <div role="group" aria-label={t('language.label')} className="flex overflow-hidden rounded-md border">
      <button
        type="button"
        onClick={() => setLocale('de')}
        className={cn(
          'px-2 py-1 text-xs font-medium transition-colors',
          locale === 'de' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60',
        )}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          'border-l px-2 py-1 text-xs font-medium transition-colors',
          locale === 'en' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60',
        )}
      >
        EN
      </button>
    </div>
  );
}
