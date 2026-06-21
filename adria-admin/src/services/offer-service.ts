import type { OfferMutationInput } from '@/api/admin-api';
import { repositories } from '@/repositories';
import type { Offer } from '@/types/domain';

export async function getOffers(
  filters?: Parameters<typeof repositories.offerRepository.list>[0],
) {
  return repositories.offerRepository.list(filters);
}

export async function getOfferContents(offerId?: string) {
  return repositories.offerRepository.listContents(offerId);
}

export async function getOfferById(offerId: string) {
  return repositories.offerRepository.getById(offerId);
}

export async function createOffer(input: OfferMutationInput) {
  return repositories.offerRepository.create(input);
}

export async function updateOffer(offerId: string, input: OfferMutationInput) {
  return repositories.offerRepository.update(offerId, input);
}

export async function deleteOffer(offerId: string) {
  return repositories.offerRepository.delete(offerId);
}

export async function setOfferStatus(offerId: string, status: Offer['status']) {
  return repositories.offerRepository.setStatus(offerId, status);
}
