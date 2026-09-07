import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onExport?: () => void;
};

export function TableToolbar({ onExport }: Props) {
  if (!onExport) return null;
  return (
    <div className="mb-2 flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download size={14} />
        CSV
      </Button>
    </div>
  );
}
