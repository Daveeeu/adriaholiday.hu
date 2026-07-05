import type {
  ApartmentMutationInput,
  ApartmentsListQuery,
} from '@/api/admin-api';
import { repositories } from '@/repositories';

export async function getApartments(query?: ApartmentsListQuery) {
  return repositories.apartmentRepository.list(query);
}

export async function getApartmentById(apartmentId: string) {
  return repositories.apartmentRepository.getById(apartmentId);
}

export async function createApartment(input: ApartmentMutationInput) {
  return repositories.apartmentRepository.create(input);
}

export async function updateApartment(
  apartmentId: string,
  input: ApartmentMutationInput,
) {
  return repositories.apartmentRepository.update(apartmentId, input);
}

export async function deleteApartment(apartmentId: string) {
  return repositories.apartmentRepository.delete(apartmentId);
}
