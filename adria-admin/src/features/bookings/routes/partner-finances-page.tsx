import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createPartnerFinanceRecord,
  deletePartnerFinanceRecord,
  getPartnerFinanceRecord,
  getPartnerFinances,
  updatePartnerFinanceRecord,
} from '../lib/bookings.api';
import type {
  FinanceType,
  PartnerFinanceFormValues,
  PartnerFinanceRecord,
} from '../lib/bookings.types';
import { formatDate, formatMoney } from '../lib/bookings.utils';
import {
  getFinanceStatusLabel,
  getFinanceTypeLabel,
} from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';
import { cn } from '@/lib/utils';

const financeModes: Array<{ label: string; type: FinanceType }> = [
  { label: 'Jutalék jóváírás', type: 'commission_credit' },
  { label: 'Jutalék kifizetés', type: 'commission_payout' },
  { label: 'Hely jóváírás', type: 'location_credit' },
  { label: 'Jutalék lista', type: 'commission_list' },
  { label: 'Leutazható jutalék', type: 'travelable_commission' },
];

function statusTone(status: PartnerFinanceRecord['status']) {
  switch (status) {
    case 'approved':
      return 'info';
    case 'paid':
      return 'success';
    case 'settled':
      return 'neutral';
    case 'pending':
    default:
      return 'warning';
  }
}

function typeTone(type: FinanceType) {
  switch (type) {
    case 'commission_payout':
      return 'danger';
    case 'travelable_commission':
      return 'success';
    case 'location_credit':
      return 'info';
    case 'commission_list':
      return 'neutral';
    case 'commission_credit':
    default:
      return 'warning';
  }
}

function initialDraft(
  type: FinanceType,
  record?: PartnerFinanceRecord | null,
): PartnerFinanceFormValues {
  return {
    partnerName: record?.partnerName ?? '',
    date: record?.date ?? '',
    amount: record?.amount ?? 0,
    type: record?.type ?? type,
    status: record?.status ?? 'pending',
    balance: record?.balance ?? 0,
    note: record?.note ?? '',
  };
}

const columns = [
  { key: 'partner', label: 'Partner', sortable: true, render: (item: PartnerFinanceRecord) => item.partnerName },
  { key: 'date', label: 'Dátum', sortable: true, render: (item: PartnerFinanceRecord) => formatDate(item.date) },
  { key: 'amount', label: 'Összeg', sortable: true, render: (item: PartnerFinanceRecord) => formatMoney(item.amount) },
  {
    key: 'type',
    label: 'Típus',
    sortable: true,
    render: (item: PartnerFinanceRecord) => (
      <StatusBadge label={getFinanceTypeLabel(item.type)} tone={typeTone(item.type)} />
    ),
  },
  {
    key: 'status',
    label: 'Státusz',
    sortable: true,
    render: (item: PartnerFinanceRecord) => (
      <StatusBadge label={getFinanceStatusLabel(item.status)} tone={statusTone(item.status)} />
    ),
  },
  { key: 'balance', label: 'Egyenleg', sortable: true, render: (item: PartnerFinanceRecord) => formatMoney(item.balance) },
] satisfies Array<DataTableColumn<PartnerFinanceRecord>>;

