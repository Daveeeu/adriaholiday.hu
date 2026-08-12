import type { ApartmentTypeMutationInput } from '@/api/admin-api';
import { repositories } from '@/repositories';

export async function getApartmentTypes() {
  return repositories.apartmentTypeRepository.list();
}

export async function createApartmentType(input: ApartmentTypeMutationInput) {
  return repositories.apartmentTypeRepository.create(input);
}

export async function updateApartmentType(
  apartmentTypeId: string,
  input: ApartmentTypeMutationInput,
) {
  return repositories.apartmentTypeRepository.update(apartmentTypeId, input);
}

export async function deleteApartmentType(apartmentTypeId: string) {
  return repositories.apartmentTypeRepository.delete(apartmentTypeId);
}

export async function setApartmentTypeActiveState(
  apartmentTypeId: string,
  isActive: boolean,
) {
  return repositories.apartmentTypeRepository.setActiveState(apartmentTypeId, isActive);
}
