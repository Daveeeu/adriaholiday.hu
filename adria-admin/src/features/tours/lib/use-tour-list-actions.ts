import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { TOURS_QUERY_KEY, tourDetailQueryKey } from './tour-routes';
import {
  deleteTour,
  downloadTourPdf,
  duplicateTourOffer,
  moveTourOffer,
  setTourActive,
} from './tours.api';

/** What the offers list does to a tour without opening the editor. */
export function useTourListActions({
  onDeleted,
}: { onDeleted?: (tourId: string) => void } = {}) {
  const queryClient = useQueryClient();
  const refreshTours = () =>
    queryClient.invalidateQueries({ queryKey: TOURS_QUERY_KEY });

  const statusMutation = useMutation({
    mutationFn: ({ tourId, active }: { tourId: string; active: boolean }) =>
      setTourActive(tourId, active),
    onSuccess: refreshTours,
    onError: () => toast.error('Nem sikerült módosítani az út állapotát.'),
  });

  const pdfMutation = useMutation({
    mutationFn: downloadTourPdf,
    onError: () => toast.error('Nem sikerült elkészíteni a PDF-et.'),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTourOffer,
    onSuccess: () => {
      refreshTours();
      toast.success('Körutazás másolva.');
    },
    onError: () => toast.error('Nem sikerült másolni a körutazást.'),
  });

  const moveMutation = useMutation({
    mutationFn: ({
      tourId,
      direction,
    }: {
      tourId: string;
      direction: 'up' | 'down';
    }) => moveTourOffer(tourId, direction),
    onSuccess: refreshTours,
    onError: () => toast.error('Nem sikerült áthelyezni a körutazást.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: (_, tourId) => {
      queryClient.removeQueries({ queryKey: tourDetailQueryKey(tourId) });
      refreshTours();
      toast.success('Körutazás törölve.');
      onDeleted?.(tourId);
    },
    onError: () => toast.error('Nem sikerült törölni a körutazást.'),
  });

  const { mutate: mutateStatus } = statusMutation;
  const {
    mutate: mutatePdf,
    isPending: pdfPending,
    variables: pdfTour,
  } = pdfMutation;
  const { mutate: mutateDuplicate } = duplicateMutation;
  const { mutate: mutateMove } = moveMutation;
  const { mutate: mutateDelete } = deleteMutation;

  return useMemo(
    () => ({
      setActive: (tourId: string, active: boolean) =>
        mutateStatus({ tourId, active }),
      downloadPdf: (tour: { id: string; seoName?: string | null }) =>
        mutatePdf(tour),
      isDownloadingPdf: (tourId: string) =>
        pdfPending && pdfTour?.id === tourId,
      duplicate: (tourId: string) => mutateDuplicate(tourId),
      move: (tourId: string, direction: 'up' | 'down') =>
        mutateMove({ tourId, direction }),
      remove: (tourId: string, name: string) => {
        if (window.confirm(`Biztosan törlöd ezt a körutazást? (${name})`)) {
          mutateDelete(tourId);
        }
      },
    }),
    [
      mutateDelete,
      mutateDuplicate,
      mutateMove,
      mutatePdf,
      mutateStatus,
      pdfPending,
      pdfTour,
    ],
  );
}

export type TourListActions = ReturnType<typeof useTourListActions>;
