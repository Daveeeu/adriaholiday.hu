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
  createRegion(input: RegionMutationInput): Promise<Region>;
  updateRegion(regionId: string, input: RegionMutationInput): Promise<Region>;
  deleteRegion(regionId: string): Promise<{ id: string }>;
  setRegionActiveState(regionId: string, isActive: boolean): Promise<Region>;
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
