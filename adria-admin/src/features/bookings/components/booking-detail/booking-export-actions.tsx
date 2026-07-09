import { FileJson, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

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
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => toast.info('A PDF export hamarosan elérhető lesz.')}>
        <FileText className="size-4" />
        PDF
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => downloadJson(booking)}>
        <FileJson className="size-4" />
        JSON
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-4" />
        Nyomtatás
      </Button>
    </div>
  );
}
