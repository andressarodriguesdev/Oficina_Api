export type JobCardStatus =
  | 'Open'
  | 'AwaitingApproval'
  | 'Approved'
  | 'Declined'
  | 'Completed'
  | 'Cancelled'
  | 'Reopened';

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  customerId: string;
  isActive: boolean;
  customer?: Customer | null;
}

export interface Part {
  id: string;
  jobCardId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobCardStatusChange {
  id: string;
  jobCardId: string;
  previousStatus: number | null;
  newStatus: number;
  note?: string | null;
  changedAt: string;
}

export interface JobCard {
  id: string;
  customerId: string;
  vehicleId: string;
  description: string;
  labourCharge: number;
  totalAmount: number;
  status: number;
  createdAt: string;
  sentForApprovalAt?: string | null;
  completedAt?: string | null;
  parts?: Part[];
  statusChanges?: JobCardStatusChange[];
  mechanicId: string;
}

export interface VehicleSummary {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  isActive: boolean;
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  vehicles: VehicleSummary[];
}

export interface WorkshopSummary {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone?: string;
  speciality?: string;
  isActive: boolean;
  workshopId: string;
  workshop?: WorkshopSummary;
}
