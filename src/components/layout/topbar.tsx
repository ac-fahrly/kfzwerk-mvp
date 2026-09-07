import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useT } from '@/i18n';
import { LanguageToggle } from './language-toggle';

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { t } = useT('common');
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="text-sm text-muted-foreground">{t('app.subtitle')}</div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('theme.toggle')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
