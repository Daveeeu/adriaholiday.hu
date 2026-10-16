import { z } from 'zod';

import { createClientId } from '@/lib/client-id';

/** One image of an entity's gallery (a tour's, an apartment's) in its form. */
export const galleryItemFormSchema = z.object({
  clientId: z.string(),
  mediaId: z.string(),
  image: z.string(),
  title: z.string(),
  alt: z.string(),
  caption: z.string(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export type GalleryItemFormValue = z.infer<typeof galleryItemFormSchema>;

/** The part of a form this editor works on: its gallery field array. */
export type GalleryItemsFormValues = { gallery: GalleryItemFormValue[] };

type ApiGalleryItem = {
  id?: number | string | null;
  mediaId?: number | string | null;
  image?: { url?: string | null; thumbnailUrl?: string | null } | null;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  sortOrder?: number | null;
  active?: boolean | null;
};

/** A gallery item from the API as the form edits it (its id kept as the client id). */
export function toGalleryItemFormValue(item: ApiGalleryItem, index: number): GalleryItemFormValue {
  return {
    clientId: String(item.id ?? createClientId()),
    mediaId: String(item.mediaId ?? ''),
    image: item.image?.url ?? item.image?.thumbnailUrl ?? '',
    title: item.title ?? '',
    alt: item.alt ?? '',
    caption: item.caption ?? '',
    sortOrder: item.sortOrder ?? index + 1,
    active: item.active ?? true,
  };
}
