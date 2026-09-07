import { formatDate, formatDateTime, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = { value: Date | string; withTime?: boolean; className?: string };

export function DateCell({ value, withTime, className }: Props) {
  const s = withTime ? formatDateTime(value) : formatDate(value);
  return <span className={cn('num', className)}>{s}</span>;
}

export function TimeCell({ value, className }: { value: Date | string; className?: string }) {
  return <span className={cn('num', className)}>{formatTime(value)}</span>;
}
