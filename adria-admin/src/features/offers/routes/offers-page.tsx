import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileDown, Pencil, Rocket, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferFormDialog } from '@/features/offers/components/offer-form-dialog';
import { OfferStatusBadge } from '@/features/offers/components/offer-status-badge';
import { OffersToolbar } from '@/features/offers/components/offers-toolbar';
import { t } from '@/i18n';
import {
  createOffer,
  deleteOffer,
  getOfferContents,
  getOffers,
  setOfferStatus,
  updateOffer,
} from '@/services/offer-service';
import {
  getGalleries,
  getOfferGroups,
  getRegions,
} from '@/services/reference-data-service';
import type { Offer, OfferContent } from '@/types/domain';

import { type OfferFormValues } from '../lib/offer-schema';

const offersQueryKey = ['offers'];
const offerContentsQueryKey = ['offer-contents'];

type OfferListItem = Offer & {
  regionName: string;
  offerGroupName: string;
  galleryTitle: string;
  translations: OfferContent[];
};

function toMutationInput(values: OfferFormValues) {
  return values;
}

function createOptimisticOffer(values: OfferFormValues): Offer {
  return {
    id: `tmp_${crypto.randomUUID()}`,
    regionId: values.regionId,
    locationId: '',
    galleryId: values.galleryId,
    offerGroupId: values.offerGroupId,
    title: values.title,
    slug: values.slug,
    code: values.slug.toUpperCase().replace(/-/g, '_').slice(0, 20),
    status: values.status,
    featured: values.featured,
    pdfUrl: values.pdfUrl,
    includes: ['Accommodation'],
    exclusions: ['Flights'],
    imageIds: [],
    dateIds: [],
    contentIds: ['hu', 'en', 'de'].map(
      (locale) => `tmp_${values.slug}_${locale}`,
    ),
    apartmentIds: [],
  };
}

function createOptimisticTranslations(
  offerId: string,
  values: OfferFormValues,
): OfferContent[] {
  return (['hu', 'en', 'de'] as const).map((locale) => ({
    id: `tmp_${values.slug}_${locale}`,
    offerId,
    locale,
    ...values.translations[locale],
  }));
}

