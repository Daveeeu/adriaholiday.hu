import type { ApartmentTypeMutationInput } from '@/api/admin-api';
import type { ApartmentType } from '@/types/domain';

export interface ApartmentTypeRepository {
  list(): Promise<ApartmentType[]>;
  create(input: ApartmentTypeMutationInput): Promise<ApartmentType>;
  update(apartmentTypeId: string, input: ApartmentTypeMutationInput): Promise<ApartmentType>;
  delete(apartmentTypeId: string): Promise<{ id: string }>;
  setActiveState(apartmentTypeId: string, isActive: boolean): Promise<ApartmentType>;
}
