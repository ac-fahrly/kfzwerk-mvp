import { createCrudStore } from '@/store/create-crud-store';
import { seedTeile } from './data';
import type { Teil } from './types';

export const useTeile = createCrudStore<Teil>('kfz.teile', seedTeile);

export function teilById(id: string): Teil | undefined {
  return useTeile.getState().items.find((t) => t.id === id);
}
