import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useMemo,
} from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createTourBookingRecord,
  deleteTourBookingRecord,
  getTourBookingRecord,
  getTourBookings,
  updateTourBookingRecord,
} from '../lib/bookings.api';
import type {
  TourBooking,
  TourBookingFormValues,
} from '../lib/bookings.types';
import {
  formatDate,
  formatDateTime,
  toInputDate,
} from '../lib/bookings.utils';
import { getTourBookingStatusLabel } from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';

function statusTone(status: TourBooking['status']) {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'cancelled':
      return 'danger';
    case 'completed':
      return 'neutral';
    case 'pending':
    default:
      return 'warning';
  }
}

function initialDraft(record?: TourBooking | null): TourBookingFormValues {
  return {
    partnerName: record?.partnerName ?? '',
    partnerEmail: record?.partnerEmail ?? '',
    partnerPhone: record?.partnerPhone ?? '',
    partnerAddress: record?.partnerAddress ?? '',
    partnerCity: record?.partnerCity ?? '',
    partnerCountry: record?.partnerCountry ?? 'Magyarország',
    partnerNote: record?.partnerNote ?? '',
    offerName: record?.offerName ?? '',
    departureDate: record?.departureDate ?? '',
    passengerCount: record?.passengerCount ?? 2,
    paymentStatus: record?.paymentStatus ?? 'unpaid',
    status: record?.status ?? 'pending',
    cancelled: record?.cancelled ?? false,
    appointmentTime: record?.appointmentTime ?? new Date().toISOString(),
    applicationDate: record?.applicationDate ?? toInputDate(new Date().toISOString()),
  };
}

const columns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    render: (item: TourBooking) => <span className="font-medium">{item.id}</span>,
  },
  {
    key: 'partner',
    label: 'Partner',
    sortable: true,
    render: (item: TourBooking) => (
      <div className="space-y-1">
        <div className="font-medium text-foreground">{item.partnerName}</div>
        <div className="text-xs text-muted-foreground">{item.partnerPhone}</div>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (item: TourBooking) => <span className="text-sm">{item.partnerEmail}</span>,
  },
  {
    key: 'offer',
    label: 'Ajánlat',
    sortable: true,
    render: (item: TourBooking) => item.offerName,
  },
  {
    key: 'appointmentTime',
    label: 'Időpont',
    sortable: true,
    render: (item: TourBooking) => formatDateTime(item.appointmentTime),
  },
  {
    key: 'applicationDate',
    label: 'Jelentkezés dátuma',
    sortable: true,
    render: (item: TourBooking) => formatDate(item.applicationDate),
  },
  {
    key: 'status',
    label: 'Foglalás állapota',
    sortable: true,
    render: (item: TourBooking) => (
      <StatusBadge label={getTourBookingStatusLabel(item.status)} tone={statusTone(item.status)} />
    ),
  },
  {
    key: 'cancelled',
    label: 'Lemondott?',
    sortable: true,
    render: (item: TourBooking) => (
      <StatusBadge
        label={item.cancelled ? 'Igen' : 'Nem'}
        tone={item.cancelled ? 'danger' : 'success'}
      />
    ),
  },
] satisfies Array<DataTableColumn<TourBooking>>;

