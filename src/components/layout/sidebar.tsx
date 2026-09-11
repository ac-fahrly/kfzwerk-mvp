import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Calendar, ClipboardList, FileText, Package, Receipt, Users, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useUiStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';

const nav = [
  { to: '/bestellungen', key: 'nav.bestellungen', icon: ClipboardList },
  { to: '/rechnungen', key: 'nav.rechnungen', icon: FileText },
  { to: '/termine', key: 'nav.termine', icon: Calendar },
  { to: '/mahnungen', key: 'nav.mahnungen', icon: Receipt },
  { to: '/teile', key: 'nav.teile', icon: Package },
  { to: '/kunden', key: 'nav.kunden', icon: Users },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useT('common');
  return (
    <nav className="flex-1 space-y-0.5 p-2">
      {nav.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )
          }
        >
          <Icon size={20} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  const { t } = useT('common');
  return (
    <div className="flex h-14 items-center gap-2 border-b px-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Wrench size={18} />
      </div>
      <div className="text-sm font-semibold">{t('brand')}</div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <Brand />
      <NavItems />
    </aside>
  );
}

export function MobileNav() {
  const { t } = useT('common');
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileNavOpen(false);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  if (!mobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden
      />
      <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r bg-card shadow-xl">
        <div className="flex h-14 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench size={18} />
            </div>
            <div className="text-sm font-semibold">{t('brand')}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} aria-label={t('actions.close')}>
            <X size={18} />
          </Button>
        </div>
        <NavItems onNavigate={() => setMobileNavOpen(false)} />
      </aside>
    </div>
  );
}
