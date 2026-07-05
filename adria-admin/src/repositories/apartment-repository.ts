import type {
  ApartmentMutationInput,
  ApartmentsListQuery,
} from '@/api/admin-api';
import type { PaginatedResponse } from '@/lib/api-client';
import type { Apartment } from '@/types/domain';

export interface ApartmentRepository {
  list(query?: ApartmentsListQuery): Promise<PaginatedResponse<Apartment>>;
  getById(apartmentId: string): Promise<Apartment>;
  create(input: ApartmentMutationInput): Promise<Apartment>;
  update(
    apartmentId: string,
    input: ApartmentMutationInput,
  ): Promise<Apartment>;
  delete(apartmentId: string): Promise<{ id: string }>;
}
