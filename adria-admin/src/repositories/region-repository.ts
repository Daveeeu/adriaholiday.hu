import type { RegionMutationInput } from '@/api/admin-api';
import type { Region } from '@/types/domain';

export interface RegionRepository {
  list(): Promise<Region[]>;
  create(input: RegionMutationInput): Promise<Region>;
  update(regionId: string, input: RegionMutationInput): Promise<Region>;
  delete(regionId: string): Promise<{ id: string }>;
  setActiveState(regionId: string, isActive: boolean): Promise<Region>;
}
