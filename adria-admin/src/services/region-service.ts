import type { RegionMutationInput } from '@/api/admin-api';
import { repositories } from '@/repositories';

export async function getRegions() {
  return repositories.regionRepository.list();
}

export async function createRegion(input: RegionMutationInput) {
  return repositories.regionRepository.create(input);
}

export async function updateRegion(
  regionId: string,
  input: RegionMutationInput,
) {
  return repositories.regionRepository.update(regionId, input);
}

export async function deleteRegion(regionId: string) {
  return repositories.regionRepository.delete(regionId);
}

export async function setRegionActiveState(
  regionId: string,
  isActive: boolean,
) {
  return repositories.regionRepository.setActiveState(regionId, isActive);
}
