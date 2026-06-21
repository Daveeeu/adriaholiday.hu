import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Power, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
  HOMEPAGE_OFFER_LANGUAGE_LABELS,
  HOMEPAGE_OFFER_LANGUAGES,
} from '../lib/homepage-offers.constants';
import {
  getHomepageOfferFormDefaults,
  homepageOfferFormSchema,
  type HomepageOffer,
  type HomepageOfferFormValues,
  type HomepageOfferLanguage,
  type HomepageOfferPanelMode,
  type HomepageOfferUpsertInput,
} from '../lib/homepage-offers.types';
import { HomepageOfferForm } from './HomepageOfferForm';

type HomepageOfferSidePanelProps = {
  open: boolean;
  mode: HomepageOfferPanelMode;
  offer?: HomepageOffer;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HomepageOfferUpsertInput) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
};

function DetailCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">
        {typeof value === 'boolean' ? (value ? 'Igen' : 'Nem') : value ?? '—'}
      </div>
    </div>
  );
}

function HomepageOfferDetailView({
  offer,
}: {
  offer: HomepageOffer;
}) {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              {offer.translations.hu.name || '—'}
            </h3>
            <p className="text-sm text-muted-foreground">{offer.link}</p>
          </div>

          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              offer.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {offer.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="ID" value={offer.id} />
          <DetailCard label="Sorrend" value={offer.sortOrder} />
          <DetailCard label="Kép címe" value={offer.imageTitle} />
          <DetailCard label="Kép" value={offer.image ?? '—'} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Nyelvi tartalmak</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {HOMEPAGE_OFFER_LANGUAGES.map((language) => {
            const translation = offer.translations[language];

            return (
              <div key={language} className="rounded-xl border bg-background p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {HOMEPAGE_OFFER_LANGUAGE_LABELS[language]}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Név: </span>
                    <span>{translation.name || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">SEO: </span>
                    <span>{translation.seoName || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auto: </span>
                    <span>{translation.seoAutoGenerate ? 'Igen' : 'Nem'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function HomepageOfferSidePanel({
  open,
  mode,
  offer,
  submitting = false,
  onOpenChange,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
}: HomepageOfferSidePanelProps) {
  const [activeLanguage, setActiveLanguage] =
    useState<HomepageOfferLanguage>('hu');

  const form = useForm<HomepageOfferFormValues>({
    resolver: zodResolver(homepageOfferFormSchema),
    defaultValues: getHomepageOfferFormDefaults(offer),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getHomepageOfferFormDefaults(offer));
  }, [form, offer, open]);

  if (!open) {
    return null;
  }

  const title =
    mode === 'create'
      ? 'Főoldali ajánlat hozzáadása'
      : mode === 'edit'
        ? 'Főoldali ajánlat szerkesztése'
        : 'Főoldali ajánlat részletei';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,1100px)] flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'detail'
                ? 'A főoldali ajánlat teljes előnézete.'
                : 'Aktív státusz, sorrend, kép, link és többnyelvű SEO mezők.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'detail' && offer ? (
              <>
                {onToggleActive ? (
                  <Button type="button" variant="outline" onClick={onToggleActive}>
                    <Power className="size-4" />
                    {offer.active ? 'Deaktiválás' : 'Aktiválás'}
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button type="button" variant="outline" onClick={onEdit}>
                    <Pencil className="size-4" />
                    Szerkesztés
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button type="button" variant="destructive" onClick={onDelete}>
                    <Trash2 className="size-4" />
                    Törlés
                  </Button>
                ) : null}
              </>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-5">
            {mode === 'detail' && offer ? (
              <HomepageOfferDetailView offer={offer} />
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-full flex-col"
                  onSubmit={form.handleSubmit((values) =>
                    onSubmit({
                      active: values.active,
                      sortOrder: values.sortOrder,
                      image: values.image.trim() ? values.image.trim() : null,
                      imageTitle: values.imageTitle.trim(),
                      link: values.link.trim(),
                      translations: values.translations,
                    }),
                  )}
                >
                  <HomepageOfferForm
                    form={form}
                    activeLanguage={activeLanguage}
                    onLanguageChange={setActiveLanguage}
                  />

                  <div className="sticky bottom-0 mt-6 border-t bg-background/95 px-0 py-4 backdrop-blur">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      {mode === 'edit' && onDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={onDelete}
                          disabled={submitting}
                        >
                          <Trash2 className="size-4" />
                          Törlés
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                      >
                        Mégse
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Mentés...' : 'Mentés'}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
