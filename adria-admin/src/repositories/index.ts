import type { ApartmentRepository } from '@/repositories/apartment-repository';
import type { BookingRepository } from '@/repositories/booking-repository';
import type { ReferenceDataRepository } from '@/repositories/reference-data-repository';
import type { RegionRepository } from '@/repositories/region-repository';
import { restAdminApi } from '@/api/rest/rest-admin-api';

export type AdminRepositories = {
  regionRepository: RegionRepository;
  apartmentRepository: ApartmentRepository;
  bookingRepository: BookingRepository;
  referenceDataRepository: ReferenceDataRepository;
};

export const repositories: AdminRepositories = {
  regionRepository: {
    list: () => restAdminApi.listRegions(),
    create: (input) => restAdminApi.createRegion(input),
    update: (regionId, input) => restAdminApi.updateRegion(regionId, input),
    delete: (regionId) => restAdminApi.deleteRegion(regionId),
    setActiveState: (regionId, isActive) =>
      restAdminApi.setRegionActiveState(regionId, isActive),
  },
  apartmentRepository: {
    list: (query) => restAdminApi.listApartments(query),
    getById: (apartmentId) => restAdminApi.getApartmentById(apartmentId),
    create: (input) => restAdminApi.createApartment(input),
    update: (apartmentId, input) =>
      restAdminApi.updateApartment(apartmentId, input),
    delete: (apartmentId) => restAdminApi.deleteApartment(apartmentId),
  },
  bookingRepository: {
    list: (regionId) => restAdminApi.listBookings(regionId),
    getById: (bookingId) => restAdminApi.getBookingById(bookingId),
    updateStatus: (bookingId, input) =>
      restAdminApi.updateBookingStatus(bookingId, input),
  },
  referenceDataRepository: {
    listRegions: () => restAdminApi.listRegions(),
    listLocations: (regionId) => restAdminApi.listLocations(regionId),
    listGalleries: (regionId) => restAdminApi.listGalleries(regionId),
    listGalleryImages: (galleryId) => restAdminApi.listGalleryImages(galleryId),
    listBuses: (regionId) => restAdminApi.listBuses(regionId),
    listApartmentPrices: (apartmentId) =>
      restAdminApi.listApartmentPrices(apartmentId),
    listEmailTemplates: (regionId) => restAdminApi.listEmailTemplates(regionId),
    listGuests: () => restAdminApi.listGuests(),
  },
};
