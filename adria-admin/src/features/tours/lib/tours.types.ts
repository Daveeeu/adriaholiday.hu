import { z } from 'zod';

import type {
  TOUR_DATE_STATUSES,
  TOUR_PARTNER_OFFER_STATUSES,
  TOUR_REGION_GROUP_TYPES,
  TOUR_SEASONAL_MENU_TYPES,
} from './tours.constants';
import { slugifyTourText } from './tours.constants';

export type TourDateStatus = (typeof TOUR_DATE_STATUSES)[number]['value'];
export type TourPartnerOfferStatus =
  (typeof TOUR_PARTNER_OFFER_STATUSES)[number]['value'];
export type TourRegionGroupType = (typeof TOUR_REGION_GROUP_TYPES)[number]['value'];
export type TourSeasonalMenuType = (typeof TOUR_SEASONAL_MENU_TYPES)[number]['value'];

export type TourDate = {
  id: string;
  startDate: string;
  endDate: string;
  price: string;
  status: TourDateStatus;
};

export type TourPartnerBonus = {
  id: string;
  label: string;
  value: string;
};

export type Tour = {
  id: string;
  sortOrder: number;
  active: boolean;
  featured: boolean;
  recommended: boolean;
  partnerOffer: boolean;
  imageOffer: boolean;
  xmlEnabled: boolean;
  sliderImageEnabled: boolean;
  sliderTextEnabled: boolean;
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
  action1: string;
  action2: string;
  listDescription: string;
  shortDescription: string;
  programPdf: string;
  programPdfFile: string;
  programBefore: string;
  program: string;
  inclusions: string;
  paymentProgram: string;
  prices: string;
  discounts: string;
  notes: string;
  regionId: string;
  groupId: string;
  seasonalGroupId: string;
  departurePlaceIds: string[];
  countryIds: string[];
  tagIds: string[];
  categoryIds: string[];
  fitId: string;
  programTypeId: string;
  travelModeId: string;
  difficultyId: string;
  price: string;
  displayedPrice: string;
  dates: TourDate[];
  partnerBonuses: TourPartnerBonus[];
  sliderImage: string;
  sliderText: string;
};

export const tourFormSchema = z.object({
  sortOrder: z.coerce.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  recommended: z.boolean(),
  partnerOffer: z.boolean(),
  imageOffer: z.boolean(),
  xmlEnabled: z.boolean(),
  sliderImageEnabled: z.boolean(),
  sliderTextEnabled: z.boolean(),
  name: z.string().min(2, 'A név megadása kötelező.'),
  seoName: z.string(),
  seoAutoGenerate: z.boolean(),
  action1: z.string(),
  action2: z.string(),
  listDescription: z.string(),
  shortDescription: z.string(),
  programPdf: z.string(),
  programPdfFile: z.string(),
  programBefore: z.string(),
  program: z.string(),
  inclusions: z.string(),
  paymentProgram: z.string(),
  prices: z.string(),
  discounts: z.string(),
  notes: z.string(),
  regionId: z.string(),
  groupId: z.string(),
  seasonalGroupId: z.string(),
  departurePlaceIds: z.array(z.string()),
  countryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  fitId: z.string(),
  programTypeId: z.string(),
  travelModeId: z.string(),
  difficultyId: z.string(),
  price: z.string(),
  displayedPrice: z.string(),
  sliderImage: z.string(),
  sliderText: z.string(),
  dates: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      price: z.string(),
      status: z.enum(['planned', 'available', 'sold_out']),
    }),
  ),
  partnerBonuses: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
    }),
  ),
});

export type TourFormValues = z.infer<typeof tourFormSchema>;

