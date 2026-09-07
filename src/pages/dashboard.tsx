import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Package, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '@/components/shared/money';
import { useBestellungen } from '@/modules/bestellungen/store';
import { useRechnungen } from '@/modules/rechnungen/store';
import { useTermine } from '@/modules/termine/store';
import { useMahnungen } from '@/modules/mahnungen/store';
import { useTeile } from '@/modules/teile/store';
import { formatCompact } from '@/lib/format';
import { useT } from '@/i18n';

const tiles = [
  { to: '/bestellungen', key: 'nav.bestellungen', icon: ClipboardList },
  { to: '/rechnungen', key: 'nav.rechnungen', icon: FileText },
  { to: '/termine', key: 'nav.termine', icon: Calendar },
  { to: '/mahnungen', key: 'nav.mahnungen', icon: Receipt },
  { to: '/teile', key: 'nav.teile', icon: Package },
] as const;

export function Dashboard() {
  const { t } = useT('dashboard');
  const { t: tc } = useT('common');
  const bestellungen = useBestellungen((s) => s.items);
  const rechnungen = useRechnungen((s) => s.items);
  const termine = useTermine((s) => s.items);
  const mahnungen = useMahnungen((s) => s.items);
  const teile = useTeile((s) => s.items);
  void mahnungen;

  const offen = rechnungen.filter((r) => r.status === 'offen' || r.status === 'ueberfaellig');
  const offenBetrag = offen.reduce((sum, r) => sum + r.betrag, 0);

  const counts: Record<string, number> = {
    '/bestellungen': bestellungen.length,
    '/rechnungen': rechnungen.length,
    '/termine': termine.length,
    '/mahnungen': mahnungen.length,
    '/teile': teile.length,
  };

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t('kpi.openInvoices')} value={<Money value={offenBetrag} />} sub={t('kpi.invoicesCount', { count: offen.length })} />
        <Kpi label={t('kpi.activeOrders')} value={<span className="num">{formatCompact(bestellungen.filter((b) => b.status !== 'abgeholt' && b.status !== 'storniert').length)}</span>} />
        <Kpi label={t('kpi.appointmentsTotal')} value={<span className="num">{formatCompact(termine.length)}</span>} />
        <Kpi label={t('kpi.partsInCatalog')} value={<span className="num">{formatCompact(teile.length)}</span>} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map(({ to, key, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="transition-colors group-hover:bg-accent/40">
              <CardContent className="flex flex-col items-start gap-3 p-5">
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <Icon size={20} />
                </div>
                <div className="text-sm font-medium">{tc(key)}</div>
                <div className="num text-2xl font-semibold">{counts[to]}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-right text-2xl font-semibold">{value}</div>
        {sub ? <div className="mt-1 text-right text-xs text-muted-foreground">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}
