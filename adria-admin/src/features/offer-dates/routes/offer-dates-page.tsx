import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfferDateFormDialog } from '@/features/offer-dates/components/offer-date-form-dialog';
import { OfferDatesCalendar } from '@/features/offer-dates/components/offer-dates-calendar';
import { OfferDatesTable } from '@/features/offer-dates/components/offer-dates-table';
import { OfferDatesToolbar } from '@/features/offer-dates/components/offer-dates-toolbar';
import { getOffers } from '@/services/offer-service';
import {
  bulkUpdateOfferDates,
  cloneOfferDate,
  createOfferDate,
  deleteOfferDate,
  getOfferDates,
  getRegions,
  updateOfferDate,
} from '@/services/reference-data-service';
import type { OfferDate } from '@/types/domain';

import { type OfferDateFormValues } from '../lib/offer-date-schema';

const offerDatesQueryKey = ['offer-dates'];

export type OfferDateCalendarRow = OfferDate & {
  offerTitle: string;
  regionName: string;
};

export function OfferDatesPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'calendar' | 'table'>('calendar');
  const [offerFilter, setOfferFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfferDate, setEditingOfferDate] = useState<
    OfferDate | undefined
  >();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data: offerDates,
    isLoading: datesLoading,
    isError: datesError,
  } = useQuery({
    queryKey: offerDatesQueryKey,
    queryFn: () => getOfferDates(),
  });
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => getOffers(),
  });
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
  });

  const createMutation = useMutation({
    mutationFn: (values: OfferDateFormValues) => createOfferDate(values),
    onSuccess: (createdDate) => {
      queryClient.setQueryData<OfferDate[]>(
        offerDatesQueryKey,
        (current = []) => [createdDate, ...current],
      );
      toast.success('Offer date added.');
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: OfferDateFormValues }) =>
      updateOfferDate(id, values),
    onSuccess: (updatedDate) => {
      queryClient.setQueryData<OfferDate[]>(
        offerDatesQueryKey,
        (current = []) =>
          current.map((date) =>
            date.id === updatedDate.id ? updatedDate : date,
          ),
      );
      toast.success('Offer date updated.');
      setDialogOpen(false);
      setEditingOfferDate(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOfferDate(id),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<OfferDate[]>(
        offerDatesQueryKey,
        (current = []) => current.filter((date) => date.id !== id),
      );
      setSelectedIds((current) =>
        current.filter((selectedId) => selectedId !== id),
      );
      toast.success('Offer date deleted.');
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneOfferDate(id),
    onSuccess: (clonedDate) => {
      queryClient.setQueryData<OfferDate[]>(
        offerDatesQueryKey,
        (current = []) => [clonedDate, ...current],
      );
      toast.success('Offer date cloned.');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkUpdateOfferDates,
    onSuccess: (_result, variables) => {
      if (variables.action === 'delete') {
        queryClient.setQueryData<OfferDate[]>(
          offerDatesQueryKey,
          (current = []) =>
            current.filter((date) => !variables.ids.includes(date.id)),
        );
      } else {
        queryClient.setQueryData<OfferDate[]>(
          offerDatesQueryKey,
          (current = []) =>
            current.map((date) =>
              variables.ids.includes(date.id)
                ? {
                    ...date,
                    ...(variables.action === 'activate'
                      ? { active: true }
                      : {}),
                    ...(variables.action === 'deactivate'
                      ? { active: false }
                      : {}),
                    ...(variables.action === 'enable-xml'
                      ? { xmlExportEnabled: true }
                      : {}),
                    ...(variables.action === 'disable-xml'
                      ? { xmlExportEnabled: false }
                      : {}),
                  }
                : date,
            ),
        );
      }

      setSelectedIds([]);
      toast.success('Bulk operation applied.');
    },
  });

  const loading = datesLoading || offersLoading || regionsLoading;

  const rows = useMemo<OfferDateCalendarRow[]>(() => {
    if (!offerDates || !offers || !regions) {
      return [];
    }

    const offerMap = new Map(offers.map((offer) => [offer.id, offer.title]));
    const regionMap = new Map(
      regions.map((region) => [region.id, region.name]),
    );

    return offerDates.map((date) => ({
      ...date,
      offerTitle: offerMap.get(date.offerId) ?? 'Ismeretlen utazás',
      regionName: regionMap.get(date.regionId) ?? 'Ismeretlen régió',
    }));
  }, [offerDates, offers, regions]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (offerFilter && row.offerId !== offerFilter) {
        return false;
      }
      if (activeFilter === 'active' && !row.active) {
        return false;
      }
      if (activeFilter === 'inactive' && row.active) {
        return false;
      }
      if (activeFilter === 'xml-on' && !row.xmlExportEnabled) {
        return false;
      }
      if (activeFilter === 'xml-off' && row.xmlExportEnabled) {
        return false;
      }

      return true;
    });
  }, [activeFilter, offerFilter, rows]);

  if (loading) {
    return <PageLoader />;
  }

  if (!offerDates || !offers || !regions || datesError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Offer date data failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Offer Dates</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Offer departure administration
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Each offer can contain multiple dates. Manage departure windows,
          pricing, XML export flags, and activation state from calendar and
          table views.
        </p>
      </div>

      <OfferDatesToolbar
        offerFilter={offerFilter}
        activeFilter={activeFilter}
        resultCount={filteredRows.length}
        view={view}
        offers={offers}
        onOfferFilterChange={setOfferFilter}
        onActiveFilterChange={setActiveFilter}
        onViewChange={setView}
        onAddClick={() => {
          setEditingOfferDate(undefined);
          setDialogOpen(true);
        }}
      />

      {selectedIds.length > 0 ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <p className="text-sm text-muted-foreground">
              {selectedIds.length} selected for bulk operations.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({ ids: selectedIds, action: 'activate' })
              }
            >
              <ToggleRight className="size-4" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({ ids: selectedIds, action: 'deactivate' })
              }
            >
              <ToggleLeft className="size-4" />
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({ ids: selectedIds, action: 'enable-xml' })
              }
            >
              <CheckCheck className="size-4" />
              Enable XML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({ ids: selectedIds, action: 'disable-xml' })
              }
            >
              <CheckCheck className="size-4" />
              Disable XML
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                bulkMutation.mutate({ ids: selectedIds, action: 'delete' })
              }
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {view === 'calendar' ? (
        <OfferDatesCalendar
          rows={filteredRows}
          onEventClick={(row) => {
            setEditingOfferDate(row);
            setDialogOpen(true);
          }}
        />
      ) : (
        <OfferDatesTable
          rows={filteredRows}
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((current) =>
              current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
            )
          }
          onSelectAll={(checked) =>
            setSelectedIds(checked ? filteredRows.map((row) => row.id) : [])
          }
          onEdit={(row) => {
            setEditingOfferDate(row);
            setDialogOpen(true);
          }}
          onClone={(row) => cloneMutation.mutate(row.id)}
          onDelete={(row) => deleteMutation.mutate(row.id)}
        />
      )}

      <OfferDateFormDialog
        open={dialogOpen}
        offerDate={editingOfferDate}
        offers={offers}
        submitting={
          createMutation.isPending ||
          updateMutation.isPending ||
          cloneMutation.isPending ||
          bulkMutation.isPending
        }
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingOfferDate(undefined);
          }
        }}
        onSubmit={(values) => {
          if (editingOfferDate) {
            updateMutation.mutate({ id: editingOfferDate.id, values });
            return;
          }

          createMutation.mutate(values);
        }}
      />
    </div>
  );
}
