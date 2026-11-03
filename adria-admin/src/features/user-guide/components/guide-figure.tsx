import { Maximize2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { GUIDE_IMAGE_SIZES } from '../lib/guide-image-sizes';
import { guideImageUrl } from '../lib/guide-image-url';
import type { GuideImage } from '../lib/user-guide.types';

export function GuideFigure({ image }: { image: GuideImage }) {
  const src = guideImageUrl(image.file);
  // Known dimensions reserve the space before a lazy image loads, so jumping
  // to a topic further down the page lands in the right place.
  const size = GUIDE_IMAGE_SIZES[image.file];

  return (
    <figure className="space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full overflow-hidden rounded-2xl border bg-muted/40 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${image.alt} – nagyítás`}
          >
            <img
              src={src}
              alt={image.alt}
              width={size?.width}
              height={size?.height}
              loading="lazy"
              className="block h-auto w-full"
            />
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="size-3.5" />
              Nagyítás
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[94vh] max-w-[min(1500px,96vw)] overflow-auto p-3 sm:p-4">
          <DialogTitle className="pr-8 text-base">{image.alt}</DialogTitle>
          <DialogDescription>{image.caption}</DialogDescription>
          <img
            src={src}
            alt={image.alt}
            className="h-auto w-full rounded-xl border"
          />
        </DialogContent>
      </Dialog>
      <figcaption className="text-sm leading-relaxed text-muted-foreground">
        {image.caption}
      </figcaption>
    </figure>
  );
}
