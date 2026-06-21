export type EntityStatus = 'draft' | 'published' | 'archived';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ApartmentType =
  | 'greek'
  | 'bulgarian'
  | 'montenegro'
  | 'croatian'
  | 'croatian_new';

export interface ApartmentPricingMatrixColumn {
  id: string;
  startDate: string;
  endDate: string;
}

export interface ApartmentPricingMatrixRow {
  id: string;
  category: string;
  beds: string;
  prices: string[];
}

export interface ApartmentPricingMatrix {
  columns: ApartmentPricingMatrixColumn[];
  rows: ApartmentPricingMatrixRow[];
}

export interface ApartmentPriceSeason {
  id: string;
  apartmentId: string;
  apartment_id?: string;
  startDate: string;
  start_date?: string;
  endDate: string;
  end_date?: string;
  category: string;
  beds: string;
  price: string;
}

export type LocationType = 'city' | 'island' | 'coastal_town' | 'national_park';

export type OfferDateStatus = 'scheduled' | 'guaranteed' | 'sold_out';

export type EmailTemplateCategory =
  | 'booking'
  | 'pre_arrival'
  | 'on_stay'
  | 'post_stay'
  | 'operations';

export interface Region {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  timezone: string;
  currency: string;
  heroImageUrl: string;
  summary: string;
  description: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  regionId: string;
  slug: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  transferMinutesFromAirport: number;
  description: string;
  featured: boolean;
}

export interface Gallery {
  id: string;
  regionId: string;
  title: string;
  category: 'offer' | 'apartment' | 'destination';
  coverImageId: string;
  imageIds: string[];
  images?: GalleryImage[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  galleryId: string;
  regionId: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
  tags: string[];
}

export interface Bus {
  id: string;
  regionId: string;
  arrivalLocationId: string;
  routeName: string;
  departureCity: string;
  departureTime: string;
  arrivalTime: string;
  operatingDays: string[];
  seatCapacity: number;
  priceFrom: number;
  isAirportTransfer: boolean;
  isActive: boolean;
}

export interface Apartment {
  id: string;
  type: ApartmentType;
  regionId: string;
  locationId: string;
  galleryId: string;
  slug: string;
  name: string;
  code?: string;
  seoName?: string;
  seo_name?: string;
  seo_auto_generate?: boolean;
  isActive?: boolean;
  active?: boolean;
  isAccommodation?: boolean;
  accommodation?: boolean;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeM2: number;
  address: string;
  mapAddress?: string;
  map_address?: string;
  latitude: number;
  longitude: number;
  coordinates?: string;
  stars: number;
  amenities: string[];
  services?: string[];
  shortDescription: string;
  description?: string;
  additionalInformation?: string;
  typeDescription?: string;
  apartmentTypeContent?: string;
  apartment_type_content?: string;
  apartment_type_description?: string;
  apartment_type_text_description?: string;
  apartment_type_text_description_2?: string;
  allInclusiveDescription?: string;
  allInclusiveContent?: string;
  all_inclusive_content?: string;
  priceHeader?: string;
  priceInnerHeader?: string;
  pricingMatrix?: ApartmentPricingMatrix;
  priceSeasons?: ApartmentPriceSeason[];
  status: EntityStatus;
  featured: boolean;
  region_id?: string;
  place_id?: string;
  gallery_id?: string;
}

export interface ApartmentPrice {
  id: string;
  apartmentId: string;
  seasonName: string;
  currency: string;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  minNights: number;
  validFrom: string;
  validTo: string;
}

export interface OfferGroup {
  id: string;
  regionId: string;
  slug: string;
  name: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface OfferContent {
  id: string;
  offerId: string;
  locale: 'en' | 'de' | 'hu';
  title: string;
  description: string;
  program: string;
  tickets: string;
  optionalPrograms: string;
  pricingInformation: string;
  teaser: string;
}

export interface OfferDate {
  id: string;
  offerId: string;
  regionId: string;
  startDate: string;
  endDate: string;
  nights: number;
  price: number;
  discountPrice?: number;
  currency: string;
  availableSlots: number;
  status: OfferDateStatus;
  active: boolean;
  xmlExportEnabled: boolean;
  apartmentIds: string[];
}

export interface Offer {
  id: string;
  regionId: string;
  locationId: string;
  galleryId: string;
  offerGroupId: string;
  title: string;
  slug: string;
  code: string;
  status: EntityStatus;
  featured: boolean;
  pdfUrl: string;
  includes: string[];
  exclusions: string[];
  imageIds: string[];
  dateIds: string[];
  contentIds: string[];
  apartmentIds: string[];
}

export interface Booking {
  id: string;
  regionId: string;
  locationId: string;
  offerId: string;
  offerDateId: string;
  apartmentId: string;
  reference: string;
  guestName: string;
  email: string;
  phone: string;
  country: string;
  adults: number;
  children: number;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface BookingDetail extends Booking {
  region: Region;
  location: Location;
  offer: Offer;
  offerDate: OfferDate;
  apartment: Apartment;
}

export interface EmailTemplate {
  id: string;
  regionId?: string;
  key: string;
  category: EmailTemplateCategory;
  locale: 'en' | 'de' | 'hu';
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  previewText: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  preferredProperty: string;
}

export interface OfferDetail extends Offer {
  region: Region;
  location: Location;
  gallery: Gallery;
  offerGroup: OfferGroup;
  dates: OfferDate[];
  translations: OfferContent[];
  images: GalleryImage[];
  apartments: Apartment[];
}
