import { Menu, Moon, Search, Sun } from 'lucide-react';
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

const modKey = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { t } = useT('common');
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const { pathname } = useLocation();
  const baseKey = pathname.split('/')[1];
  const titleKey = routeKeyMap[pathname] ?? (baseKey ? routeKeyMap[`/${baseKey}`] : undefined);

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
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden md:inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-accent"
          aria-label={t('command.placeholder')}
        >
          <Search size={14} />
          <span>{t('command.placeholder')}</span>
          <kbd className="num ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px]">{modKey} K</kbd>
        </button>
        <LanguageToggle />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('theme.toggle')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
