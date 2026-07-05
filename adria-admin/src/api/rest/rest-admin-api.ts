import type {
  Apartment,
  ApartmentPrice,
  Booking,
  BookingDetail,
  Bus,
  EmailTemplate,
  Gallery,
  GalleryImage,
  Guest,
  Location,
  Offer,
  OfferDate,
  OfferGroup,
  Region,
} from '@/types/domain';
import type {
  AdminApi,
  ApartmentsListQuery,
  BookingStatusMutationInput,
  OfferDateBulkOperationInput,
  OfferDateMutationInput,
  RegionMutationInput,
  ApartmentMutationInput,
} from '@/api/admin-api';
import {
  apiClient,
  type ApiQuery,
  type PaginatedResponse,
} from '@/lib/api-client';

type ApiBooking = {
  id: string | number;
  bookingType?: string;
  status: string;
  paymentStatus?: string | null;
  regionId?: string | null;
  locationId?: string | null;
  offerId?: string | null;
  offerDateId?: string | null;
  apartmentId?: string | null;
  tourId?: string | null;
  customerName?: string | null;
  name?: string | null;
  guestName?: string | null;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerPhone?: string | null;
  partnerAddress?: string | null;
  partnerCity?: string | null;
  partnerCountry?: string | null;
  partnerNote?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  city?: string | null;
  adults?: number | null;
  children?: number | null;
  passengerCount?: number | null;
  passengers?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  departureDate?: string | null;
  arrival?: string | null;
  departure?: string | null;
  appointmentTime?: string | null;
  applicationDate?: string | null;
  bookingDate?: string | null;
  propertyNameSnapshot?: string | null;
  propertyName?: string | null;
  offerName?: string | null;
  apartmentName?: string | null;
  offerCode?: string | null;
  totalAmount?: number | null;
  paidAmount?: number | null;
  currency?: string | null;
  credited?: boolean | null;
  cancelled?: boolean | null;
  notes?: string | null;
  message?: string | null;
  createdAt: string;
  updatedAt?: string;
  region?: Region;
  location?: Location;
  offer?: Offer;
  offerDate?: OfferDate;
  apartment?: Apartment;
};

function normalizePaginatedQuery(query?: ApiQuery): ApiQuery {
  return query ?? {};
}

