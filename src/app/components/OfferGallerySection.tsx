import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, ChevronLeft, ChevronRight, Expand, ImageOff, X } from 'lucide-react';

import { trackEvent } from '@/app/analytics/trackEvent';
import { renderContentIcon } from '@/app/content/icon-map';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { PortfolioOfferGalleryItem } from '../content/portfolio-offer-detail-api';

type OfferGallerySectionProps = {
  title?: string | null;
  subtitle?: string | null;
  gallery?: PortfolioOfferGalleryItem[] | null;
};

function SectionEyebrow({ title }: { title: string }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00c389]/15 bg-[#00c389]/8 px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-[#00a878]">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00c389]/15">
        {renderContentIcon('camera', 'h-3.5 w-3.5')}
      </span>
      {title}
    </div>
  );
}

function hasImage(item: PortfolioOfferGalleryItem) {
  return Boolean(item.image?.url || item.image?.thumbnailUrl);
}

function getImageUrl(item: PortfolioOfferGalleryItem) {
  return item.image?.url || item.image?.thumbnailUrl || '';
}

function GalleryBigImage({
  item,
  onOpen,
}: {
  item: PortfolioOfferGalleryItem;
  onOpen: () => void;
}) {
  const imageUrl = getImageUrl(item);
  const altText = (item.alt || item.title || 'Galéria kép').trim();
  const title = item.title?.trim() || '';
  const caption = item.caption?.trim() || '';
  const imageExists = imageUrl.trim() !== '';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-[32px] bg-[#07111f] text-left shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
    >
      <div className="relative aspect-[16/10] min-h-[320px] w-full lg:min-h-[520px]">
        {imageExists ? (
          <>
            <img
              src={imageUrl}
              alt={altText}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08)_0%,rgba(7,17,31,0.18)_45%,rgba(7,17,31,0.82)_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,195,137,0.24),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(22,184,255,0.2),transparent_28%),radial-gradient(circle_at_70%_82%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)]" />
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-2 text-white backdrop-blur-xl shadow-[0_10px_28px_rgba(15,23,42,0.18)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 text-white">
            {imageExists ? <Camera className="h-4 w-4" /> : <ImageOff className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Kép
            </div>
            <div className="truncate text-sm font-semibold">{title || altText}</div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="rounded-[24px] border border-white/15 bg-black/30 p-4 text-white backdrop-blur-md sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                {title ? (
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {title}
                  </div>
                ) : null}
                {caption ? (
                  <div className="mt-1 text-lg font-bold leading-tight sm:text-xl">
                    {caption}
                  </div>
                ) : null}
              </div>

              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold">
                <Expand className="h-4 w-4" />
                Nagyítás
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function GalleryThumbnail({
  item,
  active,
  onClick,
}: {
  item: PortfolioOfferGalleryItem;
  active: boolean;
  onClick: () => void;
}) {
  const imageUrl = getImageUrl(item);
  const altText = (item.alt || item.title || 'Galéria kép').trim();
  const imageExists = imageUrl.trim() !== '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative shrink-0 overflow-hidden rounded-[22px] border text-left transition-all md:w-auto snap-start ${
        active
          ? 'border-[#00c389] shadow-[0_14px_40px_rgba(0,195,137,0.18)] ring-2 ring-[#00c389]/20'
          : 'border-[#dbe9f7] hover:border-[#00c389]/35'
      } w-[72vw] max-w-[220px] md:w-auto md:max-w-none`}
    >
      <div className="relative aspect-square bg-[#07111f]">
        {imageExists ? (
          <img
            src={imageUrl}
            alt={altText}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)]" />
        )}

        <div className={`absolute inset-0 bg-black/0 transition-colors ${active ? 'bg-black/12' : 'group-hover:bg-black/8'}`} />

        <div className="absolute left-2 top-2 rounded-full border border-white/15 bg-white/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
          Kép
        </div>

        {active ? (
          <div className="absolute right-2 top-2 rounded-full bg-[#00c389] p-1.5 text-white shadow-[0_10px_24px_rgba(0,195,137,0.3)]">
            <Camera className="h-3.5 w-3.5" />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export default function OfferGallerySection({
  title,
  subtitle,
  gallery,
}: OfferGallerySectionProps) {
  const pageSize = 4;
  const items = useMemo(
    () =>
      (gallery ?? [])
        .filter((item) => item.active !== false)
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || String(a.id).localeCompare(String(b.id)),
        ),
    [gallery],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbPage, setThumbPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const activeItem = items[Math.min(activeIndex, items.length - 1)] ?? null;
  const visibleThumbs = items.slice(thumbPage * pageSize, thumbPage * pageSize + pageSize);
  const selectedLightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const activePage = Math.floor(activeIndex / pageSize);
    setThumbPage((current) => {
      if (activePage !== current) {
        return activePage;
      }

      return Math.min(current, totalPages - 1);
    });
  }, [activeIndex, items.length, pageSize, totalPages]);

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setLightboxIndex(null);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setLightboxIndex((current) => {
          if (current === null) {
            return 0;
          }

          return current > 0 ? current - 1 : items.length - 1;
        });
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setLightboxIndex((current) => {
          if (current === null) {
            return 0;
          }

          return current < items.length - 1 ? current + 1 : 0;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items.length, lightboxIndex]);

  if (items.length === 0) {
    return null;
  }

  const sectionTitle = typeof title === 'string' ? title.trim() : '';
  const sectionSubtitle = typeof subtitle === 'string' ? subtitle.trim() : '';
  const hasPagination = totalPages > 1;
  const canPrevThumbPage = thumbPage > 0;
  const canNextThumbPage = thumbPage < totalPages - 1;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxIndex(index);
    trackEvent('gallery_open', {
      entity: {
        type: 'gallery_item',
        id: items[index]?.id,
        slug: items[index]?.title ?? null,
      },
      metadata: {
        gallery_size: items.length,
        position: index + 1,
      },
    });
  };

  const moveThumbPage = (nextPage: number) => {
    const clampedPage = Math.max(0, Math.min(totalPages - 1, nextPage));
    setThumbPage(clampedPage);
    const firstIndex = clampedPage * pageSize;
    if (activeIndex < firstIndex || activeIndex >= firstIndex + pageSize) {
      setActiveIndex(firstIndex);
    }
  };

  return (
    <section className="mb-20">
      <SectionEyebrow title="GALÉRIA" />

      {sectionTitle ? (
        <h2 className="mb-4 text-5xl font-bold tracking-tight text-[#0f172a]">
          {sectionTitle}
        </h2>
      ) : null}

      {sectionSubtitle ? (
        <p className="mb-10 text-lg text-gray-500">{sectionSubtitle}</p>
      ) : null}

      <div className="space-y-5">
        <GalleryBigImage item={activeItem ?? items[0]} onOpen={() => openLightbox(activeIndex)} />

        <div className="rounded-[28px] border border-[#dbe9f7] bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="text-sm font-semibold text-[#546174]">
              Képek
            </div>

            {hasPagination ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveThumbPage(thumbPage - 1)}
                  disabled={!canPrevThumbPage}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe9f7] bg-[#f7fbff] text-[#0f172a] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Előző thumbnail oldal"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[72px] text-center text-sm font-semibold text-[#546174]">
                  {thumbPage + 1} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => moveThumbPage(thumbPage + 1)}
                  disabled={!canNextThumbPage}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe9f7] bg-[#f7fbff] text-[#0f172a] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Következő thumbnail oldal"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
            {visibleThumbs.map((item, index) => {
              const actualIndex = thumbPage * pageSize + index;
              const active = actualIndex === activeIndex;

              return (
                <GalleryThumbnail
                  key={item.id}
                  item={item}
                  active={active}
                  onClick={() => setActiveIndex(actualIndex)}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a4b3]">
              {items.length} kép
            </div>

            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="inline-flex items-center gap-2 rounded-full border border-[#dbe9f7] bg-[#f7fbff] px-4 py-2 text-sm font-semibold text-[#0f172a] transition-colors hover:border-[#00c389]/35"
            >
              <Expand className="h-4 w-4" />
              Nagyítás
            </button>
          </div>
        </div>
      </div>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent className="max-h-[95vh] max-w-[calc(100%-1rem)] overflow-hidden border-0 bg-[#07111f] p-0 text-white sm:max-w-6xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Galéria</DialogTitle>
            <DialogDescription>Ajánlat képgalériája</DialogDescription>
          </DialogHeader>

          <div className="relative flex min-h-[70vh] flex-col bg-[#07111f]">
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/15"
              aria-label="Bezárás"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute left-4 top-4 z-10 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl">
              {lightboxIndex !== null ? `${lightboxIndex + 1} / ${items.length}` : `1 / ${items.length}`}
            </div>

            <div className="flex flex-1 items-center justify-center px-4 pb-28 pt-16 sm:px-6 sm:pb-32">
              {selectedLightboxItem ? (
                <div className="w-full max-w-5xl space-y-4">
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d2240] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                    {hasImage(selectedLightboxItem) ? (
                      <img
                        src={getImageUrl(selectedLightboxItem)}
                        alt={(selectedLightboxItem.alt || selectedLightboxItem.title || 'Galéria kép').trim()}
                        className="max-h-[68vh] w-full object-cover"
                      />
                    ) : (
                      <div className="flex min-h-[340px] items-center justify-center bg-[linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)] text-white/75">
                        Nincs kép
                      </div>
                    )}
                  </div>

                  {(selectedLightboxItem.title || selectedLightboxItem.caption) ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 text-white backdrop-blur-md">
                      {selectedLightboxItem.title ? (
                        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                          {selectedLightboxItem.title}
                        </div>
                      ) : null}
                      {selectedLightboxItem.caption ? (
                        <div className="mt-2 text-lg font-bold leading-tight text-white sm:text-xl">
                          {selectedLightboxItem.caption}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#081629]/90 px-4 py-4 backdrop-blur-xl sm:px-6">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('gallery_previous', {
                      metadata: {
                        gallery_size: items.length,
                        position: lightboxIndex !== null ? lightboxIndex + 1 : 1,
                      },
                    });
                    setLightboxIndex((current) => (current === null ? 0 : current > 0 ? current - 1 : items.length - 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Előző
                </button>

                <button
                  type="button"
                  onClick={() => {
                    trackEvent('gallery_next', {
                      metadata: {
                        gallery_size: items.length,
                        position: lightboxIndex !== null ? lightboxIndex + 1 : 1,
                      },
                    });
                    setLightboxIndex((current) => (current === null ? 0 : current < items.length - 1 ? current + 1 : 0));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Következő
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
