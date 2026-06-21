import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { CrudModulePage } from '../components/crud-module-page';
import { FormSection } from '../components/form-section';
import { StatusBadge } from '../components/status-badge';
import {
  createBannerRecord,
  deleteBannerRecord,
  getBannerRecord,
  getBanners,
  updateBannerRecord,
} from '../lib/bookings.api';
import type { BannerStatus, PartnerBanner, PartnerBannerFormValues } from '../lib/bookings.types';
import { formatDateTime } from '../lib/bookings.utils';
import { getBannerStatusLabel } from '../lib/bookings.constants';
import type { DataTableColumn } from '../components/data-table';

function statusTone(status: BannerStatus) {
  switch (status) {
    case 'active':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
    default:
      return 'neutral';
  }
}

function initialDraft(record?: PartnerBanner | null): PartnerBannerFormValues {
  return {
    name: record?.name ?? '',
    url: record?.url ?? '',
    image: record?.image ?? '',
    width: record?.width ?? 728,
    height: record?.height ?? 90,
    embedCode: record?.embedCode ?? '',
    status: record?.status ?? 'draft',
  };
}

const columns = [
  { key: 'name', label: 'Banner neve', sortable: true, render: (item: PartnerBanner) => item.name },
  { key: 'url', label: 'Banner URL', sortable: true, render: (item: PartnerBanner) => item.url },
  { key: 'image', label: 'Kép', sortable: true, render: (item: PartnerBanner) => <span className="truncate">{item.image}</span> },
  { key: 'width', label: 'Szélesség', sortable: true, render: (item: PartnerBanner) => `${item.width}px` },
  { key: 'height', label: 'Magasság', sortable: true, render: (item: PartnerBanner) => `${item.height}px` },
  {
    key: 'status',
    label: 'Státusz',
    sortable: true,
    render: (item: PartnerBanner) => (
      <StatusBadge label={getBannerStatusLabel(item.status)} tone={statusTone(item.status)} />
    ),
  },
] satisfies Array<DataTableColumn<PartnerBanner>>;

export function BannerGeneratorPage() {
  const pageConfig = useMemo(
    () => ({
      eyebrow: 'Foglalások',
      title: 'Banner generálás',
      description:
        'Partner bannerek konfigurálása élő előnézettel és szerkesztőpanellel.',
      toolbarTitle: 'Banner generálás',
      toolbarDescription: 'Egyszerre több partner banner állítható össze és szerkeszthető.',
      searchPlaceholder: 'Keresés név, URL, kód vagy státusz alapján...',
      createLabel: 'Új banner',
      emptyText: 'Nincs a keresésnek megfelelő banner.',
      queryKey: ['bookings', 'banner-generator'],
      listQuery: getBanners,
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
      getId: (item: PartnerBanner) => item.id,
      columns,
      createDraft: initialDraft,
      detailQuery: getBannerRecord,
      createRecord: createBannerRecord,
      updateRecord: updateBannerRecord,
      deleteRecord: deleteBannerRecord,
      panelTitle: (mode: 'create' | 'edit' | 'detail', record: PartnerBanner | null) => {
        if (mode === 'create') return 'Új banner';
        if (mode === 'edit') return `Banner szerkesztése: ${record?.name ?? ''}`;
        return record ? record.name : 'Banner részletei';
      },
      panelDescription: (mode: 'create' | 'edit' | 'detail', record: PartnerBanner | null) => {
        if (mode === 'create') return 'Állítsd be a banner méretét, képét és beágyazó kódját.';
        if (mode === 'edit') return 'Frissítsd a banner konfigurációját.';
        return record ? `${record.width}x${record.height} • ${formatDateTime(record.updatedAt)}` : 'Válassz egy rekordot a listából.';
      },
      renderPanel: ({
        mode,
        record,
        draft,
        setDraft,
      }: {
        mode: 'create' | 'edit' | 'detail';
        record: PartnerBanner | null;
        draft: PartnerBannerFormValues;
        setDraft: Dispatch<SetStateAction<PartnerBannerFormValues>>;
        isSaving: boolean;
        onSubmit: () => void;
        onCancel: () => void;
        onEdit: () => void;
        onDelete: () => void;
      }) => {
        const previewImage = draft.image || record?.image;
        const previewWidth = draft.width || record?.width || 728;
        const previewHeight = draft.height || record?.height || 90;

        if (mode === 'detail' && record) {
          return (
            <div className="space-y-4">
              <FormSection title="Banner adatok">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem label="Banner neve" value={record.name} />
                  <DetailItem label="Banner URL" value={record.url} />
                  <DetailItem label="Szélesség" value={`${record.width}px`} />
                  <DetailItem label="Magasság" value={`${record.height}px`} />
                  <DetailItem label="Státusz" value={<StatusBadge label={getBannerStatusLabel(record.status)} tone={statusTone(record.status)} />} />
                  <DetailItem label="Létrehozva" value={formatDateTime(record.createdAt)} />
                  <DetailItem label="Beágyazó kód" value={<code className="block whitespace-pre-wrap rounded-2xl border bg-muted/40 p-3 text-xs">{record.embedCode}</code>} className="md:col-span-2" />
                </div>
              </FormSection>

              <FormSection title="Előnézet">
                <BannerPreview image={record.image} width={record.width} height={record.height} />
              </FormSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <FormSection title="Banner konfiguráció">
              <div className="grid gap-3">
                <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Banner neve" />
                <Input value={draft.url} onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))} placeholder="Banner URL" />
                <Input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} placeholder="Kép URL" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input type="number" value={draft.width} onChange={(event) => setDraft((current) => ({ ...current, width: Number(event.target.value) || 0 }))} placeholder="Szélesség" />
                  <Input type="number" value={draft.height} onChange={(event) => setDraft((current) => ({ ...current, height: Number(event.target.value) || 0 }))} placeholder="Magasság" />
                </div>
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as BannerStatus }))}>
                  <option value="draft">Piszkozat</option>
                  <option value="active">Aktív</option>
                  <option value="archived">Archivált</option>
                </Select>
                <Textarea value={draft.embedCode} onChange={(event) => setDraft((current) => ({ ...current, embedCode: event.target.value }))} placeholder="Beágyazó kód" rows={8} />
              </div>
            </FormSection>

            <FormSection title="Előnézet">
              <BannerPreview image={previewImage ?? ''} width={previewWidth} height={previewHeight} />
            </FormSection>

          </div>
        );
      },
    }),
    [],
  );

  return <CrudModulePage {...pageConfig} />;
}

function BannerPreview({
  image,
  width,
  height,
}: {
  image: string;
  width: number;
  height: number;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border bg-muted/20 p-3">
      <div
        className="relative mx-auto flex items-center justify-center overflow-hidden rounded-[22px] border bg-white shadow-sm"
        style={{ aspectRatio: `${width || 16} / ${height || 9}`, maxWidth: '100%' }}
      >
        {image ? (
          <img src={image} alt="Banner előnézet" className="h-full w-full object-cover" />
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Adj meg képet az előnézethez.
          </div>
        )}
      </div>
      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {width} x {height}
      </div>
    </div>
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
