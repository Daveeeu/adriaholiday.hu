import { z } from 'zod';

import type { OfferDate } from '@/types/domain';

export const offerDateFormSchema = z.object({
  offerId: z.string().min(1, 'Offer is required.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  price: z.number().min(1, 'Price must be greater than zero.'),
  active: z.boolean(),
  xmlExportEnabled: z.boolean(),
});

export type OfferDateFormValues = z.infer<typeof offerDateFormSchema>;

export function getOfferDateFormDefaults(
  offerDate?: OfferDate,
): OfferDateFormValues {
  return {
    offerId: offerDate?.offerId ?? '',
    startDate: offerDate?.startDate ?? '',
    endDate: offerDate?.endDate ?? '',
    price: offerDate?.price ?? 0,
    active: offerDate?.active ?? true,
    xmlExportEnabled: offerDate?.xmlExportEnabled ?? false,
  };
}
