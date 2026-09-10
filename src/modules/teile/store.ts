import { api } from '@/lib/api';
import { createApiStore } from '@/store/create-api-store';
import type { Teil } from './types';

/** Teile Katalog — backed by `GET/POST/PATCH/DELETE /api/parts`. */
export const useTeile = createApiStore<Teil>(api.parts);

export function teilById(id: string): Teil | undefined {
  return useTeile.getState().items.find((t) => t.id === id);
}
