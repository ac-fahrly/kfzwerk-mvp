import { Badge, type BadgeProps } from '@/components/ui/badge';
import { useT } from '@/i18n';

type Variant = BadgeProps['variant'];

const variantMap: Record<string, Variant> = {
  neu: 'secondary',
  in_arbeit: 'default',
  wartet_auf_teile: 'warning',
  fertig: 'success',
  abgeholt: 'muted',
  storniert: 'destructive',
  entwurf: 'secondary',
  offen: 'default',
  bezahlt: 'success',
  ueberfaellig: 'destructive',
  teilbezahlt: 'warning',
  geplant: 'default',
  bestaetigt: 'success',
  abgeschlossen: 'muted',
  abgesagt: 'destructive',
  stufe_1: 'warning',
  stufe_2: 'warning',
  stufe_3: 'destructive',
  inkasso: 'destructive',
  erledigt: 'success',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useT('common');
  return <Badge variant={variantMap[status] ?? 'outline'}>{t(`status.${status}`)}</Badge>;
}

export function useStatusLabel() {
  const { t } = useT('common');
  return (status: string) => t(`status.${status}`);
}
