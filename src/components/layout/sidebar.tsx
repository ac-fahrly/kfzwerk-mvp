import { NavLink } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Package, Receipt, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

const nav = [
  { to: '/bestellungen', key: 'nav.bestellungen', icon: ClipboardList },
  { to: '/rechnungen', key: 'nav.rechnungen', icon: FileText },
  { to: '/termine', key: 'nav.termine', icon: Calendar },
  { to: '/mahnungen', key: 'nav.mahnungen', icon: Receipt },
  { to: '/teile', key: 'nav.teile', icon: Package },
] as const;

export function Sidebar() {
  const { t } = useT('common');
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Wrench size={18} />
        </div>
        <div className="text-sm font-semibold">{t('brand')}</div>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
      <div className="border-t p-3 text-xs text-muted-foreground">{t('app.version')}</div>
    </aside>
  );
}
