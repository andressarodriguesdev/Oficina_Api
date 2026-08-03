import { api } from './api';
import type { Customer, JobCard, Vehicle, CustomerDetail } from '../types';

export async function listCustomers(): Promise<Customer[]> {
  return api.get<Customer[]>('/customers');
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  return api.get<CustomerDetail>(`/customers/${id}`);
}

export async function getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
  return api.get<Vehicle[]>(`/customers/${customerId}/vehicles`);
}

export async function getCustomerJobCards(customerId: string): Promise<JobCard[]> {
  return api.get<JobCard[]>(`/customers/${customerId}/job-cards`);
}

export interface CustomerInput {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  return api.post<Customer>('/customers', input);
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>
): Promise<Customer> {
  return api.put<Customer>(`/customers/${id}`, input);
}

export async function deactivateCustomer(id: string): Promise<void> {
  await api.patch(`/customers/${id}/deactivate`);
}

export async function reactivateCustomer(id: string): Promise<void> {
  await api.patch(`/customers/${id}/reactivate`);
}
