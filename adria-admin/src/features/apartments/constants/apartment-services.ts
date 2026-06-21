export type ApartmentServiceKey =
  | 'fürdőszoba_zuhanyzóval'
  | 'fürdőszoba_zuhanykabinnal'
  | 'kis_haziallat_beviheto'
  | 'legkondicionalo'
  | 'futes'
  | 'lift'
  | 'fedett_parkolo'
  | 'kulso_parkolo'
  | 'szef'
  | 'mikrohullamu_suto'
  | 'satellite_tv'
  | 'szabadtéri_medence'
  | 'strandszerviz'
  | 'kavefozo'
  | 'blindalt_ajto'
  | 'tv'
  | 'wifi'
  | 'kert'
  | 'magan_parkolo'
  | 'napozo_terasz'
  | 'ingyenes_buszjarat'
  | 'gyermek_jatekok'
  | 'barbecue'
  | 'panoramas_kilatas'
  | 'husvetkor_nyitva'
  | 'mozgaskorlatozottaknak'
  | 'mosoda'
  | 'hajszarito'
  | 'garazs'
  | 'takaritas'
  | 'agynemu_terites_elleneben'
  | 'internet_eleres'
  | 'bibione_termalfurdo_kedvezmeny'
  | 'egysegeben_nyitva'
  | 'etterem'
  | 'animacio'
  | 'bicikli_berles'
  | 'dryer'
  | 'jatszok'
  | 'tenisz'
  | 'animacios_program'
  | 'tengertol_valo_tavolsag'
  | 'reszben_felujitott'
  | 'teljesen_felujitott';

export type ApartmentServiceGroup = {
  key: string;
  label: string;
  services: Array<{
    value: ApartmentServiceKey;
    label: string;
  }>;
};

export const APARTMENT_SERVICE_GROUPS: ApartmentServiceGroup[] = [
  {
    key: 'comfort',
    label: 'Komfort és felszereltség',
    services: [
      { value: 'fürdőszoba_zuhanyzóval', label: 'Fürdőszoba zuhanyzóval' },
      { value: 'fürdőszoba_zuhanykabinnal', label: 'Fürdőszoba zuhanykabinnal' },
      { value: 'kis_haziallat_beviheto', label: 'Kis háziállat bevihető' },
      { value: 'legkondicionalo', label: 'Légkondicionáló' },
      { value: 'futes', label: 'Fűtés' },
      { value: 'lift', label: 'Lift' },
      { value: 'szef', label: 'Széf' },
      { value: 'mikrohullamu_suto', label: 'Mikrohullámú sütő' },
      { value: 'satellite_tv', label: 'Satellite TV' },
      { value: 'tv', label: 'TV' },
      { value: 'wifi', label: 'WiFi' },
      { value: 'internet_eleres', label: 'Internet elérés' },
      { value: 'hajszarito', label: 'Hajszárító' },
      { value: 'dryer', label: 'Szárítógép' },
    ],
  },
  {
    key: 'parking-and-access',
    label: 'Parkolás és hozzáférés',
    services: [
      { value: 'fedett_parkolo', label: 'Fedett parkoló' },
      { value: 'kulso_parkolo', label: 'Külső parkoló' },
      { value: 'magan_parkolo', label: 'Magán parkoló' },
      { value: 'garazs', label: 'Garázs' },
      { value: 'mozgaskorlatozottaknak', label: 'Mozgáskorlátozottaknak' },
      { value: 'ingyenes_buszjarat', label: 'Ingyenes buszjárat' },
    ],
  },
  {
    key: 'outdoor-and-leisure',
    label: 'Kültér és szabadidő',
    services: [
      { value: 'szabadtéri_medence', label: 'Szabadtéri medence' },
      { value: 'strandszerviz', label: 'Strandszerviz' },
      { value: 'kert', label: 'Kert' },
      { value: 'napozo_terasz', label: 'Napozó terasz' },
      { value: 'gyermek_jatekok', label: 'Gyermek játékok' },
      { value: 'barbecue', label: 'Barbecue' },
      { value: 'panoramas_kilatas', label: 'Panorámás kilátás' },
      { value: 'husvetkor_nyitva', label: 'Húsvétkor nyitva' },
      { value: 'jatszok', label: 'Játszók' },
      { value: 'tenisz', label: 'Tenisz' },
      { value: 'animacio', label: 'Animáció' },
      { value: 'animacios_program', label: 'Animációs program' },
      { value: 'bicikli_berles', label: 'Bicikli bérlés' },
      { value: 'tengertol_valo_tavolsag', label: 'Tengertől való távolság' },
    ],
  },
  {
    key: 'services',
    label: 'Szolgáltatások és extra',
    services: [
      { value: 'kavefozo', label: 'Kávéfőző' },
      { value: 'blindalt_ajto', label: 'Blindált ajtó' },
      { value: 'takaritas', label: 'Takarítás' },
      { value: 'mosoda', label: 'Mosoda' },
      { value: 'agynemu_terites_elleneben', label: 'Ágynemű térítés ellenében' },
      { value: 'etterem', label: 'Étterem' },
      { value: 'egysegeben_nyitva', label: 'Egységben nyitva' },
      { value: 'bibione_termalfurdo_kedvezmeny', label: 'Bibione termálfürdő kedvezmény' },
      { value: 'reszben_felujitott', label: 'Részben felújított' },
      { value: 'teljesen_felujitott', label: 'Teljesen felújított' },
    ],
  },
];

export const APARTMENT_SERVICE_OPTIONS = APARTMENT_SERVICE_GROUPS.flatMap(
  (group) => group.services,
);

export function getApartmentServiceLabel(service: string) {
  return (
    APARTMENT_SERVICE_OPTIONS.find((option) => option.value === service)?.label ??
    service
  );
}