function toStringId(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

function mapPaginated<T>(response: PaginatedResponse<T>) {
  return response.items;
}

function mapRegion(region: Region): Region {
  return {
    ...region,
    id: toStringId(region.id),
    portfolioFeatured: Boolean(region.portfolioFeatured),
    portfolioSortOrder: Number(region.portfolioSortOrder ?? 0),
    portfolioImageUrl: region.portfolioImageUrl ?? null,
    portfolioShortDescription: region.portfolioShortDescription ?? null,
  };
}

function mapLocation(location: Location): Location {
  return {
    ...location,
    id: toStringId(location.id),
    regionId: toStringId(location.regionId),
  };
}

function mapGallery(gallery: Gallery): Gallery {
  return {
    ...gallery,
    id: toStringId(gallery.id),
    regionId: toStringId(gallery.regionId),
    coverImageId: toStringId(gallery.coverImageId),
    imageIds: (gallery.imageIds ?? []).map((imageId) => toStringId(imageId)),
    images: gallery.images?.map(mapGalleryImage),
  };
}

function mapGalleryImage(image: GalleryImage): GalleryImage {
  return {
    ...image,
    id: toStringId(image.id),
    galleryId: toStringId(image.galleryId),
    regionId: toStringId(image.regionId),
  };
}

function mapBus(bus: Bus): Bus {
  return {
    ...bus,
    id: toStringId(bus.id),
  };
}

function mapApartment(apartment: Apartment): Apartment {
  return {
    ...apartment,
    id: toStringId(apartment.id),
    regionId: toStringId(apartment.regionId ?? apartment.region_id),
    locationId: toStringId(apartment.locationId ?? apartment.place_id),
    galleryId: toStringId(apartment.galleryId ?? apartment.gallery_id),
    region_id: toStringId(apartment.region_id),
    place_id: toStringId(apartment.place_id),
    gallery_id: toStringId(apartment.gallery_id),
    priceSeasons: apartment.priceSeasons?.map((season) => ({
      ...season,
      id: toStringId(season.id),
      apartmentId: toStringId(season.apartmentId ?? season.apartment_id),
      apartment_id: toStringId(season.apartment_id),
    })),
  };
}

function mapOfferGroup(group: OfferGroup): OfferGroup {
  return {
    ...group,
    id: toStringId(group.id),
    regionId: toStringId(group.regionId),
  };
}

function mapOfferDate(date: OfferDate): OfferDate {
  return {
    ...date,
    id: toStringId(date.id),
    offerId: toStringId(date.offerId),
    regionId: toStringId(date.regionId),
    apartmentIds: (date.apartmentIds ?? []).map((apartmentId) =>
      toStringId(apartmentId),
    ),
  };
}

function mapBooking(booking: ApiBooking): Booking {
  return {
    id: String(booking.id),
    regionId: booking.regionId ?? '',
    locationId: booking.locationId ?? '',
    offerId: booking.offerId ?? '',
    offerDateId: booking.offerDateId ?? '',
    apartmentId: booking.apartmentId ?? '',
    reference: booking.offerCode ?? String(booking.id),
    guestName:
      booking.guestName ??
      booking.partnerName ??
      booking.customerName ??
      booking.name ??
      '',
    email: booking.email ?? booking.partnerEmail ?? '',
    phone: booking.phone ?? booking.partnerPhone ?? '',
    country: booking.country ?? booking.partnerCountry ?? '',
    adults: booking.adults ?? 0,
    children: booking.children ?? 0,
    propertyName:
      booking.propertyName ??
      booking.propertyNameSnapshot ??
      booking.apartmentName ??
      booking.offerName ??
      booking.partnerName ??
      '',
    checkIn: booking.checkIn ?? '',
    checkOut: booking.checkOut ?? '',
    totalAmount: booking.totalAmount ?? 0,
    paidAmount: booking.paidAmount ?? 0,
    currency: booking.currency ?? 'EUR',
    status: booking.status as Booking['status'],
    createdAt: booking.createdAt,
    notes: booking.notes ?? undefined,
  };
}

function mapBookingDetail(booking: ApiBooking): BookingDetail {
  return {
    ...mapBooking(booking),
    region: (booking.region ?? {}) as Region,
    location: (booking.location ?? {}) as Location,
    offer: (booking.offer ?? {}) as Offer,
    offerDate: (booking.offerDate ?? {}) as OfferDate,
    apartment: (booking.apartment ?? {}) as Apartment,
  };
}

export class RestAdminApi implements AdminApi {
  public async listRegions(): Promise<Region[]> {
    const response = await apiClient.get<PaginatedResponse<Region>>(
      '/api/admin/regions',
      { query: { page: 1, perPage: 1000 } },
    );
    return mapPaginated(response).map(mapRegion);
  }

  public async createRegion(input: RegionMutationInput): Promise<Region> {
    return apiClient.post<Region>('/api/admin/regions', input);
  }

  public async updateRegion(
    regionId: string,
    input: RegionMutationInput,
  ): Promise<Region> {
    return apiClient.patch<Region>(`/api/admin/regions/${regionId}`, input);
  }

  public async deleteRegion(regionId: string): Promise<{ id: string }> {
    await apiClient.delete<void>(`/api/admin/regions/${regionId}`);
    return { id: regionId };
  }

  public async setRegionActiveState(
    regionId: string,
    isActive: boolean,
  ): Promise<Region> {
    return apiClient.patch<Region>(`/api/admin/regions/${regionId}/status`, {
      status: isActive ? 'active' : 'inactive',
    });
  }

  public async listLocations(regionId?: string): Promise<Location[]> {
    const response = await apiClient.get<PaginatedResponse<Location>>(
      '/api/admin/locations',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return mapPaginated(response).map(mapLocation);
  }

  public async listGalleries(regionId?: string): Promise<Gallery[]> {
    const response = await apiClient.get<PaginatedResponse<Gallery>>(
      '/api/admin/galleries',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return mapPaginated(response).map(mapGallery);
  }

  public async listGalleryImages(galleryId?: string): Promise<GalleryImage[]> {
    if (!galleryId) {
      return [];
    }

    const gallery = await apiClient.get<Gallery>(
      `/api/admin/galleries/${galleryId}`,
    );
    return (
      (gallery as Gallery & { images?: GalleryImage[] }).images ?? []
    ).map(mapGalleryImage);
  }

  public async listBuses(regionId?: string): Promise<Bus[]> {
    const response = await apiClient.get<PaginatedResponse<Bus>>(
      '/api/admin/buses',
      {
        query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }),
      },
    );
    return mapPaginated(response).map(mapBus);
  }

  public async listApartments(
    query?: ApartmentsListQuery,
  ): Promise<PaginatedResponse<Apartment>> {
    const response = await apiClient.get<PaginatedResponse<Apartment>>(
      '/api/admin/apartments',
      { query: normalizePaginatedQuery({ page: 1, perPage: 25, ...query }) },
    );
    return { ...response, items: response.items.map(mapApartment) };
  }

  public async getApartmentById(apartmentId: string): Promise<Apartment> {
    const apartment = await apiClient.get<Apartment>(
      `/api/admin/apartments/${apartmentId}`,
    );
    return mapApartment(apartment);
  }

  public async createApartment(
    input: ApartmentMutationInput,
  ): Promise<Apartment> {
    return apiClient.post<Apartment>('/api/admin/apartments', input);
  }

  public async updateApartment(
    apartmentId: string,
    input: ApartmentMutationInput,
  ): Promise<Apartment> {
    return apiClient.patch<Apartment>(
      `/api/admin/apartments/${apartmentId}`,
      input,
    );
  }

  public async deleteApartment(apartmentId: string): Promise<{ id: string }> {
    await apiClient.delete<void>(`/api/admin/apartments/${apartmentId}`);
    return { id: apartmentId };
  }

  public async listApartmentPrices(
    apartmentId?: string,
  ): Promise<ApartmentPrice[]> {
    if (!apartmentId) {
      return [];
    }

    const response = await apiClient.get<PaginatedResponse<ApartmentPrice>>(
      `/api/admin/apartments/${apartmentId}/prices`,
      { query: { page: 1, perPage: 1000 } },
    );
    return response.items;
  }

  public async listOfferGroups(regionId?: string): Promise<OfferGroup[]> {
    const response = await apiClient.get<PaginatedResponse<OfferGroup>>(
      '/api/admin/offer-groups',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return mapPaginated(response).map(mapOfferGroup);
  }

  public async listOfferDates(regionId?: string): Promise<OfferDate[]> {
    const response = await apiClient.get<PaginatedResponse<OfferDate>>(
      '/api/admin/offer-dates',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return mapPaginated(response).map(mapOfferDate);
  }

  public async createOfferDate(
    input: OfferDateMutationInput,
  ): Promise<OfferDate> {
    return apiClient.post<OfferDate>('/api/admin/offer-dates', input);
  }

  public async updateOfferDate(
    offerDateId: string,
    input: OfferDateMutationInput,
  ): Promise<OfferDate> {
    return apiClient.patch<OfferDate>(
      `/api/admin/offer-dates/${offerDateId}`,
      input,
    );
  }

  public async deleteOfferDate(offerDateId: string): Promise<{ id: string }> {
    await apiClient.delete<void>(`/api/admin/offer-dates/${offerDateId}`);
    return { id: offerDateId };
  }

  public async cloneOfferDate(offerDateId: string): Promise<OfferDate> {
    return apiClient.post<OfferDate>(
      `/api/admin/offer-dates/${offerDateId}/clone`,
    );
  }

  public async bulkUpdateOfferDates(
    input: OfferDateBulkOperationInput,
  ): Promise<
    | { ids: string[]; action: OfferDateBulkOperationInput['action'] }
    | OfferDate[]
  > {
    return apiClient.patch<
      | { ids: string[]; action: OfferDateBulkOperationInput['action'] }
      | OfferDate[]
    >('/api/admin/offer-dates/bulk', input);
  }

  public async listBookings(regionId?: string): Promise<Booking[]> {
    const response = await apiClient.get<PaginatedResponse<ApiBooking>>(
      '/api/admin/bookings',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return mapPaginated(response).map(mapBooking);
  }

  public async getBookingById(
    bookingId: string,
  ): Promise<BookingDetail | null> {
    const response = await apiClient.get<ApiBooking>(
      `/api/admin/bookings/${bookingId}`,
    );
    return response ? mapBookingDetail(response) : null;
  }

  public async updateBookingStatus(
    bookingId: string,
    input: BookingStatusMutationInput,
  ): Promise<Booking> {
    const response = await apiClient.patch<ApiBooking>(
      `/api/admin/bookings/${bookingId}/status`,
      input,
    );
    return mapBooking(response);
  }

  public async listEmailTemplates(regionId?: string): Promise<EmailTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<EmailTemplate>>(
      '/api/admin/email-templates',
      { query: normalizePaginatedQuery({ page: 1, perPage: 1000, regionId }) },
    );
    return response.items;
  }

  public async listGuests(): Promise<Guest[]> {
    const response = await apiClient.get<PaginatedResponse<Guest>>(
      '/api/admin/guests',
      { query: { page: 1, perPage: 1000 } },
    );
    return response.items;
  }
}

export const restAdminApi = new RestAdminApi();
