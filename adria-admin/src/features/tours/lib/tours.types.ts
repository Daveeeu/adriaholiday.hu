import { z } from 'zod';

import type { MediaAsset } from '@/services/media-service';

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
  displayedPrice?: string | null;
  priceBox?: TourPriceBox | null;
  status: TourDateStatus;
};

export type TourPartnerBonus = {
  id: string;
  sortOrder: number;
  label: string;
  value: string;
};

export type TourPriceItemType = 'included' | 'excluded';

export type TourPriceItem = {
  id: string;
  type: TourPriceItemType;
  text: string;
  sortOrder: number;
  active: boolean;
};

export type TourPriceItemFormValue = {
  clientId: string;
  type: TourPriceItemType;
  text: string;
  sortOrder: number;
  active: boolean;
};

export type TourPriceBox = {
  price: number | null;
  displayedPrice: string | null;
  currency: string | null;
  priceSuffix: string | null;
  discountBadge: string | null;
  discountText: string | null;
  urgencyText: string | null;
  ratingText: string | null;
  minParticipants: number | null;
  maxParticipants: number | null;
  availableSeats: number | null;
  capacity: number | null;
  ctaPrimaryLabel: string | null;
  ctaSecondaryLabel: string | null;
};

export type TourPriceBoxFormValue = {
  price: string;
  displayedPrice: string;
  currency: string;
  priceSuffix: string;
  discountBadge: string;
  discountText: string;
  urgencyText: string;
  ratingText: string;
  minParticipants: string;
  maxParticipants: string;
  availableSeats: string;
  capacity: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
};

export type TourProgramDayBadge = {
  id: string;
  text: string;
};

export type TourProgramDay = {
  id: string | number;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  experienceType: string;
  badges: string[];
  active: boolean;
};

export type TourProgramDayBadgeFormValue = {
  clientId: string;
  text: string;
};

export type TourProgramDayFormValue = {
  id?: string | number;
  clientId: string;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  experienceType: string;
  badges: TourProgramDayBadgeFormValue[];
  active: boolean;
};

export type TourGalleryItem = {
  id: string | number;
  mediaId: string | number;
  image: MediaAsset | null;
  title: string;
  alt: string;
  caption: string;
  sortOrder: number;
  active: boolean;
};

export type TourGalleryItemFormValue = {
  clientId: string;
  mediaId: string;
  image: string;
  title: string;
  alt: string;
  caption: string;
  sortOrder: number;
  active: boolean;
  media?: MediaAsset | null;
};

export type SelectOption = {
  id: string;
  value: string;
  label: string;
};

export type TourHomepageOfferSummary = {
  id: string | number;
  title: string;
  slug?: string | null;
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
  galleryTitle?: string | null;
  gallerySubtitle?: string | null;
  gallery?: TourGalleryItem[];
  programDays: TourProgramDay[];
  priceItems: TourPriceItem[];
  regionId: string;
  regionLabel?: string | null;
  homepageOfferId?: string | number | null;
  homepageOfferIds?: Array<string | number>;
  homepageOfferLabel?: string | null;
  homepageOffers?: TourHomepageOfferSummary[];
  groupId: string;
  groupLabel?: string | null;
  seasonalGroupId: string;
  seasonalGroupLabel?: string | null;
  departurePlaceIds: string[];
  departurePlaces?: TourDeparturePlace[];
  countryIds: string[];
  countries?: SelectOption[];
  tagIds: string[];
  tags?: SelectOption[];
  categoryIds: string[];
  categories?: SelectOption[];
  fitId: string;
  fitLabel?: string | null;
  programTypeId: string;
  programTypeLabel?: string | null;
  travelModeId: string;
  travelModeLabel?: string | null;
  difficultyId: string;
  difficultyLabel?: string | null;
  bookingFormTemplateId?: string | number | null;
  bookingFormTemplate?: { id: string | number; name: string; slug: string } | null;
  price: string;
  displayedPrice: string;
  priceBox: TourPriceBox;
  dates: TourDate[];
  partnerBonuses: TourPartnerBonus[];
  sliderImage: string;
  sliderText: string;
};

