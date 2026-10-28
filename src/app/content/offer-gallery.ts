import type { PortfolioOfferGalleryItem } from "./portfolio-offer-detail-api";

export function galleryImageUrl(item: PortfolioOfferGalleryItem): string {
  return item.image?.url || item.image?.thumbnailUrl || "";
}

export function hasGalleryImage(item: PortfolioOfferGalleryItem): boolean {
  return galleryImageUrl(item) !== "";
}

/** The gallery's shown items, in the order set in the admin. */
export function visibleGalleryItems(gallery?: PortfolioOfferGalleryItem[] | null): PortfolioOfferGalleryItem[] {
  return (gallery ?? [])
    .filter((item) => item.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || String(a.id).localeCompare(String(b.id)));
}
