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
import type { BusinessSettings } from '@/modules/settings/types';
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
export const appointmentsApi = crud<Termin>('appointments');
export const dunningApi = crud<Mahnung>('dunning');

/**
 * `absender` and `empfaenger` are SERVER-OWNED: the API freezes both parties
 * onto the invoice when it is issued, and `CreateInvoiceDto`/`UpdateInvoiceDto`
 * do not declare them, so the backend's `forbidNonWhitelisted` pipe answers 400
 * to a body that carries one.
 *
 * Every invoice write is stripped here, in the one place they all pass through,
 * rather than trusting each call site to hand over a clean object: the store
 * rows DO carry both after hydration, and a plausible one-liner like
 * `update(r.id, { ...r, status: 'bezahlt' })` typechecks (spread properties are
 * exempt from excess-property checking), so the compiler would not catch it.
 */
function invoiceWrite<T extends Partial<Rechnung>>(r: T) {
  const { absender: _absender, empfaenger: _empfaenger, ...write } = r;
  return write;
}

export const invoicesApi = {
  ...crud<Rechnung>('invoices'),
  create: (item: Rechnung) => sendJson<Rechnung>('post', '/invoices', invoiceWrite(item)),
  update: (id: string, patch: Partial<Rechnung>) =>
    sendJson<Rechnung>('patch', `/invoices/${id}`, invoiceWrite(patch)),
};

/**
 * Einstellungen: ONE business profile per workshop, addressed by the session,
 * not by an id — hence GET/PUT on a fixed path instead of `crud`, which assumes
 * a collection with `/:id`. `vehiclesApi` above is the precedent for a
 * hand-written client in this file.
 *
 * GET never 404s: a workshop that has never saved a profile gets all-empty
 * strings, which is the frontend's `emptyBusinessSettings`.
 */
export const settingsApi = {
  getBusiness: () => getJson<BusinessSettings>('/settings/business'),
  saveBusiness: (b: BusinessSettings) =>
    sendJson<BusinessSettings>('put', '/settings/business', b),
};
