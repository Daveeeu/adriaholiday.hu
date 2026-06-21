import type {
  Apartment,
  ApartmentPrice,
  ApartmentPriceSeason,
  Booking,
  BookingDetail,
  Bus,
  EmailTemplate,
  Gallery,
  GalleryImage,
  Guest,
  Location,
  Offer,
  OfferContent,
  OfferDate,
  OfferDetail,
  OfferGroup,
  Region,
} from '@/types/domain';

export type RegionMutationInput = {
  name: string;
  slug: string;
  status: 'active' | 'inactive';
};

export type ApartmentMutationInput = {
  name: string;
  regionId: string;
  locationId: string;
  galleryId: string;
  type: Apartment['type'];
  code: string;
  slug?: string;
  seoName: string;
  seo_name?: string;
  seo_auto_generate?: boolean;
  isActive: boolean;
  active?: boolean;
  isAccommodation: boolean;
  accommodation?: boolean;
  featured: boolean;
  stars: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeM2: number;
  address: string;
  mapAddress: string;
  map_address?: string;
  latitude: number;
  longitude: number;
  coordinates?: string;
  shortDescription: string;
  description: string;
  additionalInformation: string;
  typeDescription: string;
  apartmentTypeContent?: string;
  apartment_type_content?: string;
  apartment_type_description?: string;
  apartment_type_text_description?: string;
  apartment_type_text_description_2?: string;
  allInclusiveDescription: string;
  allInclusiveContent?: string;
  all_inclusive_content?: string;
  priceHeader: string;
  priceInnerHeader: string;
  pricingMatrix: Apartment['pricingMatrix'];
  priceSeasons?: ApartmentPriceSeason[];
  status: Apartment['status'];
  amenities: string[];
  services?: string[];
  region_id?: string;
  place_id?: string;
  gallery_id?: string;
};

export type OfferTranslationInput = {
  title: string;
  description: string;
  program: string;
  tickets: string;
  optionalPrograms: string;
  pricingInformation: string;
  teaser: string;
};

export type OfferMutationInput = {
  title: string;
  slug: string;
  featured: boolean;
  status: Offer['status'];
  pdfUrl: string;
  regionId: string;
  offerGroupId: string;
  galleryId: string;
  translations: Record<'hu' | 'en' | 'de', OfferTranslationInput>;
};

export type OfferDateMutationInput = {
  offerId: string;
  startDate: string;
  endDate: string;
  price: number;
  active: boolean;
  xmlExportEnabled: boolean;
};

export type OfferDateBulkOperationInput = {
  ids: string[];
  action: 'activate' | 'deactivate' | 'enable-xml' | 'disable-xml' | 'delete';
};

export type BookingStatusMutationInput = {
  status: Booking['status'];
};

export type OfferFilters = {
  regionId?: string;
  offerGroupId?: string;
  featured?: boolean;
};

export interface AdminApi {
  listRegions(): Promise<Region[]>;
  createRegion(input: RegionMutationInput): Promise<Region>;
  updateRegion(regionId: string, input: RegionMutationInput): Promise<Region>;
  deleteRegion(regionId: string): Promise<{ id: string }>;
  setRegionActiveState(regionId: string, isActive: boolean): Promise<Region>;
  listLocations(regionId?: string): Promise<Location[]>;
  listGalleries(regionId?: string): Promise<Gallery[]>;
  listGalleryImages(galleryId?: string): Promise<GalleryImage[]>;
  listBuses(regionId?: string): Promise<Bus[]>;
  listApartments(regionId?: string): Promise<Apartment[]>;
  getApartmentById(apartmentId: string): Promise<Apartment>;
  createApartment(input: ApartmentMutationInput): Promise<Apartment>;
  updateApartment(
    apartmentId: string,
    input: ApartmentMutationInput,
  ): Promise<Apartment>;
  deleteApartment(apartmentId: string): Promise<{ id: string }>;
  listApartmentPrices(apartmentId?: string): Promise<ApartmentPrice[]>;
  listOfferGroups(regionId?: string): Promise<OfferGroup[]>;
  listOfferContents(offerId?: string): Promise<OfferContent[]>;
  listOffers(filters?: OfferFilters): Promise<Offer[]>;
  createOffer(input: OfferMutationInput): Promise<OfferDetail>;
  updateOffer(offerId: string, input: OfferMutationInput): Promise<OfferDetail>;
  deleteOffer(offerId: string): Promise<{ id: string }>;
  setOfferStatus(offerId: string, status: Offer['status']): Promise<Offer>;
  getOfferById(offerId: string): Promise<OfferDetail | null>;
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
  listBookings(regionId?: string): Promise<Booking[]>;
  getBookingById(bookingId: string): Promise<BookingDetail | null>;
  updateBookingStatus(
    bookingId: string,
    input: BookingStatusMutationInput,
  ): Promise<Booking>;
  listEmailTemplates(regionId?: string): Promise<EmailTemplate[]>;
  listGuests(): Promise<Guest[]>;
}
