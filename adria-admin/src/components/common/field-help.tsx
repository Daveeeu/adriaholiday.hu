import { CircleHelp, MapPin } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { guideImageUrl } from '@/features/user-guide/lib/guide-image-url';
import type { GuideField } from '@/features/user-guide/lib/user-guide.types';

type FieldHelpProps = {
  /** The user guide's entry for the field. */
  help: GuideField;
};

/**
 * A small question mark beside a field's label: hovering or focusing it shows
 * what the field is for, where its value shows up and a picture of that place.
 */
export function FieldHelp({ help }: FieldHelpProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Súgó: ${help.name}`}
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            // Inside a <label> a click would toggle or focus the field instead.
            onClick={(event) => event.preventDefault()}
          >
            <CircleHelp className="size-4" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="w-80 max-w-[calc(100vw-2rem)] space-y-2"
        >
          <p className="font-semibold text-foreground">{help.name}</p>
          <p className="leading-relaxed text-muted-foreground">
            {help.description}
          </p>
          {help.appearsAt ? (
            <p className="flex gap-1.5 leading-relaxed">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                <span className="font-medium">Hol jelenik meg: </span>
                {help.appearsAt}
              </span>
            </p>
          ) : null}
          {help.preview ? (
            <img
              src={guideImageUrl(help.preview.file)}
              alt={help.preview.alt}
              loading="lazy"
              className="max-h-52 w-full rounded-lg border bg-muted object-contain object-left-top"
            />
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