export type TourDetail = Tour;

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
  galleryTitle: z.string(),
  gallerySubtitle: z.string(),
  gallery: z.array(
    z.object({
      clientId: z.string(),
      mediaId: z.string(),
      image: z.string(),
      title: z.string(),
      alt: z.string(),
      caption: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      active: z.boolean(),
    }),
  ),
  priceBox: z.object({
    price: z.string(),
    displayedPrice: z.string(),
    currency: z.string(),
    priceSuffix: z.string(),
    discountBadge: z.string(),
    discountText: z.string(),
    urgencyText: z.string(),
    ratingText: z.string(),
    minParticipants: z.string(),
    maxParticipants: z.string(),
    availableSeats: z.string(),
    capacity: z.string(),
    ctaPrimaryLabel: z.string(),
    ctaSecondaryLabel: z.string(),
  }),
  programDays: z.array(
    z.object({
      id: z.union([z.string(), z.number()]).optional(),
      clientId: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      dayNumber: z.coerce.number().int().min(1),
      title: z.string(),
      description: z.string(),
      image: z.string(),
      icon: z.string(),
      experienceType: z.string(),
      badges: z.array(
        z.object({
          clientId: z.string(),
          text: z.string(),
        }),
      ),
      active: z.boolean(),
    }),
  ),
  priceItems: z.array(
    z.object({
      clientId: z.string(),
      type: z.enum(['included', 'excluded']),
      text: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      active: z.boolean(),
    }),
  ),
  regionId: z.string(),
  homepageOfferId: z.string(),
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
  bookingFormTemplateId: z.string(),
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
      displayedPrice: z.string(),
      status: z.enum(['planned', 'available', 'sold_out']),
      priceBox: z.object({
        price: z.string(),
        displayedPrice: z.string(),
        discountBadge: z.string(),
        minParticipants: z.string(),
        maxParticipants: z.string(),
        availableSeats: z.string(),
        capacity: z.string(),
      }),
    }),
  ),
  partnerBonuses: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      label: z.string(),
      value: z.string(),
    }),
  ),
});

export type TourFormValues = z.infer<typeof tourFormSchema>;

