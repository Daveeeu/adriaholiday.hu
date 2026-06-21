import { repositories } from '@/repositories';

export async function getRegions() {
  return repositories.referenceDataRepository.listRegions();
}

export async function getLocations(regionId?: string) {
  return repositories.referenceDataRepository.listLocations(regionId);
}

export async function getGalleries(regionId?: string) {
  return repositories.referenceDataRepository.listGalleries(regionId);
}

export async function getGalleryImages(galleryId?: string) {
  return repositories.referenceDataRepository.listGalleryImages(galleryId);
}

export async function getBuses(regionId?: string) {
  return repositories.referenceDataRepository.listBuses(regionId);
}

export async function getApartmentPrices(apartmentId?: string) {
  return repositories.referenceDataRepository.listApartmentPrices(apartmentId);
}

export async function getOfferGroups(regionId?: string) {
  return repositories.referenceDataRepository.listOfferGroups(regionId);
}

export async function getOfferDates(regionId?: string) {
  return repositories.referenceDataRepository.listOfferDates(regionId);
}

export async function createOfferDate(
  input: Parameters<
    typeof repositories.referenceDataRepository.createOfferDate
  >[0],
) {
  return repositories.referenceDataRepository.createOfferDate(input);
}

export async function updateOfferDate(
  offerDateId: string,
  input: Parameters<
    typeof repositories.referenceDataRepository.updateOfferDate
  >[1],
) {
  return repositories.referenceDataRepository.updateOfferDate(
    offerDateId,
    input,
  );
}

export async function deleteOfferDate(offerDateId: string) {
  return repositories.referenceDataRepository.deleteOfferDate(offerDateId);
}

export async function cloneOfferDate(offerDateId: string) {
  return repositories.referenceDataRepository.cloneOfferDate(offerDateId);
}

export async function bulkUpdateOfferDates(
  input: Parameters<
    typeof repositories.referenceDataRepository.bulkUpdateOfferDates
  >[0],
) {
  return repositories.referenceDataRepository.bulkUpdateOfferDates(input);
}

export async function getEmailTemplates(regionId?: string) {
  return repositories.referenceDataRepository.listEmailTemplates(regionId);
}
