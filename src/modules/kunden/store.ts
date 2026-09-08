import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { seedCustomers, seedVehicles } from './data';
import type { Customer, Vehicle } from './types';

type KundenState = {
  customers: Customer[];
  vehicles: Vehicle[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  saveCustomerWithVehicles: (customer: Customer, vehicles: Vehicle[]) => void;
};

export const useKunden = create<KundenState>()(
  persist(
    (set) => ({
      customers: seedCustomers,
      vehicles: seedVehicles,
      addCustomer: (c) => set((s) => ({ customers: [c, ...s.customers] })),
      updateCustomer: (id, patch) =>
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
          vehicles: s.vehicles.filter((v) => v.customerId !== id),
        })),
      addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, v] })),
      updateVehicle: (id, patch) =>
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
      removeVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
      saveCustomerWithVehicles: (customer, vehicles) =>
        set((s) => {
          const exists = s.customers.some((c) => c.id === customer.id);
          const nextCustomers = exists
            ? s.customers.map((c) => (c.id === customer.id ? customer : c))
            : [customer, ...s.customers];
          const others = s.vehicles.filter((v) => v.customerId !== customer.id);
          return { customers: nextCustomers, vehicles: [...others, ...vehicles] };
        }),
    }),
    {
      name: 'kfz.kunden',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

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
