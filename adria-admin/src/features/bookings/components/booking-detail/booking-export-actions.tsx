import { useMutation } from '@tanstack/react-query';
import { FileJson, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { downloadTourBookingPdf, printTourBookingPdf } from '../../lib/bookings.api';
import type { TourBookingDetail } from '../../lib/bookings.types';

function downloadJson(booking: TourBookingDetail) {
  const blob = new Blob([JSON.stringify(booking, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-${booking.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function BookingExportActions({ booking }: { booking: TourBookingDetail }) {
  const pdfMutation = useMutation({
    mutationFn: () => downloadTourBookingPdf(booking.id),
    onError: () => toast.error('Nem sikerült elkészíteni a PDF-et.'),
  });
  const printMutation = useMutation({
    mutationFn: () => printTourBookingPdf(booking.id),
    onError: () => toast.error('Nem sikerült elkészíteni a nyomtatandó PDF-et.'),
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" disabled={pdfMutation.isPending} onClick={() => pdfMutation.mutate()}>
        <FileText className="size-4" />
        PDF
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => downloadJson(booking)}>
        <FileJson className="size-4" />
        JSON
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={printMutation.isPending} onClick={() => printMutation.mutate()}>
        <Printer className="size-4" />
        Nyomtatás
      </Button>
    </div>
  );
}
