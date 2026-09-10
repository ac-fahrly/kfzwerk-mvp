import { useMemo } from 'react';
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Customer, Vehicle } from './types';

/**
 * Kunden — backed by `/api/customers` and `/api/vehicles`.
 *
 * This store keeps its own shape rather than using `createApiStore`, because it
 * holds TWO arrays (`customers`, `vehicles`) that the UI joins client-side, and
 * its main write is an upsert-plus-replace (`saveCustomerWithVehicles`) rather
 * than a plain create or patch.
 *
 * `GET /api/customers` returns both arrays in one response, so a page load is
 * one request instead of one per customer.
 *
 * The mutators are optimistic and rethrow on failure, exactly like
 * `createApiStore`: the change shows immediately, a rejected request rolls it
 * back, and the call site awaits before toasting success. Nothing is persisted
 * to localStorage — the database is the source of truth.
 */
type KundenState = {
  customers: Customer[];
  vehicles: Vehicle[];
  loading: boolean;
  loaded: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addCustomer: (c: Customer) => Promise<void>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  addVehicle: (v: Vehicle) => Promise<void>;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  saveCustomerWithVehicles: (customer: Customer, vehicles: Vehicle[]) => Promise<void>;
};

export const useKunden = create<KundenState>()((set, get) => ({
  customers: [],
  vehicles: [],
  loading: false,
  loaded: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const { customers, vehicles } = await api.customers.list();
      set({ customers, vehicles, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ customers: [], vehicles: [], loaded: false, loading: false }),

  addCustomer: async (c) => {
    set((s) => ({ customers: [c, ...s.customers] }));
    try {
      const saved = await api.customers.create(c);
      set((s) => ({
        customers: s.customers.map((x) => (x.id === c.id ? saved : x)),
      }));
    } catch (err) {
      set((s) => ({ customers: s.customers.filter((x) => x.id !== c.id) }));
      throw err;
    }
  },

  updateCustomer: async (id, patch) => {
    const before = get().customers.find((c) => c.id === id);
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    try {
      const saved = await api.customers.update(id, patch);
      set((s) => ({ customers: s.customers.map((c) => (c.id === id ? saved : c)) }));
    } catch (err) {
      if (before) {
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? before : c)) }));
      }
      throw err;
    }
  },

  removeCustomer: async (id) => {
    // Vehicles cascade server-side; mirror that locally so the optimistic view
    // matches what the API will have done.
    const before = {
      customers: get().customers,
      vehicles: get().vehicles,
    };
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      vehicles: s.vehicles.filter((v) => v.customerId !== id),
    }));
    try {
      await api.customers.remove(id);
    } catch (err) {
      // A customer with orders/invoices is Restrict-protected and comes back
      // as a 409 — restore both arrays wholesale.
      set(before);
      throw err;
    }
  },

  addVehicle: async (v) => {
    set((s) => ({ vehicles: [...s.vehicles, v] }));
    try {
      const saved = await api.vehicles.create(v);
      set((s) => ({ vehicles: s.vehicles.map((x) => (x.id === v.id ? saved : x)) }));
    } catch (err) {
      set((s) => ({ vehicles: s.vehicles.filter((x) => x.id !== v.id) }));
      throw err;
    }
  },

  updateVehicle: async (id, patch) => {
    const before = get().vehicles.find((v) => v.id === id);
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
    try {
      const saved = await api.vehicles.update(id, patch);
      set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? saved : v)) }));
    } catch (err) {
      if (before) {
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? before : v)) }));
      }
      throw err;
    }
  },

  removeVehicle: async (id) => {
    const index = get().vehicles.findIndex((v) => v.id === id);
    const before = index >= 0 ? get().vehicles[index] : undefined;
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
    try {
      await api.vehicles.remove(id);
    } catch (err) {
      if (before) {
        set((s) => {
          const vehicles = s.vehicles.slice();
          vehicles.splice(Math.min(index, vehicles.length), 0, before);
          return { vehicles };
        });
      }
      throw err;
    }
  },

  saveCustomerWithVehicles: async (customer, vehicles) => {
    const before = { customers: get().customers, vehicles: get().vehicles };
    const exists = before.customers.some((c) => c.id === customer.id);
    set((s) => ({
      customers: exists
        ? s.customers.map((c) => (c.id === customer.id ? customer : c))
        : [customer, ...s.customers],
      vehicles: [...s.vehicles.filter((v) => v.customerId !== customer.id), ...vehicles],
    }));
    try {
      const saved = await api.customers.saveWithVehicles(customer, vehicles);
      // The endpoint returns this customer's canonical rows; splice them in
      // rather than replacing the whole store, which would drop other
      // customers' vehicles.
      set((s) => ({
        customers: s.customers.map((c) =>
          c.id === customer.id ? saved.customers[0] ?? c : c,
        ),
        vehicles: [
          ...s.vehicles.filter((v) => v.customerId !== customer.id),
          ...saved.vehicles,
        ],
      }));
    } catch (err) {
      set(before);
      throw err;
    }
  },
}));

export function customerById(id: string): Customer | undefined {
  return useKunden.getState().customers.find((c) => c.id === id);
}

export function vehicleById(id: string): Vehicle | undefined {
  return useKunden.getState().vehicles.find((v) => v.id === id);
}

export function vehiclesForCustomer(customerId: string): Vehicle[] {
  return useKunden.getState().vehicles.filter((v) => v.customerId === customerId);
}

export function useCustomers(): Customer[] {
  return useKunden((s) => s.customers);
}

export function useVehicles(): Vehicle[] {
  return useKunden((s) => s.vehicles);
}

export function useCustomerLookup() {
  const customers = useCustomers();
  return useMemo(() => {
    const m = new Map(customers.map((c) => [c.id, c]));
    return (id: string) => m.get(id);
  }, [customers]);
}

export function useVehicleLookup() {
  const vehicles = useVehicles();
  return useMemo(() => {
    const m = new Map(vehicles.map((v) => [v.id, v]));
    return (id: string) => m.get(id);
  }, [vehicles]);
}

export function useVehiclesForCustomer(customerId: string): Vehicle[] {
  const vehicles = useVehicles();
  return useMemo(() => vehicles.filter((v) => v.customerId === customerId), [vehicles, customerId]);
}
