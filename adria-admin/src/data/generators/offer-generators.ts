import { createId } from '@/data/generators/core-generators';
import type { OfferContent, OfferDate } from '@/types/domain';

type TranslationSeed = {
  locale: OfferContent['locale'];
  title: string;
  description: string;
  program: string;
  tickets: string;
  optionalPrograms: string;
  pricingInformation: string;
  teaser: string;
};

type OfferDateSeed = {
  offerId: string;
  regionId: string;
  startDate: string;
  endDate: string;
  nights: number;
  price: number;
  discountPrice?: number;
  currency: string;
  availableSlots: number;
  status: OfferDate['status'];
  active: boolean;
  xmlExportEnabled: boolean;
  apartmentIds: string[];
};

export function createOfferContents(
  offerId: string,
  translations: TranslationSeed[],
): OfferContent[] {
  return translations.map((translation) => ({
    id: createId('ofc', `${offerId}_${translation.locale}`),
    offerId,
    ...translation,
  }));
}

export function createOfferDate(seed: OfferDateSeed): OfferDate {
  return {
    id: createId('ofd', `${seed.offerId}_${seed.startDate}`),
    ...seed,
  };
}
