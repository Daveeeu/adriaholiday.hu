import type {
  Apartment,
  ApartmentPrice,
  ApartmentPriceSeason,
  ApartmentType,
  Booking,
  BookingDetail,
  Bus,
  EmailTemplate,
  Gallery,
  GalleryImage,
  Guest,
  Location,
  Region,
} from '@/types/domain';
import type { PaginatedResponse } from '@/lib/api-client';

export type RegionMutationInput = {
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  portfolioFeatured?: boolean;
  portfolioSortOrder?: number;
  portfolioImageUrl?: string | null;
  portfolioShortDescription?: string | null;
};

export type ApartmentTypeMutationInput = {
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

/** A location with the texts of its public apartment page. */
export type LocationMutationInput = Pick<
  Location,
  'regionId' | 'slug' | 'name' | 'type' | 'latitude' | 'longitude' | 'transferMinutesFromAirport' | 'featured'
> & {
  isActive: boolean;
  description: string;
  areaSlug: string;
  areaName: string;
  guide: string;
  apartmentInformation: string;
  seoTitle: string;
  seoDescription: string;
  seoRobots: string;
};

export type ApartmentGalleryItemInput = {
  /** An existing item's id; none for a new one. */
  id?: string;
  mediaId: string;
  title: string;
  alt: string;
  sortOrder: number;
  active: boolean;
};

export type ApartmentMutationInput = {
  name: string;
  regionId: string;
  locationId: string;
  galleryId: string;
  gallery: ApartmentGalleryItemInput[];
  distanceToCenterM: number | null;
  distanceToSeaM: number | null;
  seoTitle: string;
  seoDescription: string;
  seoRobots: string;
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

export type BookingStatusMutationInput = {
  status: Booking['status'];
};

export type ApartmentsListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  regionId?: string;
  type?: string;
  isAccommodation?: boolean;
  isActive?: boolean;
  featured?: boolean;
};

export interface AdminApi {
  listRegions(): Promise<Region[]>;
  updateLocation(locationId: string, input: LocationMutationInput): Promise<Location>;
  createRegion(input: RegionMutationInput): Promise<Region>;
  updateRegion(regionId: string, input: RegionMutationInput): Promise<Region>;
  deleteRegion(regionId: string): Promise<{ id: string }>;
  setRegionActiveState(regionId: string, isActive: boolean): Promise<Region>;
  listApartmentTypes(): Promise<ApartmentType[]>;
  createApartmentType(input: ApartmentTypeMutationInput): Promise<ApartmentType>;
  updateApartmentType(
    apartmentTypeId: string,
    input: ApartmentTypeMutationInput,
  ): Promise<ApartmentType>;
  deleteApartmentType(apartmentTypeId: string): Promise<{ id: string }>;
  setApartmentTypeActiveState(
    apartmentTypeId: string,
    isActive: boolean,
  ): Promise<ApartmentType>;
  listLocations(regionId?: string): Promise<Location[]>;
  listGalleries(regionId?: string): Promise<Gallery[]>;
  listGalleryImages(galleryId?: string): Promise<GalleryImage[]>;
  listBuses(regionId?: string): Promise<Bus[]>;
  listApartments(
    query?: ApartmentsListQuery,
  ): Promise<PaginatedResponse<Apartment>>;
  getApartmentById(apartmentId: string): Promise<Apartment>;
  createApartment(input: ApartmentMutationInput): Promise<Apartment>;
  updateApartment(
    apartmentId: string,
    input: ApartmentMutationInput,
  ): Promise<Apartment>;
  deleteApartment(apartmentId: string): Promise<{ id: string }>;
  listApartmentPrices(apartmentId?: string): Promise<ApartmentPrice[]>;
  listBookings(regionId?: string): Promise<Booking[]>;
  getBookingById(bookingId: string): Promise<BookingDetail | null>;
  updateBookingStatus(
    bookingId: string,
    input: BookingStatusMutationInput,
  ): Promise<Booking>;
  listEmailTemplates(regionId?: string): Promise<EmailTemplate[]>;
  listGuests(): Promise<Guest[]>;
}
