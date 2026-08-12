import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth-store';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createPromotionRecord,
  deletePromotionRecord,
  getPromotionRecord,
  getPromotions,
  updatePromotionRecord,
} from '../lib/bookings.api';
import type { Promotion, PromotionFormValues } from '../lib/bookings.types';
import type { DataTableColumn } from '../components/data-table';

function initialDraft(record?: Promotion | null): PromotionFormValues {
  return {
    title: record?.title ?? '',
    message: record?.message ?? '',
    code: record?.code ?? '',
    isActive: record?.isActive ?? true,
    startsAt: record?.startsAt ?? '',
    expiresAt: record?.expiresAt ?? '',
  };
}

function promotionStatus(item: Promotion): { label: string; tone: 'success' | 'neutral' | 'warning' } {
  if (!item.isActive) {
    return { label: 'Inaktív', tone: 'neutral' };
  }

  const today = new Date().toISOString().slice(0, 10);

  if (item.expiresAt && item.expiresAt < today) {
    return { label: 'Lejárt', tone: 'warning' };
  }

  if (item.startsAt && item.startsAt > today) {
    return { label: 'Még nem aktív', tone: 'warning' };
  }

  return { label: 'Aktív', tone: 'success' };
}

const columns = [
  { key: 'title', label: 'Cím', sortable: true, render: (item: Promotion) => item.title },
  {
    key: 'message',
    label: 'Üzenet',
    render: (item: Promotion) => (
      <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">{item.message}</span>
    ),
  },
  { key: 'code', label: 'Kód', render: (item: Promotion) => item.code || '—' },
  {
    key: 'startsAt',
    label: 'Kezdés',
    sortable: true,
    render: (item: Promotion) => item.startsAt || '—',
  },
  {
    key: 'expiresAt',
    label: 'Lejárat',
    sortable: true,
    render: (item: Promotion) => item.expiresAt || '—',
  },
  {
    key: 'isActive',
    label: 'Állapot',
    sortable: true,
    render: (item: Promotion) => {
      const status = promotionStatus(item);
      return <StatusBadge label={status.label} tone={status.tone} />;
    },
  },
] satisfies Array<DataTableColumn<Promotion>>;

export function PromotionsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('promotions.create');
  const canUpdate = hasPermission('promotions.update');
  const canDelete = hasPermission('promotions.delete');

  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Promóció',
      description:
        'A publikus főoldalon megjelenő aktív promóció kezelése. Csak az aktív és az időablakban lévő promóció jelenik meg a látogatóknak.',
      toolbarTitle: 'Promóció',
      toolbarDescription: 'Keresés, rendezés és CRUD műveletek.',
      searchPlaceholder: 'Keresés cím, üzenet vagy kód alapján...',
      createLabel: 'Új promóció',
      emptyText: 'Nincs a keresésnek megfelelő promóció.',
      queryKey: ['bookings', 'promotions'],
      listQuery: getPromotions,
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
      getId: (item: Promotion) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getPromotionRecord,
      createRecord: createPromotionRecord,
      updateRecord: updatePromotionRecord,
      deleteRecord: deletePromotionRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: Promotion | null) => {
        if (mode === 'create') return 'Új promóció';
        if (mode === 'edit') return `Promóció szerkesztése: ${record?.title ?? ''}`;
        return record ? record.title : 'Promóció részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: Promotion | null) => {
        if (mode === 'create') return 'Hozz létre új promóciót a főoldali értesítéshez.';
        if (mode === 'edit') return 'Frissítsd a promóció adatait.';
        return record ? promotionStatus(record).label : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: Promotion | null;
        draft: PromotionFormValues;
        setDraft: Dispatch<SetStateAction<PromotionFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        if (mode === 'detail' && record) {
          const status = promotionStatus(record);
          return (
            <div className="space-y-4">
              <FormSection title="Promóció adatok">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Állapot" value={<StatusBadge label={status.label} tone={status.tone} />} />
                  <DetailItem label="Cím" value={record.title} />
                  <DetailItem label="Kód" value={record.code || '—'} className="md:col-span-2" />
                  <DetailItem label="Üzenet" value={record.message} className="md:col-span-2" />
                  <DetailItem label="Kezdés" value={record.startsAt || '—'} />
                  <DetailItem label="Lejárat" value={record.expiresAt || '—'} />
                </div>
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Promóció adatok">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">Aktív</div>
                    <div className="text-xs text-muted-foreground">
                      Csak aktív promóció jelenik meg a publikus főoldalon.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="size-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Cím"
                />
                <Textarea
                  value={draft.message}
                  onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Üzenet szövege"
                  rows={3}
                />
                <Input
                  value={draft.code}
                  onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Kupon/promó kód (opcionális)"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-xs text-muted-foreground">Kezdés (opcionális)</span>
                    <Input
                      type="date"
                      value={draft.startsAt}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, startsAt: event.target.value }))
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-xs text-muted-foreground">Lejárat (opcionális)</span>
                    <Input
                      type="date"
                      value={draft.expiresAt}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, expiresAt: event.target.value }))
                      }
                    />
                  </label>
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
