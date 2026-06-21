import { repositories } from '@/repositories';

export async function getGuests() {
  return repositories.referenceDataRepository.listGuests();
}