export function PartnerFinancesPage() {
  const [activeType, setActiveType] = useState<FinanceType>('commission_credit');

  const topContent = (
    <div className="rounded-3xl border bg-card/80 p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {financeModes.map((mode) => (
          <Button
            key={mode.type}
            type="button"
            variant={activeType === mode.type ? 'default' : 'ghost'}
            className={cn('rounded-2xl', activeType !== mode.type && 'text-muted-foreground')}
            onClick={() => setActiveType(mode.type)}
          >
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const pageConfig = {
    eyebrow: 'Foglalások',
    title: 'Partner pénzügyek',
    description:
      'Jutalék jóváírások, kifizetések, hely jóváírások és leutazható egyenlegek egy tabos nézetben.',
    toolbarTitle: financeModes.find((mode) => mode.type === activeType)?.label ?? 'Partner pénzügyek',
    toolbarDescription: 'Keresés, rendezés, lapozás és gyors pénzügyi CRUD műveletek.',
    searchPlaceholder: 'Keresés partner, dátum vagy megjegyzés alapján...',
    createLabel: 'Új pénzügyi rekord',
    emptyText: 'Nincs a keresésnek megfelelő pénzügyi rekord.',
    queryKey: ['bookings', 'partner-finances', activeType],
    listQuery: (query: Parameters<typeof getPartnerFinances>[0]) =>
      getPartnerFinances({ ...query, type: activeType }),
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
      type: activeType,
    }),
    getId: (item: PartnerFinanceRecord) => item.id,
    columns,
    createDraft: (record?: PartnerFinanceRecord | null) => initialDraft(activeType, record),
    detailQuery: getPartnerFinanceRecord,
    createRecord: createPartnerFinanceRecord,
    updateRecord: updatePartnerFinanceRecord,
    deleteRecord: deletePartnerFinanceRecord,
    panelTitle: (mode: 'create' | 'edit' | 'detail', record: PartnerFinanceRecord | null) => {
      if (mode === 'create') return 'Új partner pénzügyi rekord';
      if (mode === 'edit') return `Pénzügyi rekord szerkesztése: ${record?.partnerName ?? ''}`;
      return record ? record.partnerName : 'Pénzügyi rekord részletei';
    },
    panelDescription: (mode: 'create' | 'edit' | 'detail', record: PartnerFinanceRecord | null) => {
      if (mode === 'create') return 'Válassz típust, összeget és állapotot.';
      if (mode === 'edit') return 'Frissítsd a jutalék adatokat.';
      return record ? `${getFinanceTypeLabel(record.type)} • ${formatDate(record.date)}` : 'Válassz egy rekordot a listából.';
    },
    renderPanel: ({
      mode,
      record,
      draft,
      setDraft,
    }: {
      mode: 'create' | 'edit' | 'detail';
      record: PartnerFinanceRecord | null;
      draft: PartnerFinanceFormValues;
      setDraft: Dispatch<SetStateAction<PartnerFinanceFormValues>>;
      isSaving: boolean;
      onSubmit: () => void;
      onCancel: () => void;
      onEdit: () => void;
      onDelete: () => void;
    }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Pénzügyi adatok">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Partner" value={record.partnerName} />
                  <DetailItem label="Dátum" value={formatDate(record.date)} />
                  <DetailItem label="Összeg" value={formatMoney(record.amount)} />
                  <DetailItem label="Típus" value={<StatusBadge label={getFinanceTypeLabel(record.type)} tone={typeTone(record.type)} />} />
                  <DetailItem label="Státusz" value={<StatusBadge label={getFinanceStatusLabel(record.status)} tone={statusTone(record.status)} />} />
                  <DetailItem label="Egyenleg" value={formatMoney(record.balance)} />
                  <DetailItem label="Megjegyzés" value={record.note} className="md:col-span-2" />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Pénzügyi rekord">
              <div className="grid gap-3">
                <Input value={draft.partnerName} onChange={(event) => setDraft((current) => ({ ...current, partnerName: event.target.value }))} placeholder="Partner" />
                <Input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
                <Input type="number" value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} placeholder="Összeg" />
                <Select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as FinanceType }))}>
                  {financeModes.map((modeItem) => (
                    <option key={modeItem.type} value={modeItem.type}>
                      {modeItem.label}
                    </option>
                  ))}
                </Select>
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as PartnerFinanceFormValues['status'] }))}>
                  <option value="pending">Függőben</option>
                  <option value="approved">Jóváhagyva</option>
                  <option value="paid">Kifizetve</option>
                  <option value="settled">Elszámolva</option>
                </Select>
                <Input type="number" value={draft.balance} onChange={(event) => setDraft((current) => ({ ...current, balance: Number(event.target.value) || 0 }))} placeholder="Egyenleg" />
                <Textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Megjegyzés" />
              </div>
            </FormSection>

          </div>
        );
    },
    topContent,
  };

  return <CrudModulePage key={activeType} {...pageConfig} />;
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
