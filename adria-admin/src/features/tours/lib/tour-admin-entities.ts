export type AdminEntityType =
  | 'regions'
  | 'regionGroups'
  | 'offerGroups'
  | 'boardingPlaces'
  | 'galleries';

export type AdminEntity = {
  id: string;
  name: string;
  active: boolean;
  description?: string;
  address?: string;
};

export const adminEntityLabels: Record<AdminEntityType, string> = {
  regions: 'Régiók',
  regionGroups: 'Régió csoportok',
  offerGroups: 'Ajánlat csoportok',
  boardingPlaces: 'Felszállási helyek',
  galleries: 'Galériák',
};

