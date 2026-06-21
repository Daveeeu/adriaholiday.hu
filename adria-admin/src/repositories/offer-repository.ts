import type { OfferFilters, OfferMutationInput } from '@/api/admin-api';
import type { Offer, OfferContent, OfferDetail } from '@/types/domain';

export interface OfferRepository {
  list(filters?: OfferFilters): Promise<Offer[]>;
  listContents(offerId?: string): Promise<OfferContent[]>;
  getById(offerId: string): Promise<OfferDetail | null>;
  create(input: OfferMutationInput): Promise<OfferDetail>;
  update(offerId: string, input: OfferMutationInput): Promise<OfferDetail>;
  delete(offerId: string): Promise<{ id: string }>;
  setStatus(offerId: string, status: Offer['status']): Promise<Offer>;
}