export function getTourFormDefaults(tour?: Partial<Tour>): TourFormValues {
  return {
    sortOrder: tour?.sortOrder ?? 1,
    active: tour?.active ?? true,
    featured: tour?.featured ?? false,
    recommended: tour?.recommended ?? false,
    partnerOffer: tour?.partnerOffer ?? false,
    imageOffer: tour?.imageOffer ?? false,
    xmlEnabled: tour?.xmlEnabled ?? true,
    sliderImageEnabled: tour?.sliderImageEnabled ?? false,
    sliderTextEnabled: tour?.sliderTextEnabled ?? false,
    name: tour?.name ?? '',
    seoName: tour?.seoName ?? slugifyTourText(tour?.name ?? ''),
    seoAutoGenerate: tour?.seoAutoGenerate ?? true,
    action1: tour?.action1 ?? '',
    action2: tour?.action2 ?? '',
    listDescription: tour?.listDescription ?? '',
    shortDescription: tour?.shortDescription ?? '',
    programPdf: tour?.programPdf ?? '',
    programPdfFile: tour?.programPdfFile ?? '',
    programBefore: tour?.programBefore ?? '',
    program: tour?.program ?? '',
    inclusions: tour?.inclusions ?? '',
    paymentProgram: tour?.paymentProgram ?? '',
    prices: tour?.prices ?? '',
    discounts: tour?.discounts ?? '',
    notes: tour?.notes ?? '',
    regionId: tour?.regionId ?? '',
    groupId: tour?.groupId ?? '',
    seasonalGroupId: tour?.seasonalGroupId ?? '',
    departurePlaceIds: tour?.departurePlaceIds ?? [],
    countryIds: tour?.countryIds ?? [],
    tagIds: tour?.tagIds ?? [],
    categoryIds: tour?.categoryIds ?? [],
    fitId: tour?.fitId ?? '',
    programTypeId: tour?.programTypeId ?? '',
    travelModeId: tour?.travelModeId ?? '',
    difficultyId: tour?.difficultyId ?? '',
    price: tour?.price ?? '',
    displayedPrice: tour?.displayedPrice ?? '',
    sliderImage: tour?.sliderImage ?? '',
    sliderText: tour?.sliderText ?? '',
    dates: tour?.dates ?? [],
    partnerBonuses: tour?.partnerBonuses ?? [],
  };
}

export type TourListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof Pick<Tour, 'sortOrder' | 'id' | 'name' | 'regionId' | 'groupId' | 'featured' | 'active' | 'imageOffer' | 'xmlEnabled'>;
  sortDirection?: 'asc' | 'desc';
  regionId?: string;
  groupId?: string;
  seasonalGroupId?: string;
  featured?: 'all' | 'true' | 'false';
  active?: 'all' | 'true' | 'false';
  imageOffer?: 'all' | 'true' | 'false';
  xmlEnabled?: 'all' | 'true' | 'false';
};

export type TourListResponse = {
  items: Tour[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourPartnerOffer = {
  id: string;
  name: string;
  partnerName: string;
  partnerEmail: string;
  inquiryDate: string;
  status: TourPartnerOfferStatus;
  note: string;
  active: boolean;
};

export type TourPartnerOfferFormValues = Omit<TourPartnerOffer, 'id'>;

export type TourPartnerOfferListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourPartnerOffer;
  sortDirection?: 'asc' | 'desc';
};

export type TourPartnerOfferListResponse = {
  items: TourPartnerOffer[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourRegionGroup = {
  id: string;
  active: boolean;
  featuredOnHomepage: boolean;
  type: TourRegionGroupType;
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
  galleryId: string;
  description: string;
  listBelowText: string;
  travelConditionsLink: string;
  relatedToursCount: number;
};

export type TourRegionGroupFormValues = Omit<
  TourRegionGroup,
  'id' | 'relatedToursCount'
>;

export type TourRegionGroupListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourRegionGroup;
  sortDirection?: 'asc' | 'desc';
};

export type TourRegionGroupListResponse = {
  items: TourRegionGroup[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourSeasonalGroup = {
  id: string;
  active: boolean;
  menuType: TourSeasonalMenuType;
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
  boxText: string;
  hasOffers: boolean;
  relatedToursCount: number;
};

export type TourSeasonalGroupFormValues = Omit<
  TourSeasonalGroup,
  'id' | 'relatedToursCount'
>;

export type TourSeasonalGroupListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourSeasonalGroup;
  sortDirection?: 'asc' | 'desc';
};

export type TourSeasonalGroupListResponse = {
  items: TourSeasonalGroup[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourDeparturePlace = {
  id: string;
  active: boolean;
  name: string;
  city: string;
  fee: string;
  travelCount: number;
};

export type TourDeparturePlaceFormValues = Omit<TourDeparturePlace, 'id' | 'travelCount'>;

export type TourDeparturePlaceListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourDeparturePlace;
  sortDirection?: 'asc' | 'desc';
};

export type TourDeparturePlaceListResponse = {
  items: TourDeparturePlace[];
  totalCount: number;
  page: number;
  perPage: number;
};
