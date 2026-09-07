import { Download, Rows2, Rows4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Density } from './data-table';

type Props = {
  density: Density;
  onDensityChange: (d: Density) => void;
  onExport?: () => void;
};

export function TableToolbar({ density, onDensityChange, onExport }: Props) {
  return (
    <div className="mb-2 flex items-center justify-end gap-1">
      <div role="group" className="flex overflow-hidden rounded-md border">
        <button
          type="button"
          onClick={() => onDensityChange('comfortable')}
          className={cn(
            'flex h-8 w-8 items-center justify-center transition-colors',
            density === 'comfortable' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60',
          )}
          aria-label="Comfortable"
          aria-pressed={density === 'comfortable'}
        >
          <Rows2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDensityChange('compact')}
          className={cn(
            'flex h-8 w-8 items-center justify-center border-l transition-colors',
            density === 'compact' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60',
          )}
          aria-label="Compact"
          aria-pressed={density === 'compact'}
        >
          <Rows4 size={14} />
        </button>
      </div>
      {onExport ? (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={14} />
          CSV
        </Button>
      ) : null}
    </div>
  );
}
