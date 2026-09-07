import { Menu, Moon, Search, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const listQuery = useUiStore((s) => s.listQuery);
  const setListQuery = useUiStore((s) => s.setListQuery);
  const firstMatchPath = useUiStore((s) => s.firstMatchPath);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseKey = pathname.split('/')[1];
  const titleKey = routeKeyMap[pathname] ?? (baseKey ? routeKeyMap[`/${baseKey}`] : undefined);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (firstMatchPath) navigate(firstMatchPath);
      else setCommandOpen(true);
    } else if (e.key === 'Escape' && listQuery) {
      e.preventDefault();
      setListQuery('');
    }
  }

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
      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('command.placeholder')}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-14 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="num absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent"
            aria-label={t('command.placeholder')}
          >
            {modKey} K
          </button>
        </div>
        <LanguageToggle />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('theme.toggle')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
