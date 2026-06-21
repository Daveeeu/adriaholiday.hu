import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createCouponRecord,
  deleteCouponRecord,
  getCouponRecord,
  getCoupons,
  updateCouponRecord,
} from '../lib/bookings.api';
import type { Coupon, CouponFormValues } from '../lib/bookings.types';
import { formatDateTime, formatMoney } from '../lib/bookings.utils';
import type { DataTableColumn } from '../components/data-table';

function initialDraft(record?: Coupon | null): CouponFormValues {
  return {
    active: record?.active ?? true,
    name: record?.name ?? '',
    email: record?.email ?? '',
    code: record?.code ?? '',
    value: record?.value ?? 0,
    expiresAt: record?.expiresAt ?? '',
    used: record?.used ?? false,
  };
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, render: (item: Coupon) => item.id },
  { key: 'name', label: 'Név', sortable: true, render: (item: Coupon) => item.name },
  { key: 'email', label: 'Email', sortable: true, render: (item: Coupon) => item.email },
  { key: 'code', label: 'Kupon', sortable: true, render: (item: Coupon) => item.code },
  { key: 'value', label: 'Érték', sortable: true, render: (item: Coupon) => formatMoney(item.value) },
  { key: 'createdAt', label: 'Létrehozva', sortable: true, render: (item: Coupon) => formatDateTime(item.createdAt) },
  { key: 'expiresAt', label: 'Lejárat', sortable: true, render: (item: Coupon) => item.expiresAt },
  {
    key: 'used',
    label: 'Felhasználva',
    sortable: true,
    render: (item: Coupon) => (
      <StatusBadge label={item.used ? 'Igen' : 'Nem'} tone={item.used ? 'info' : 'success'} />
    ),
  },
] satisfies Array<DataTableColumn<Coupon>>;

export function CouponsPage() {
  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Kuponok',
      description:
        'Kuponkezelő lista oldalsó szerkesztéssel, aktív jelzőkkel és lejárati dátummal.',
      toolbarTitle: 'Kuponok',
      toolbarDescription: 'Keresés, rendezés és CRUD műveletek.',
      searchPlaceholder: 'Keresés név, email, kuponkód vagy lejárat alapján...',
      createLabel: 'Új kupon',
      emptyText: 'Nincs a keresésnek megfelelő kupon.',
      queryKey: ['bookings', 'coupons'],
      listQuery: getCoupons,
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
      getId: (item: Coupon) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getCouponRecord,
      createRecord: createCouponRecord,
      updateRecord: updateCouponRecord,
      deleteRecord: deleteCouponRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: Coupon | null) => {
        if (mode === 'create') return 'Új kupon';
        if (mode === 'edit') return `Kupon szerkesztése: ${record?.code ?? ''}`;
        return record ? record.code : 'Kupon részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: Coupon | null) => {
        if (mode === 'create') return 'Hozz létre új kuponkódot és állítsd be az értékét.';
        if (mode === 'edit') return 'Frissítsd a kupon adatait.';
        return record ? `${formatMoney(record.value)} • ${formatDateTime(record.createdAt)}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: Coupon | null;
        draft: CouponFormValues;
        setDraft: Dispatch<SetStateAction<CouponFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Kupon adatok">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Aktív" value={<StatusBadge label={record.active ? 'Igen' : 'Nem'} tone={record.active ? 'success' : 'danger'} />} />
                  <DetailItem label="Név" value={record.name} />
                  <DetailItem label="Email" value={record.email} />
                  <DetailItem label="Kuponkód" value={record.code} />
                  <DetailItem label="Érték" value={formatMoney(record.value)} />
                  <DetailItem label="Lejárat" value={record.expiresAt} />
                  <DetailItem label="Felhasználva" value={<StatusBadge label={record.used ? 'Igen' : 'Nem'} tone={record.used ? 'info' : 'success'} />} />
                  <DetailItem label="Létrehozva" value={formatDateTime(record.createdAt)} />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Kupon adatok">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">Aktív</div>
                    <div className="text-xs text-muted-foreground">A kupon használható-e jelenleg.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                    className="size-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Név" />
                <Input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
                <Input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} placeholder="Kuponkód" />
                <Input type="number" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: Number(event.target.value) || 0 }))} placeholder="Érték" />
                <Input type="date" value={draft.expiresAt} onChange={(event) => setDraft((current) => ({ ...current, expiresAt: event.target.value }))} />
                <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">Felhasználva</div>
                    <div className="text-xs text-muted-foreground">Jelöld be, ha a kupon már felhasználásra került.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.used}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        used: event.target.checked,
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
