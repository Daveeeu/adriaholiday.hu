import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth-store';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createMessageRecord,
  deleteMessageRecord,
  getMessageRecord,
  getMessages,
  updateMessageRecord,
} from '../lib/bookings.api';
import type { ContactMessage, ContactMessageFormValues, MessageStatus } from '../lib/bookings.types';
import { formatDateTime } from '../lib/bookings.utils';
import { getMessageStatusLabel } from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';

function statusTone(status: MessageStatus) {
  switch (status) {
    case 'read':
      return 'info';
    case 'archived':
      return 'neutral';
    case 'new':
    default:
      return 'warning';
  }
}

function initialDraft(record?: ContactMessage | null): ContactMessageFormValues {
  return {
    name: record?.name ?? '',
    email: record?.email ?? '',
    phone: record?.phone ?? '',
    message: record?.message ?? '',
    createdAt: record?.createdAt ?? new Date().toISOString(),
    status: record?.status ?? 'new',
  };
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, render: (item: ContactMessage) => item.id },
  { key: 'name', label: 'Név', sortable: true, render: (item: ContactMessage) => item.name },
  { key: 'email', label: 'Email', sortable: true, render: (item: ContactMessage) => item.email },
  { key: 'phone', label: 'Telefonszám', sortable: true, render: (item: ContactMessage) => item.phone },
  { key: 'createdAt', label: 'Létrehozva', sortable: true, render: (item: ContactMessage) => formatDateTime(item.createdAt) },
] satisfies Array<DataTableColumn<ContactMessage>>;

export function MessagesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('messages.create');
  const canUpdate = hasPermission('messages.update');
  const canDelete = hasPermission('messages.delete');

  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Üzenetek',
      description:
        'Kapcsolatfelvételi üzenetek listája. Az üzenet tartalma readonly, de a rekord többi metaadata kezelhető.',
      toolbarTitle: 'Üzenetek',
      toolbarDescription: 'Keresés, rendezés és oldalsó rekordkezelés.',
      searchPlaceholder: 'Keresés név, email vagy telefonszám alapján...',
      createLabel: 'Új üzenet',
      emptyText: 'Nincs a keresésnek megfelelő üzenet.',
      queryKey: ['bookings', 'messages'],
      listQuery: getMessages,
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
      getId: (item: ContactMessage) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getMessageRecord,
      createRecord: createMessageRecord,
      updateRecord: updateMessageRecord,
      deleteRecord: deleteMessageRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: ContactMessage | null) => {
        if (mode === 'create') return 'Új üzenet';
        if (mode === 'edit') return `Üzenet szerkesztése: ${record?.name ?? ''}`;
        return record ? record.name : 'Üzenet részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: ContactMessage | null) => {
        if (mode === 'create') return 'Új kapcsolatfelvétel rögzítése.';
        if (mode === 'edit') return 'Frissítsd a rekord metaadatait.';
        return record ? `${formatDateTime(record.createdAt)} • ${record.email}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: ContactMessage | null;
        draft: ContactMessageFormValues;
        setDraft: Dispatch<SetStateAction<ContactMessageFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Kapcsolat">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Név" value={record.name} />
                  <DetailItem label="Email" value={record.email} />
                  <DetailItem label="Telefonszám" value={record.phone} />
                  <DetailItem label="Dátum" value={formatDateTime(record.createdAt)} />
                  <DetailItem label="Státusz" value={<StatusBadge label={getMessageStatusLabel(record.status)} tone={statusTone(record.status)} />} />
                  <DetailItem label="Üzenet" value={record.message} className="md:col-span-2" />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Rekord adatok">
              <div className="grid gap-3">
                <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Név" />
                <Input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
                <Input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefonszám" />
                <Input type="datetime-local" value={draft.createdAt.slice(0, 16)} onChange={(event) => setDraft((current) => ({ ...current, createdAt: new Date(event.target.value).toISOString() }))} />
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as MessageStatus }))}>
                  <option value="new">Új</option>
                  <option value="read">Olvasott</option>
                  <option value="archived">Archivált</option>
                </Select>
                <Textarea
                  value={draft.message}
                  readOnly
                  className="min-h-32 bg-muted/30"
                  placeholder="Az üzenet tartalma readonly"
                />
              </div>
            </FormSection>

          </div>
        );
      },
    }),
    [],
  );

  return (
    <CrudModulePage
      {...pageConfig}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
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
