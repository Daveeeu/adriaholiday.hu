import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createApartmentBookingRecord,
  deleteApartmentBookingRecord,
  getApartmentBookingRecord,
  getApartmentBookings,
  updateApartmentBookingRecord,
} from '../lib/bookings.api';
import type {
  ApartmentBooking,
  ApartmentBookingFormValues,
} from '../lib/bookings.types';
import { formatDate, formatDateTime } from '../lib/bookings.utils';
import { getApartmentBookingStatusLabel } from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';

function statusTone(status: ApartmentBooking['status']) {
  switch (status) {
    case 'approved':
      return 'success';
    case 'credited':
      return 'info';
    case 'closed':
      return 'neutral';
    case 'new':
    default:
      return 'warning';
  }
}

function initialDraft(record?: ApartmentBooking | null): ApartmentBookingFormValues {
  return {
    guestName: record?.guestName ?? '',
    email: record?.email ?? '',
    phone: record?.phone ?? '',
    address: record?.address ?? '',
    apartmentName: record?.apartmentName ?? '',
    arrival: record?.arrival ?? '',
    departure: record?.departure ?? '',
    passengers: record?.passengers ?? 2,
    applicationTime: record?.applicationTime ?? new Date().toISOString(),
    bookingDate: record?.bookingDate ?? '',
    offerCode: record?.offerCode ?? '',
    credited: record?.credited ?? false,
    status: record?.status ?? 'new',
  };
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, render: (item: ApartmentBooking) => item.id },
  { key: 'name', label: 'Név', sortable: true, render: (item: ApartmentBooking) => item.guestName },
  { key: 'email', label: 'Email', sortable: true, render: (item: ApartmentBooking) => item.email },
  { key: 'apartment', label: 'Apartman', sortable: true, render: (item: ApartmentBooking) => item.apartmentName },
  { key: 'applicationTime', label: 'Jelentkezés időpontja', sortable: true, render: (item: ApartmentBooking) => formatDateTime(item.applicationTime) },
  { key: 'bookingDate', label: 'Foglalás dátuma', sortable: true, render: (item: ApartmentBooking) => formatDate(item.bookingDate) },
  { key: 'offerCode', label: 'Ajánlati kód', sortable: true, render: (item: ApartmentBooking) => item.offerCode },
  { key: 'passengers', label: 'Utasok', sortable: true, render: (item: ApartmentBooking) => `${item.passengers} fő` },
  {
    key: 'credited',
    label: 'Jóváírva?',
    sortable: true,
    render: (item: ApartmentBooking) => (
      <StatusBadge label={item.credited ? 'Igen' : 'Nem'} tone={item.credited ? 'success' : 'warning'} />
    ),
  },
] satisfies Array<DataTableColumn<ApartmentBooking>>;

