import type {
  ApartmentPrice,
  Bus,
  EmailTemplate,
  Gallery,
  GalleryImage,
  Guest,
  Location,
  Region,
} from '@/types/domain';

export interface ReferenceDataRepository {
  listRegions(): Promise<Region[]>;
  listLocations(regionId?: string): Promise<Location[]>;
  listGalleries(regionId?: string): Promise<Gallery[]>;
  listGalleryImages(galleryId?: string): Promise<GalleryImage[]>;
  listBuses(regionId?: string): Promise<Bus[]>;
  listApartmentPrices(apartmentId?: string): Promise<ApartmentPrice[]>;
  listEmailTemplates(regionId?: string): Promise<EmailTemplate[]>;
  listGuests(): Promise<Guest[]>;
}