export function mapTourToFormValues(tour?: Partial<Tour> | null): TourFormValues {
  const dates = (tour?.dates ?? []).map((date) => ({
    id: date.id ?? crypto.randomUUID(),
    startDate: date.startDate ?? '',
    endDate: date.endDate ?? '',
    price: date.price ?? '',
    displayedPrice: date.displayedPrice ?? '',
    status: date.status ?? 'planned',
    priceBox: {
      price: date.priceBox?.price?.toString() ?? '',
      displayedPrice: date.priceBox?.displayedPrice ?? '',
      discountBadge: date.priceBox?.discountBadge ?? '',
      minParticipants: date.priceBox?.minParticipants?.toString() ?? '',
      maxParticipants: date.priceBox?.maxParticipants?.toString() ?? '',
      availableSeats: date.priceBox?.availableSeats?.toString() ?? '',
      capacity: date.priceBox?.capacity?.toString() ?? '',
    },
  }));

  const partnerBonuses = (tour?.partnerBonuses ?? []).map((bonus, index) => ({
    id: bonus.id ?? crypto.randomUUID(),
    sortOrder: bonus.sortOrder ?? index + 1,
    label: bonus.label ?? '',
    value: bonus.value ?? '',
  }));

  const programDays = (tour?.programDays ?? []).map((day, index) => ({
    id: day.id,
    clientId: crypto.randomUUID(),
    sortOrder: day.sortOrder ?? index + 1,
    dayNumber: day.dayNumber ?? index + 1,
    title: day.title ?? '',
    description: day.description ?? '',
    image: day.image ?? '',
    icon: day.icon ?? '',
    experienceType: day.experienceType ?? '',
    badges: (day.badges ?? []).map((badge, badgeIndex) => ({
      clientId: `${day.id ?? index}-${badgeIndex + 1}`,
      text: badge ?? '',
    })),
    active: day.active ?? true,
  }));

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
    galleryTitle: tour?.galleryTitle ?? '',
    gallerySubtitle: tour?.gallerySubtitle ?? '',
    gallery: (tour?.gallery ?? []).map((item, index) => ({
      clientId: String(item.id ?? crypto.randomUUID()),
      mediaId: String(item.mediaId ?? ''),
      image: item.image?.url ?? item.image?.thumbnailUrl ?? '',
      title: item.title ?? '',
      alt: item.alt ?? '',
      caption: item.caption ?? '',
      sortOrder: item.sortOrder ?? index + 1,
      active: item.active ?? true,
    })),
    priceBox: {
      price: tour?.priceBox?.price?.toString() ?? '',
      displayedPrice: tour?.priceBox?.displayedPrice ?? '',
      currency: tour?.priceBox?.currency ?? 'HUF',
      priceSuffix: tour?.priceBox?.priceSuffix ?? '',
      discountBadge: tour?.priceBox?.discountBadge ?? '',
      discountText: tour?.priceBox?.discountText ?? '',
      urgencyText: tour?.priceBox?.urgencyText ?? '',
      ratingText: tour?.priceBox?.ratingText ?? '',
      minParticipants: tour?.priceBox?.minParticipants?.toString() ?? '',
      maxParticipants: tour?.priceBox?.maxParticipants?.toString() ?? '',
      availableSeats: tour?.priceBox?.availableSeats?.toString() ?? '',
      capacity: tour?.priceBox?.capacity?.toString() ?? '',
      ctaPrimaryLabel: tour?.priceBox?.ctaPrimaryLabel ?? '',
      ctaSecondaryLabel: tour?.priceBox?.ctaSecondaryLabel ?? '',
    },
    programDays,
    priceItems: (tour?.priceItems ?? []).map((item) => ({
      clientId: item.id ?? crypto.randomUUID(),
      type: item.type ?? 'included',
      text: item.text ?? '',
      sortOrder: item.sortOrder ?? 0,
      active: item.active ?? true,
    })),
    regionId: tour?.regionId ?? '',
    homepageOfferId: tour?.homepageOfferId ? String(tour.homepageOfferId) : '',
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
    bookingFormTemplateId: tour?.bookingFormTemplateId ? String(tour.bookingFormTemplateId) : '',
    price: tour?.price ?? '',
    displayedPrice: tour?.displayedPrice ?? '',
    sliderImage: tour?.sliderImage ?? '',
    sliderText: tour?.sliderText ?? '',
    dates,
    partnerBonuses,
  };
}

export function getTourFormDefaults(tour?: Partial<Tour> | null): TourFormValues {
  return mapTourToFormValues(tour);
}

export function normalizeTourFormValues(values: TourFormValues): TourFormValues {
  return {
    ...values,
    partnerBonuses: values.partnerBonuses.map((bonus, index) => ({
      ...bonus,
      sortOrder: bonus.sortOrder ?? index + 1,
    })),
    programDays: values.programDays.map((day, index) => ({
      ...day,
      sortOrder: day.sortOrder ?? index + 1,
      dayNumber: day.dayNumber ?? index + 1,
      badges: day.badges.map((badge, badgeIndex) => ({
        ...badge,
        clientId: badge.clientId ?? `${day.clientId}-${badgeIndex + 1}`,
      })),
    })),
    gallery: values.gallery.map((item, index) => ({
      ...item,
      sortOrder: item.sortOrder ?? index + 1,
    })),
    priceBox: {
      ...values.priceBox,
    },
    priceItems: values.priceItems.map((item, index) => ({
      ...item,
      sortOrder: item.sortOrder ?? index + 1,
    })),
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
