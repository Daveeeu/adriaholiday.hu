import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import type { OfferDateCalendarRow } from '@/features/offer-dates/routes/offer-dates-page';

type OfferDatesCalendarProps = {
  rows: OfferDateCalendarRow[];
  onEventClick: (row: OfferDateCalendarRow) => void;
};

export function OfferDatesCalendar({
  rows,
  onEventClick,
}: OfferDatesCalendarProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={rows.map((row) => ({
          id: row.id,
          title: `${row.offerTitle} • €${row.price}`,
          start: row.startDate,
          end: row.endDate,
          allDay: true,
          backgroundColor: row.active ? '#2563eb' : '#94a3b8',
          borderColor: row.active ? '#2563eb' : '#94a3b8',
        }))}
        eventClick={(eventClickArg) => {
          const selectedRow = rows.find(
            (row) => row.id === eventClickArg.event.id,
          );
          if (selectedRow) {
            onEventClick(selectedRow);
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
      />
    </div>
  );
}
