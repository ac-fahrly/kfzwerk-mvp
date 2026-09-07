import { createCrudStore } from '@/store/create-crud-store';
import { seedTermine } from './data';
import type { Termin } from './types';

export const useTermine = createCrudStore<Termin>('kfz.termine', seedTermine);
