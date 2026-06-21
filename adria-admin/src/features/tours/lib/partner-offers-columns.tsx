import type { ColumnDef } from '@tanstack/react-table';
import type { TourPartnerOffer } from './partner-offers';

export const partnerOfferColumns: ColumnDef<TourPartnerOffer>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Név',
  },
  {
    accessorKey: 'partnerName',
    header: 'Partner',
  },
  {
    accessorKey: 'partnerEmail',
    header: 'Partner email',
  },
  {
    accessorKey: 'inquiryDate',
    header: 'Érdeklődés dátuma',
  },
];