export function TourBookingsPage() {
  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Körutazás foglalások',
      description:
        'A körutazási foglalások, partner adatok és állapotok központi kezelése, modern listanézettel és oldalsó szerkesztőpanellel.',
      toolbarTitle: 'Körutazás foglalások',
      toolbarDescription: 'Keresés, rendezés, lapozás és gyors CRUD műveletek.',
      searchPlaceholder: 'Keresés partner, email, ajánlat vagy dátum alapján...',
      createLabel: 'Új foglalás',
      emptyText: 'Nincs a keresésnek megfelelő körutazás foglalás.',
      queryKey: ['bookings', 'tour-bookings'],
      listQuery: getTourBookings,
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
      getId: (item: TourBooking) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getTourBookingRecord,
      createRecord: createTourBookingRecord,
      updateRecord: updateTourBookingRecord,
      deleteRecord: deleteTourBookingRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: TourBooking | null) => {
        if (mode === 'create') return 'Új körutazás foglalás';
        if (mode === 'edit') return `Foglalás szerkesztése: ${record?.partnerName ?? ''}`;
        return record ? `${record.partnerName}` : 'Foglalás részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: TourBooking | null) => {
        if (mode === 'create') return 'Adj hozzá új foglalást partner és utazási adatokkal.';
        if (mode === 'edit') return 'Frissítsd a partner vagy foglalási adatokat.';
        return record ? `${record.offerName} • ${formatDate(record.applicationDate)}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: TourBooking | null;
        draft: TourBookingFormValues;
        setDraft: Dispatch<SetStateAction<TourBookingFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Partner adatok" description="A foglalást indító partner kapcsolati adatai.">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Név" value={record.partnerName} />
                  <DetailItem label="Email" value={record.partnerEmail} />
                  <DetailItem label="Telefon" value={record.partnerPhone} />
                  <DetailItem label="Cím" value={record.partnerAddress} />
                  <DetailItem label="Város" value={record.partnerCity} />
                  <DetailItem label="Ország" value={record.partnerCountry} />
                  <DetailItem label="Megjegyzés" value={record.partnerNote} className="md:col-span-2" />
                </div>
              </FormSection>

              <FormSection title="Foglalási adatok" description="Az aktuális körutazás foglalási állapota és időzítése.">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Ajánlat" value={record.offerName} />
                  <DetailItem label="Indulás dátuma" value={formatDate(record.departureDate)} />
                  <DetailItem label="Utasok száma" value={`${record.passengerCount} fő`} />
                  <DetailItem label="Jelentkezés dátuma" value={formatDate(record.applicationDate)} />
                  <DetailItem label="Fizetési státusz" value={record.paymentStatus} />
                  <DetailItem
                    label="Állapot"
                    value={<StatusBadge label={getTourBookingStatusLabel(record.status)} tone={statusTone(record.status)} />}
                  />
                  <DetailItem
                    label="Lemondott?"
                    value={<StatusBadge label={record.cancelled ? 'Igen' : 'Nem'} tone={record.cancelled ? 'danger' : 'success'} />}
                  />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Partner adatok" description="A foglalást leadó partner részletei.">
              <div className="grid gap-3">
                <Input
                  value={draft.partnerName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, partnerName: event.target.value }))
                  }
                  placeholder="Partner neve"
                />
                <Input
                  value={draft.partnerEmail}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, partnerEmail: event.target.value }))
                  }
                  placeholder="Email"
                />
                <Input
                  value={draft.partnerPhone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, partnerPhone: event.target.value }))
                  }
                  placeholder="Telefon"
                />
                <Input
                  value={draft.partnerAddress}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, partnerAddress: event.target.value }))
                  }
                  placeholder="Cím"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={draft.partnerCity}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, partnerCity: event.target.value }))
                    }
                    placeholder="Város"
                  />
                  <Input
                    value={draft.partnerCountry}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, partnerCountry: event.target.value }))
                    }
                    placeholder="Ország"
                  />
                </div>
                <Textarea
                  value={draft.partnerNote}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, partnerNote: event.target.value }))
                  }
                  placeholder="Megjegyzés"
                />
              </div>
            </FormSection>

            <FormSection title="Foglalási adatok" description="A körutazási foglalás fő mezői.">
              <div className="grid gap-3">
                <Input
                  value={draft.offerName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, offerName: event.target.value }))
                  }
                  placeholder="Ajánlat"
                />
                <Input
                  type="date"
                  value={draft.departureDate}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, departureDate: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  value={draft.passengerCount}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, passengerCount: Number(event.target.value) || 0 }))
                  }
                  min={1}
                  placeholder="Utasok száma"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    value={draft.paymentStatus}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, paymentStatus: event.target.value as TourBookingFormValues['paymentStatus'] }))
                    }
                  >
                    <option value="unpaid">Fizetetlen</option>
                    <option value="partial">Részben fizetett</option>
                    <option value="paid">Fizetett</option>
                  </Select>
                  <Select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, status: event.target.value as TourBookingFormValues['status'] }))
                    }
                  >
                    <option value="pending">Függőben</option>
                    <option value="in_progress">Folyamatban</option>
                    <option value="confirmed">Megerősítve</option>
                    <option value="completed">Lezárva</option>
                    <option value="cancelled">Lemondva</option>
                  </Select>
                </div>
                <Input
                  type="datetime-local"
                  value={draft.appointmentTime.slice(0, 16)}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, appointmentTime: new Date(event.target.value).toISOString() }))
                  }
                />
                <Input
                  type="date"
                  value={draft.applicationDate}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, applicationDate: event.target.value }))
                  }
                />
                <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">Lemondott?</div>
                    <div className="text-xs text-muted-foreground">A rekord törlés helyett jelölhető is.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.cancelled}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        cancelled: event.target.checked,
                      }))
                    }
                    className="size-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </FormSection>

          </div>
        );
      },
    }),
    [],
  );

  return (
    <CrudModulePage {...pageConfig} />
  );
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