export function ApartmentBookingsPage() {
  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Apartman foglalások',
      description:
        'Az apartman foglalások listája az utasokkal, időpontokkal és jóváírási állapotokkal.',
      toolbarTitle: 'Apartman foglalások',
      toolbarDescription: 'Keresés, rendezés, CRUD és oldalsó szerkesztés.',
      searchPlaceholder: 'Keresés név, email, apartman vagy kód alapján...',
      createLabel: 'Új foglalás',
      emptyText: 'Nincs a keresésnek megfelelő apartman foglalás.',
      queryKey: ['bookings', 'apartment-bookings'],
      listQuery: getApartmentBookings,
      buildQuery: ({
        page,
        perPage,
        search,
        sortBy,
        sortDirection,
      }: {
        page: number;
        perPage: number;
        search: string;
        sortBy: string;
        sortDirection: 'asc' | 'desc';
      }) => ({
        page,
        perPage,
        search,
        sortBy,
        sortDirection,
      }),
      getId: (item: ApartmentBooking) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getApartmentBookingRecord,
      createRecord: createApartmentBookingRecord,
      updateRecord: updateApartmentBookingRecord,
      deleteRecord: deleteApartmentBookingRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: ApartmentBooking | null) => {
        if (mode === 'create') return 'Új apartman foglalás';
        if (mode === 'edit') return `Foglalás szerkesztése: ${record?.guestName ?? ''}`;
        return record ? record.guestName : 'Foglalás részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: ApartmentBooking | null) => {
        if (mode === 'create') return 'Adj hozzá új apartman foglalást.';
        if (mode === 'edit') return 'Szerkeszd a foglaló és apartman adatait.';
        return record ? `${record.apartmentName} • ${formatDate(record.bookingDate)}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: ApartmentBooking | null;
        draft: ApartmentBookingFormValues;
        setDraft: Dispatch<SetStateAction<ApartmentBookingFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Foglaló adatok">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Név" value={record.guestName} />
                  <DetailItem label="Email" value={record.email} />
                  <DetailItem label="Telefon" value={record.phone} />
                  <DetailItem label="Cím" value={record.address} className="md:col-span-2" />
                </div>
              </FormSection>

              <FormSection title="Apartman" description="A foglalás részletei és státusza.">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Apartman neve" value={record.apartmentName} />
                  <DetailItem label="Érkezés" value={formatDate(record.arrival)} />
                  <DetailItem label="Távozás" value={formatDate(record.departure)} />
                  <DetailItem label="Utasok" value={`${record.passengers} fő`} />
                  <DetailItem label="Ajánlati kód" value={record.offerCode} />
                  <DetailItem
                    label="Jóváírva?"
                    value={<StatusBadge label={record.credited ? 'Igen' : 'Nem'} tone={record.credited ? 'success' : 'warning'} />}
                  />
                  <DetailItem
                    label="Állapot"
                    value={<StatusBadge label={getApartmentBookingStatusLabel(record.status)} tone={statusTone(record.status)} />}
                  />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Foglaló adatok">
              <div className="grid gap-3">
                <Input value={draft.guestName} onChange={(event) => setDraft((current) => ({ ...current, guestName: event.target.value }))} placeholder="Név" />
                <Input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
                <Input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" />
                <Textarea value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} placeholder="Cím" />
              </div>
            </FormSection>

            <FormSection title="Apartman" description="Az apartman foglalás részletei.">
              <div className="grid gap-3">
                <Input value={draft.apartmentName} onChange={(event) => setDraft((current) => ({ ...current, apartmentName: event.target.value }))} placeholder="Apartman neve" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input type="date" value={draft.arrival} onChange={(event) => setDraft((current) => ({ ...current, arrival: event.target.value }))} />
                  <Input type="date" value={draft.departure} onChange={(event) => setDraft((current) => ({ ...current, departure: event.target.value }))} />
                </div>
                <Input type="number" min={1} value={draft.passengers} onChange={(event) => setDraft((current) => ({ ...current, passengers: Number(event.target.value) || 0 }))} placeholder="Utasok" />
                <Input value={draft.offerCode} onChange={(event) => setDraft((current) => ({ ...current, offerCode: event.target.value }))} placeholder="Ajánlati kód" />
                <Input type="datetime-local" value={draft.applicationTime.slice(0, 16)} onChange={(event) => setDraft((current) => ({ ...current, applicationTime: new Date(event.target.value).toISOString() }))} />
                <Input type="date" value={draft.bookingDate} onChange={(event) => setDraft((current) => ({ ...current, bookingDate: event.target.value }))} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    value={draft.status}
                    onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ApartmentBookingFormValues['status'] }))}
                  >
                    <option value="new">Új</option>
                    <option value="approved">Jóváhagyva</option>
                    <option value="credited">Jóváírva</option>
                    <option value="closed">Lezárva</option>
                  </Select>
                  <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">Jóváírva?</div>
                      <div className="text-xs text-muted-foreground">Könyvelési állapot jelölése.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.credited}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          credited: event.target.checked,
                        }))
                      }
                      className="size-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

          </div>
        );
      },
    }),
    [],
  );

  return <CrudModulePage {...pageConfig} />;
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
