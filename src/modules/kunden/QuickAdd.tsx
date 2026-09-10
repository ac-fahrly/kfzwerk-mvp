import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/i18n';
import { serverError } from '@/lib/api';
import { toast } from '@/store/toast-store';
import { useKunden } from './store';
import { KundeForm } from './Form';
import type { Customer, Vehicle } from './types';

type Props = {
  onCreated: (customer: Customer, vehicles: Vehicle[]) => void;
  ariaLabel?: string;
};

export function KundeQuickAdd({ onCreated, ariaLabel }: Props) {
  const { t } = useT('kunden');
  const { t: tc } = useT('common');
  const saveCustomerWithVehicles = useKunden((s) => s.saveCustomerWithVehicles);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? t('form.quickTitle')}
        title={t('form.quickTitle')}
      >
        <Plus size={16} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('form.quickTitle')}</DialogTitle>
          </DialogHeader>
          <KundeForm
            onSubmit={async (c, v) => {
              try {
                await saveCustomerWithVehicles(c, v);
                toast.success(tc('toasts.created'));
                onCreated(c, v);
                setOpen(false);
              } catch (err) {
                toast.error(serverError(err, tc('toasts.createFailed')));
              }
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