export function OffersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>();

  const {
    data: offers,
    isLoading: offersLoading,
    isError: offersError,
  } = useQuery({
    queryKey: offersQueryKey,
    queryFn: () => getOffers(),
  });
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
  });
  const { data: offerGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['offer-groups'],
    queryFn: () => getOfferGroups(),
  });
  const { data: galleries, isLoading: galleriesLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => getGalleries(),
  });
  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: offerContentsQueryKey,
    queryFn: () => getOfferContents(),
  });

  const createOfferMutation = useMutation({
    mutationFn: (values: OfferFormValues) =>
      createOffer(toMutationInput(values)),
    onMutate: async (values) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: offersQueryKey }),
        queryClient.cancelQueries({ queryKey: offerContentsQueryKey }),
      ]);

      const previousOffers =
        queryClient.getQueryData<Offer[]>(offersQueryKey) ?? [];
      const previousTranslations =
        queryClient.getQueryData<OfferContent[]>(offerContentsQueryKey) ?? [];
      const optimisticOffer = createOptimisticOffer(values);
      const optimisticTranslations = createOptimisticTranslations(
        optimisticOffer.id,
        values,
      );

      queryClient.setQueryData<Offer[]>(offersQueryKey, [
        optimisticOffer,
        ...previousOffers,
      ]);
      queryClient.setQueryData<OfferContent[]>(offerContentsQueryKey, [
        ...optimisticTranslations,
        ...previousTranslations,
      ]);

      return {
        previousOffers,
        previousTranslations,
        optimisticId: optimisticOffer.id,
      };
    },
    onError: (_error, _values, context) => {
      queryClient.setQueryData(offersQueryKey, context?.previousOffers);
      queryClient.setQueryData(
        offerContentsQueryKey,
        context?.previousTranslations,
      );
      toast.error(t('offers.toast.createError'));
    },
    onSuccess: (createdOfferDetail, _values, context) => {
      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.map((offer) =>
          offer.id === context?.optimisticId ? createdOfferDetail : offer,
        ),
      );
      queryClient.setQueryData<OfferContent[]>(
        offerContentsQueryKey,
        (currentTranslations = []) => [
          ...currentTranslations.filter(
            (translation) => translation.offerId !== context?.optimisticId,
          ),
          ...createdOfferDetail.translations,
        ],
      );
      toast.success(t('offers.toast.createSuccess'));
      setDialogOpen(false);
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({
      offerId,
      values,
    }: {
      offerId: string;
      values: OfferFormValues;
    }) => updateOffer(offerId, toMutationInput(values)),
    onMutate: async ({ offerId, values }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: offersQueryKey }),
        queryClient.cancelQueries({ queryKey: offerContentsQueryKey }),
      ]);

      const previousOffers =
        queryClient.getQueryData<Offer[]>(offersQueryKey) ?? [];
      const previousTranslations =
        queryClient.getQueryData<OfferContent[]>(offerContentsQueryKey) ?? [];

      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.map((offer) =>
          offer.id === offerId
            ? {
                ...offer,
                title: values.title,
                slug: values.slug,
                featured: values.featured,
                status: values.status,
                pdfUrl: values.pdfUrl,
                regionId: values.regionId,
                offerGroupId: values.offerGroupId,
                galleryId: values.galleryId,
              }
            : offer,
        ),
      );

      queryClient.setQueryData<OfferContent[]>(
        offerContentsQueryKey,
        (currentTranslations = []) =>
          currentTranslations
            .filter((translation) => translation.offerId !== offerId)
            .concat(
              (['hu', 'en', 'de'] as const).map((locale) => ({
                id: `tmp_${values.slug}_${locale}`,
                offerId,
                locale,
                ...values.translations[locale],
              })),
            ),
      );

      return { previousOffers, previousTranslations };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(offersQueryKey, context?.previousOffers);
      queryClient.setQueryData(
        offerContentsQueryKey,
        context?.previousTranslations,
      );
      toast.error(t('offers.toast.updateError'));
    },
    onSuccess: (updatedOfferDetail) => {
      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.map((offer) =>
          offer.id === updatedOfferDetail.id ? updatedOfferDetail : offer,
        ),
      );
      queryClient.setQueryData<OfferContent[]>(
        offerContentsQueryKey,
        (currentTranslations = []) => [
          ...currentTranslations.filter(
            (translation) => translation.offerId !== updatedOfferDetail.id,
          ),
          ...updatedOfferDetail.translations,
        ],
      );
      toast.success(t('offers.toast.updateSuccess'));
      setDialogOpen(false);
      setEditingOffer(undefined);
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (offerId: string) => deleteOffer(offerId),
    onMutate: async (offerId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: offersQueryKey }),
        queryClient.cancelQueries({ queryKey: offerContentsQueryKey }),
      ]);

      const previousOffers =
        queryClient.getQueryData<Offer[]>(offersQueryKey) ?? [];
      const previousTranslations =
        queryClient.getQueryData<OfferContent[]>(offerContentsQueryKey) ?? [];

      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.filter((offer) => offer.id !== offerId),
      );
      queryClient.setQueryData<OfferContent[]>(
        offerContentsQueryKey,
        (currentTranslations = []) =>
          currentTranslations.filter(
            (translation) => translation.offerId !== offerId,
          ),
      );

      return { previousOffers, previousTranslations };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(offersQueryKey, context?.previousOffers);
      queryClient.setQueryData(
        offerContentsQueryKey,
        context?.previousTranslations,
      );
      toast.error(t('offers.toast.deleteError'));
    },
    onSuccess: () => {
      toast.success(t('offers.toast.deleteSuccess'));
    },
  });

  const setOfferStatusMutation = useMutation({
    mutationFn: ({
      offerId,
      status,
    }: {
      offerId: string;
      status: Offer['status'];
    }) => setOfferStatus(offerId, status),
    onMutate: async ({ offerId, status }) => {
      await queryClient.cancelQueries({ queryKey: offersQueryKey });
      const previousOffers =
        queryClient.getQueryData<Offer[]>(offersQueryKey) ?? [];

      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.map((offer) =>
          offer.id === offerId ? { ...offer, status } : offer,
        ),
      );

      return { previousOffers };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(offersQueryKey, context?.previousOffers);
      toast.error(t('offers.toast.statusError'));
    },
    onSuccess: (updatedOffer) => {
      queryClient.setQueryData<Offer[]>(offersQueryKey, (currentOffers = []) =>
        currentOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        ),
      );
      toast.success(
        updatedOffer.status === 'published'
          ? t('offers.toast.published')
          : updatedOffer.status === 'draft'
            ? t('offers.toast.draft')
            : t('offers.toast.archived'),
      );
    },
  });

  const loading =
    offersLoading ||
    regionsLoading ||
    groupsLoading ||
    galleriesLoading ||
    translationsLoading;

  const offerList = useMemo<OfferListItem[]>(() => {
    if (!offers || !regions || !offerGroups || !galleries || !translations) {
      return [];
    }

    const regionMap = new Map(
      regions.map((region) => [region.id, region.name]),
    );
    const groupMap = new Map(
      offerGroups.map((group) => [group.id, group.name]),
    );
    const galleryMap = new Map(
      galleries.map((gallery) => [gallery.id, gallery.title]),
    );

    return offers.map((offer) => ({
      ...offer,
      regionName:
        regionMap.get(offer.regionId) ?? t('offers.fallback.unknownRegion'),
      offerGroupName:
        groupMap.get(offer.offerGroupId) ?? t('offers.fallback.unknownGroup'),
      galleryTitle:
        galleryMap.get(offer.galleryId) ?? t('offers.fallback.unknownGallery'),
      translations: translations.filter(
        (translation) => translation.offerId === offer.id,
      ),
    }));
  }, [galleries, offerGroups, offers, regions, translations]);

  const filteredOffers = useMemo(() => {
    return offerList.filter((offer) => {
      if (statusFilter && offer.status !== statusFilter) {
        return false;
      }
      if (regionFilter && offer.regionId !== regionFilter) {
        return false;
      }
      if (groupFilter && offer.offerGroupId !== groupFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.toLowerCase();
      return [
        offer.title,
        offer.slug,
        offer.pdfUrl,
        ...offer.translations.map((translation) => translation.title),
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [groupFilter, offerList, regionFilter, search, statusFilter]);

  if (loading) {
    return <PageLoader />;
  }

  if (
    !offers ||
    !regions ||
    !offerGroups ||
    !galleries ||
    !translations ||
    offersError
  ) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t('offers.error.load')}
      </div>
    );
  }

  const submitting =
    createOfferMutation.isPending || updateOfferMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {t('offers.page.eyebrow')}
        </p>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t('offers.page.title')}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {t('offers.page.description')}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/offers/dates">{t('offers.page.manageDates')}</Link>
          </Button>
        </div>
      </div>

      <OffersToolbar
        search={search}
        statusFilter={statusFilter}
        regionFilter={regionFilter}
        groupFilter={groupFilter}
        resultCount={filteredOffers.length}
        regions={regions}
        offerGroups={offerGroups}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onRegionFilterChange={(value) => {
          setRegionFilter(value);
          setGroupFilter('');
        }}
        onGroupFilterChange={setGroupFilter}
        onCreateClick={() => {
          setEditingOffer(undefined);
          setDialogOpen(true);
        }}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredOffers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    /offers/{offer.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {offer.featured ? (
                    <Badge className="border-transparent bg-primary/10 text-primary">
                      {t('common.featured')}
                    </Badge>
                  ) : null}
                  <OfferStatusBadge status={offer.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t('offers.card.region')}
                  </p>
                  <p className="mt-1 text-sm">{offer.regionName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t('offers.card.group')}
                  </p>
                  <p className="mt-1 text-sm">{offer.offerGroupName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t('offers.card.gallery')}
                  </p>
                  <p className="mt-1 text-sm">{offer.galleryTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t('offers.card.pdf')}
                  </p>
                  <p className="mt-1 truncate text-sm">{offer.pdfUrl}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('offers.card.languages')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {offer.translations.map((translation) => (
                    <Badge
                      key={translation.id}
                      className="border-transparent bg-secondary text-secondary-foreground"
                    >
                      {translation.locale.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {offer.translations.find(
                    (translation) => translation.locale === 'hu',
                  )?.teaser ??
                    offer.translations[0]?.teaser ??
                    t('offers.fallback.noTeaser')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOffer(offer);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                  {t('offers.card.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOfferStatusMutation.mutate({
                      offerId: offer.id,
                      status:
                        offer.status === 'published' ? 'draft' : 'published',
                    })
                  }
                >
                  {offer.status === 'published' ? (
                    <>
                      <Save className="size-4" />
                      {t('offers.card.moveToDraft')}
                    </>
                  ) : (
                    <>
                      <Rocket className="size-4" />
                      {t('offers.card.publish')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.info(t('offers.toast.pdfReady', { path: offer.pdfUrl }))
                  }
                >
                  <FileDown className="size-4" />
                  {t('offers.card.downloadPdf')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteOfferMutation.mutate(offer.id)}
                >
                  <Trash2 className="size-4" />
                  {t('offers.card.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OfferFormDialog
        open={dialogOpen}
        offer={editingOffer}
        translations={
          editingOffer
            ? translations.filter(
                (translation) => translation.offerId === editingOffer.id,
              )
            : []
        }
        regions={regions}
        offerGroups={offerGroups}
        galleries={galleries.filter((gallery) => gallery.category === 'offer')}
        submitting={submitting}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingOffer(undefined);
          }
        }}
        onSubmit={(values) => {
          if (editingOffer) {
            updateOfferMutation.mutate({
              offerId: editingOffer.id,
              values,
            });
            return;
          }

          createOfferMutation.mutate(values);
        }}
      />
    </div>
  );
}
