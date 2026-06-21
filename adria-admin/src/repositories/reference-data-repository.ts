import type {
  OfferDateBulkOperationInput,
  OfferDateMutationInput,
} from '@/api/admin-api';
import type {
  ApartmentPrice,
  Bus,
  EmailTemplate,
  Gallery,
  GalleryImage,
  Guest,
  Location,
  OfferDate,
  OfferGroup,
  Region,
} from '@/types/domain';

export interface ReferenceDataRepository {
  listRegions(): Promise<Region[]>;
  listLocations(regionId?: string): Promise<Location[]>;
  listGalleries(regionId?: string): Promise<Gallery[]>;
  listGalleryImages(galleryId?: string): Promise<GalleryImage[]>;
  listBuses(regionId?: string): Promise<Bus[]>;
  listApartmentPrices(apartmentId?: string): Promise<ApartmentPrice[]>;
  listOfferGroups(regionId?: string): Promise<OfferGroup[]>;
  listOfferDates(regionId?: string): Promise<OfferDate[]>;
  createOfferDate(input: OfferDateMutationInput): Promise<OfferDate>;
  updateOfferDate(
    offerDateId: string,
    input: OfferDateMutationInput,
  ): Promise<OfferDate>;
  deleteOfferDate(offerDateId: string): Promise<{ id: string }>;
  cloneOfferDate(offerDateId: string): Promise<OfferDate>;
  bulkUpdateOfferDates(
    input: OfferDateBulkOperationInput,
  ): Promise<
    | { ids: string[]; action: OfferDateBulkOperationInput['action'] }
    | OfferDate[]
  >;
  listEmailTemplates(regionId?: string): Promise<EmailTemplate[]>;
  listGuests(): Promise<Guest[]>;
}
