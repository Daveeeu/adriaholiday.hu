import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createTourInquiryRecord,
  deleteTourInquiryRecord,
  getTourInquiries,
  getTourInquiryRecord,
  updateTourInquiryRecord,
} from '../lib/bookings.api';
import type { TourInquiry, TourInquiryFormValues } from '../lib/bookings.types';
import { formatDateTime } from '../lib/bookings.utils';
import { getInquiryStatusLabel } from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';

function statusTone(status: TourInquiry['status']) {
  switch (status) {
    case 'contacted':
      return 'info';
    case 'quoted':
      return 'warning';
    case 'closed':
      return 'neutral';
    case 'new':
    default:
      return 'success';
  }
}

function initialDraft(record?: TourInquiry | null): TourInquiryFormValues {
  return {
    name: record?.name ?? '',
    email: record?.email ?? '',
    phone: record?.phone ?? '',
    message: record?.message ?? '',
    offerName: record?.offerName ?? '',
    appointmentTime: record?.appointmentTime ?? new Date().toISOString(),
    status: record?.status ?? 'new',
  };
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, render: (item: TourInquiry) => item.id },
  { key: 'name', label: 'Név', sortable: true, render: (item: TourInquiry) => item.name },
  { key: 'email', label: 'Email', sortable: true, render: (item: TourInquiry) => item.email },
  { key: 'offer', label: 'Ajánlat', sortable: true, render: (item: TourInquiry) => item.offerName },
  { key: 'time', label: 'Időpont', sortable: true, render: (item: TourInquiry) => formatDateTime(item.appointmentTime) },
  { key: 'createdAt', label: 'Létrehozva', sortable: true, render: (item: TourInquiry) => formatDateTime(item.createdAt) },
  {
    key: 'status',
    label: 'Státusz',
    sortable: true,
    render: (item: TourInquiry) => (
      <StatusBadge label={getInquiryStatusLabel(item.status)} tone={statusTone(item.status)} />
    ),
  },
] satisfies Array<DataTableColumn<TourInquiry>>;

export function TourInquiriesPage() {
  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Körutazás ajánlatkérések',
      description:
        'Ajánlatkérések listája modern kereséssel, rendezéssel és oldalsó szerkesztőpanellel.',
      toolbarTitle: 'Körutazás ajánlatkérések',
      toolbarDescription: 'Gyorsan feldolgozható érdeklődések és státuszok.',
      searchPlaceholder: 'Keresés név, email, ajánlat vagy üzenet alapján...',
      createLabel: 'Új ajánlatkérés',
      emptyText: 'Nincs a keresésnek megfelelő ajánlatkérés.',
      queryKey: ['bookings', 'tour-inquiries'],
      listQuery: getTourInquiries,
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
      getId: (item: TourInquiry) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getTourInquiryRecord,
      createRecord: createTourInquiryRecord,
      updateRecord: updateTourInquiryRecord,
      deleteRecord: deleteTourInquiryRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: TourInquiry | null) => {
        if (mode === 'create') return 'Új ajánlatkérés';
        if (mode === 'edit') return `Ajánlatkérés szerkesztése: ${record?.name ?? ''}`;
        return record ? record.name : 'Ajánlatkérés részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: TourInquiry | null) => {
        if (mode === 'create') return 'Adj hozzá egy új érdeklődést.';
        if (mode === 'edit') return 'Szerkeszd az ajánlatkérés mezőit és státuszát.';
        return record ? `${record.offerName} • ${formatDateTime(record.createdAt)}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: TourInquiry | null;
        draft: TourInquiryFormValues;
        setDraft: Dispatch<SetStateAction<TourInquiryFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Kapcsolat" description="Az ajánlatkéréshez kapcsolódó elérhetőségek.">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Név" value={record.name} />
                  <DetailItem label="Email" value={record.email} />
                  <DetailItem label="Telefon" value={record.phone} />
                  <DetailItem label="Ajánlat" value={record.offerName} />
                  <DetailItem label="Létrehozva" value={formatDateTime(record.createdAt)} />
                  <DetailItem
                    label="Státusz"
                    value={<StatusBadge label={getInquiryStatusLabel(record.status)} tone={statusTone(record.status)} />}
                  />
                  <DetailItem label="Üzenet" value={record.message} className="md:col-span-2" />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Ajánlatkérés" description="Az érdeklődő alapadatai és üzenete.">
              <div className="grid gap-3">
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Név"
                />
                <Input
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                />
                <Input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="Telefon"
                />
                <Input
                  value={draft.offerName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, offerName: event.target.value }))
                  }
                  placeholder="Ajánlat"
                />
                <Input
                  type="datetime-local"
                  value={draft.appointmentTime.slice(0, 16)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      appointmentTime: new Date(event.target.value).toISOString(),
                    }))
                  }
                />
                <Select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, status: event.target.value as TourInquiryFormValues['status'] }))
                  }
                >
                  <option value="new">Új</option>
                  <option value="contacted">Kapcsolatban</option>
                  <option value="quoted">Ajánlat kiküldve</option>
                  <option value="closed">Lezárva</option>
                </Select>
                <Textarea
                  value={draft.message}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Üzenet"
                />
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
