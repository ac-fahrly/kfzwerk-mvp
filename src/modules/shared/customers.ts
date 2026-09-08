export type { Customer, Vehicle } from '@/modules/kunden/types';
export {
  useKunden,
  useCustomers,
  useVehicles,
  useCustomerLookup,
  useVehicleLookup,
  useVehiclesForCustomer,
  customerById,
  vehicleById,
  vehiclesForCustomer,
} from '@/modules/kunden/store';
