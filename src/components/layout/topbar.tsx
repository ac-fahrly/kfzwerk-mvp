import { Menu, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useT } from '@/i18n';
import { useUiStore } from '@/store/ui-store';
import { LanguageToggle } from './language-toggle';

const routeKeyMap: Record<string, string> = {
  '/': 'nav.dashboard',
  '/bestellungen': 'nav.bestellungen',
  '/rechnungen': 'nav.rechnungen',
  '/termine': 'nav.termine',
  '/mahnungen': 'nav.mahnungen',
  '/teile': 'nav.teile',
};

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { t } = useT('common');
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const { pathname } = useLocation();
  const titleKey = routeKeyMap[pathname];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileNav}
          aria-label={t('nav.dashboard')}
        >
          <Menu size={18} />
        </Button>
        <div className="min-w-0 truncate text-sm font-medium">
          {titleKey ? t(titleKey) : t('app.subtitle')}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('theme.toggle')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
