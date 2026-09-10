/** The single entry point to the backend. Stores import `api`, never axios. */
import { authApi } from './auth';
import {
  appointmentsApi,
  customersApi,
  dunningApi,
  invoicesApi,
  ordersApi,
  partsApi,
  vehiclesApi,
} from './resources';

export const api = {
  auth: authApi,
  customers: customersApi,
  vehicles: vehiclesApi,
  parts: partsApi,
  orders: ordersApi,
  invoices: invoicesApi,
  appointments: appointmentsApi,
  dunning: dunningApi,
};

export { API_URL, serverError } from './client';
export type { AuthResponse, AuthUser } from './auth';
export type { CustomersSnapshot } from './resources';
