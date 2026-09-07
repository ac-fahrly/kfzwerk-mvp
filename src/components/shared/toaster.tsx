import { Check, Info, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore, type ToastKind } from '@/store/toast-store';

const kindStyle: Record<ToastKind, { icon: typeof Check; bar: string }> = {
  success: { icon: Check, bar: 'bg-success' },
  error: { icon: AlertCircle, bar: 'bg-destructive' },
  info: { icon: Info, bar: 'bg-primary' },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => {
        const { icon: Icon, bar } = kindStyle[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border bg-card p-3 pr-8 shadow-lg',
              'animate-in slide-in-from-right-4 fade-in duration-200',
            )}
          >
            <div className={cn('absolute inset-y-0 left-0 w-1', bar)} />
            <div className="mt-0.5 text-muted-foreground">
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{t.title}</div>
              {t.description ? <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div> : null}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2 top-2 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
              aria-label="dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
