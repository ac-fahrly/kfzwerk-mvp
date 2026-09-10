/**
 * One CRUD client per backend resource. The shapes are the frontend's own
 * module types — the API is built to serve them verbatim, so nothing is mapped
 * on this side.
 *
 * `create` sends the whole entity INCLUDING its client-generated ULID id (see
 * `@/lib/id`): the stores insert optimistically, and letting the client own the
 * id means the optimistic row and the stored row share a key, so there is
 * nothing to reconcile.
 */
import type { Bestellung } from '@/modules/bestellungen/types';
import type { Customer, Vehicle } from '@/modules/kunden/types';
import type { Mahnung } from '@/modules/mahnungen/types';
import type { Rechnung } from '@/modules/rechnungen/types';
import type { Teil } from '@/modules/teile/types';
import type { Termin } from '@/modules/termine/types';

import { getJson, sendJson } from './client';

/** Every DELETE returns the id it removed. */
interface Removed {
  id: string;
}

function crud<T extends { id: string }>(resource: string) {
  return {
    list: () => getJson<T[]>(`/${resource}`),
    get: (id: string) => getJson<T>(`/${resource}/${id}`),
    create: (item: T) => sendJson<T>('post', `/${resource}`, item),
    update: (id: string, patch: Partial<T>) =>
      sendJson<T>('patch', `/${resource}/${id}`, patch),
    remove: (id: string) => sendJson<Removed>('delete', `/${resource}/${id}`),
  };
}

export interface CustomersSnapshot {
  customers: Customer[];
  vehicles: Vehicle[];
}

/** Kunden: one GET hydrates both arrays the kunden store holds. */
export const customersApi = {
  ...crud<Customer>('customers'),
  /** Overrides `crud.list` — the kunden store is two arrays, not one. */
  list: () => getJson<CustomersSnapshot>('/customers'),
  /** Upsert the customer and REPLACE its vehicle set, atomically. */
  saveWithVehicles: (customer: Customer, vehicles: Vehicle[]) =>
    sendJson<CustomersSnapshot>('put', `/customers/${customer.id}/with-vehicles`, {
      customer,
      vehicles,
    }),
};

export const vehiclesApi = {
  create: (item: Vehicle) => sendJson<Vehicle>('post', '/vehicles', item),
  update: (id: string, patch: Partial<Vehicle>) =>
    sendJson<Vehicle>('patch', `/vehicles/${id}`, patch),
  remove: (id: string) => sendJson<Removed>('delete', `/vehicles/${id}`),
};

export const partsApi = crud<Teil>('parts');
export const ordersApi = crud<Bestellung>('orders');
export const invoicesApi = crud<Rechnung>('invoices');
export const appointmentsApi = crud<Termin>('appointments');
export const dunningApi = crud<Mahnung>('dunning');
