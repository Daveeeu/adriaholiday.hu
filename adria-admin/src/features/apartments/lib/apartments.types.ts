import type { Apartment, Gallery, Location, Region } from '@/types/domain';

export type ApartmentPanelMode = 'create' | 'edit' | 'detail';

export type ApartmentPricingMatrixValues = {
  columns: Array<{
    id: string;
    startDate: string;
    endDate: string;
  }>;
  rows: Array<{
    id: string;
    category: string;
    beds: string;
    prices: string[];
  }>;
};

export type ApartmentFormValues = {
  isActive: boolean;
  active: boolean;
  featured: boolean;
  isAccommodation: boolean;
  accommodation: boolean;
  stars: number;
  name: string;
  slug: string;
  seoName: string;
  seo_name: string;
  autoGenerateSeoName: boolean;
  seo_auto_generate: boolean;
  code: string;
  type: Apartment['type'] | '';
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeM2: number;
  address: string;
  mapAddress: string;
  map_address: string;
  latitude: number;
  longitude: number;
  coordinates: string;
  shortDescription: string;
  description: string;
  additionalInformation: string;
  apartmentTypeContent: string;
  apartment_type_content: string;
  apartment_type_description: string;
  apartment_type_text_description: string;
  apartment_type_text_description_2: string;
  typeDescription: string;
  allInclusiveDescription: string;
  allInclusiveContent: string;
  all_inclusive_content: string;
  regionId: string;
  locationId: string;
  galleryId: string;
  amenities: string[];
  services: string[];
  priceHeader: string;
  priceInnerHeader: string;
  pricingMatrix: ApartmentPricingMatrixValues;
  priceSeasons: Array<{
    id: string;
    apartmentId?: string;
    apartment_id?: string;
    startDate: string;
    start_date?: string;
    endDate: string;
    end_date?: string;
    category: string;
    beds: string;
    price: string;
  }>;
  status: Apartment['status'];
  region_id: string;
  place_id: string;
  gallery_id: string;
};

export type ApartmentFormContext = {
  locations: Location[];
  galleries: Gallery[];
  regions: Region[];
  defaultType?: Apartment['type'] | '';
};
