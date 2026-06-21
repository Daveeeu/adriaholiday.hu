import type { ApartmentRepository } from '@/repositories/apartment-repository';
import type { BookingRepository } from '@/repositories/booking-repository';
import type { OfferRepository } from '@/repositories/offer-repository';
import type { ReferenceDataRepository } from '@/repositories/reference-data-repository';
import type { RegionRepository } from '@/repositories/region-repository';
import { restAdminApi } from '@/api/rest/rest-admin-api';

export type AdminRepositories = {
  regionRepository: RegionRepository;
  apartmentRepository: ApartmentRepository;
  offerRepository: OfferRepository;
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
    list: (regionId) => restAdminApi.listApartments(regionId),
    getById: (apartmentId) => restAdminApi.getApartmentById(apartmentId),
    create: (input) => restAdminApi.createApartment(input),
    update: (apartmentId, input) =>
      restAdminApi.updateApartment(apartmentId, input),
    delete: (apartmentId) => restAdminApi.deleteApartment(apartmentId),
  },
  offerRepository: {
    list: (filters) => restAdminApi.listOffers(filters),
    listContents: (offerId) => restAdminApi.listOfferContents(offerId),
    getById: (offerId) => restAdminApi.getOfferById(offerId),
    create: (input) => restAdminApi.createOffer(input),
    update: (offerId, input) => restAdminApi.updateOffer(offerId, input),
    delete: (offerId) => restAdminApi.deleteOffer(offerId),
    setStatus: (offerId, status) => restAdminApi.setOfferStatus(offerId, status),
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
    listOfferGroups: (regionId) => restAdminApi.listOfferGroups(regionId),
    listOfferDates: (regionId) => restAdminApi.listOfferDates(regionId),
    createOfferDate: (input) => restAdminApi.createOfferDate(input),
    updateOfferDate: (offerDateId, input) =>
      restAdminApi.updateOfferDate(offerDateId, input),
    deleteOfferDate: (offerDateId) => restAdminApi.deleteOfferDate(offerDateId),
    cloneOfferDate: (offerDateId) => restAdminApi.cloneOfferDate(offerDateId),
    bulkUpdateOfferDates: (input) => restAdminApi.bulkUpdateOfferDates(input),
    listEmailTemplates: (regionId) => restAdminApi.listEmailTemplates(regionId),
    listGuests: () => restAdminApi.listGuests(),
  },
};
