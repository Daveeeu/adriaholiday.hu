import type { ApartmentMutationInput } from '@/api/admin-api';
import type { Apartment } from '@/types/domain';

export interface ApartmentRepository {
  list(regionId?: string): Promise<Apartment[]>;
  getById(apartmentId: string): Promise<Apartment>;
  create(input: ApartmentMutationInput): Promise<Apartment>;
  update(
    apartmentId: string,
    input: ApartmentMutationInput,
  ): Promise<Apartment>;
  delete(apartmentId: string): Promise<{ id: string }>;
}
