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

export async function getEmailTemplates(regionId?: string) {
  return repositories.referenceDataRepository.listEmailTemplates(regionId);
}
