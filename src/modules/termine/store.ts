import { api } from '@/lib/api';
import { createApiStore } from '@/store/create-api-store';
import type { Termin } from './types';

/** Termine — backed by `GET/POST/PATCH/DELETE /api/appointments`. */
export const useTermine = createApiStore<Termin>(api.appointments);
