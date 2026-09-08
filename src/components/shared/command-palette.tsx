import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, LayoutDashboard, Package, Receipt, Search, User, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useUiStore } from '@/store/ui-store';
import { useBestellungen } from '@/modules/bestellungen/store';
import { useRechnungen } from '@/modules/rechnungen/store';
import { useTermine } from '@/modules/termine/store';
import { useTeile } from '@/modules/teile/store';
import { customerById, useCustomers, vehicleById } from '@/modules/shared/customers';

type Item = {
  id: string;
  label: string;
  sub?: string;
  path: string;
  section: string;
  icon: LucideIcon;
};

export function CommandPalette() {
  const { t } = useT('common');
  const commandOpen = useUiStore((s) => s.commandOpen);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [hover, setHover] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const bestellungen = useBestellungen((s) => s.items);
  const rechnungen = useRechnungen((s) => s.items);
  const termine = useTermine((s) => s.items);
  const teile = useTeile((s) => s.items);
  const customers = useCustomers();

  const allItems: Item[] = useMemo(() => {
    const pages: Item[] = [
      { id: 'p-dashboard', label: t('nav.dashboard'), path: '/', section: 'pages', icon: LayoutDashboard },
      { id: 'p-bestellungen', label: t('nav.bestellungen'), path: '/bestellungen', section: 'pages', icon: ClipboardList },
      { id: 'p-rechnungen', label: t('nav.rechnungen'), path: '/rechnungen', section: 'pages', icon: FileText },
      { id: 'p-termine', label: t('nav.termine'), path: '/termine', section: 'pages', icon: Calendar },
      { id: 'p-mahnungen', label: t('nav.mahnungen'), path: '/mahnungen', section: 'pages', icon: Receipt },
      { id: 'p-teile', label: t('nav.teile'), path: '/teile', section: 'pages', icon: Package },
      { id: 'p-kunden', label: t('nav.kunden'), path: '/kunden', section: 'pages', icon: User },
    ];
    const customerItems: Item[] = customers.map((c) => ({
      id: `c-${c.id}`,
      label: c.name,
      sub: c.email || c.ort,
      path: `/kunden/${c.id}`,
      section: 'customers',
      icon: User,
    }));
    const orderItems: Item[] = bestellungen.map((b) => ({
      id: `b-${b.id}`,
      label: `${b.nummer} · ${b.beschreibung}`,
      sub: customerById(b.customerId)?.name,
      path: `/bestellungen/${b.id}`,
      section: 'orders',
      icon: ClipboardList,
    }));
    const invoiceItems: Item[] = rechnungen.map((r) => ({
      id: `r-${r.id}`,
      label: r.nummer,
      sub: customerById(r.customerId)?.name,
      path: `/rechnungen/${r.id}`,
      section: 'invoices',
      icon: FileText,
    }));
    const appointmentItems: Item[] = termine.map((a) => {
      const kunde = customerById(a.customerId)?.name ?? '';
      const v = vehicleById(a.vehicleId);
      return {
        id: `t-${a.id}`,
        label: `${a.datum} ${a.von} · ${kunde}`,
        sub: v ? `${v.kennzeichen} — ${a.grund}` : a.grund,
        path: `/termine/${a.id}`,
        section: 'appointments',
        icon: Calendar,
      };
    });
    const partItems: Item[] = teile.map((p) => ({
      id: `t-${p.id}`,
      label: `${p.artikelnr} · ${p.bezeichnung}`,
      sub: p.lieferant,
      path: `/teile/${p.id}`,
      section: 'parts',
      icon: Package,
    }));
    return [...pages, ...customerItems, ...orderItems, ...invoiceItems, ...appointmentItems, ...partItems];
  }, [t, bestellungen, rechnungen, termine, teile, customers]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allItems.slice(0, 20);
    return allItems
      .filter((it) => it.label.toLowerCase().includes(s) || it.sub?.toLowerCase().includes(s))
      .slice(0, 40);
  }, [allItems, q]);

  useEffect(() => {
    if (commandOpen) {
      setQ('');
      setHover(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [commandOpen]);

  useEffect(() => {
    setHover(0);
  }, [q]);

  function pick(item: Item) {
    setCommandOpen(false);
    navigate(item.path);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHover((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHover((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[hover];
      if (item) pick(item);
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, Item[]> = {};
    for (const it of filtered) {
      if (!g[it.section]) g[it.section] = [];
      g[it.section].push(it);
    }
    return g;
  }, [filtered]);

  const sectionOrder = ['pages', 'customers', 'orders', 'invoices', 'appointments', 'parts'];

  let flatIndex = -1;

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <div className="flex items-center gap-2 border-b px-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('command.placeholder')}
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t('command.empty')}</div>
          ) : (
            sectionOrder.map((s) => {
              const items = grouped[s];
              if (!items?.length) return null;
              return (
                <div key={s} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t(`command.sections.${s}`)}
                  </div>
                  <div>
                    {items.map((it) => {
                      flatIndex++;
                      const active = flatIndex === hover;
                      const Icon = it.icon;
                      return (
                        <button
                          key={it.id}
                          onClick={() => pick(it)}
                          onMouseEnter={() => setHover(flatIndex)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                            active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                          )}
                        >
                          <Icon size={14} />
                          <div className="min-w-0 flex-1 truncate">{it.label}</div>
                          {it.sub ? <div className="truncate text-xs text-muted-foreground">{it.sub}</div> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
