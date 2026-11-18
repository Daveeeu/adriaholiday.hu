import { cn } from '@/lib/utils';

import {
  TOUR_FORM_SECTIONS,
  type TourFormSectionKey,
} from '../lib/tour-form-sections';

type TourEditorNavProps = {
  active: TourFormSectionKey;
  onSelect: (section: TourFormSectionKey) => void;
  /** A short count shown beside a section, e.g. "3". */
  counts: Partial<Record<TourFormSectionKey, number>>;
  /** Sections holding a field with an error. */
  invalid: TourFormSectionKey[];
};

const GROUPS = [...new Set(TOUR_FORM_SECTIONS.map((section) => section.group))];

/**
 * The editor's section menu: a grouped list beside the form on wide screens,
 * a scrolling row of buttons above it on narrow ones.
 */
export function TourEditorNav({
  active,
  onSelect,
  counts,
  invalid,
}: TourEditorNavProps) {
  return (
    <nav aria-label="Körutazás szakaszai" className="lg:sticky lg:top-24">
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {GROUPS.map((group) => (
          <div key={group} className="flex shrink-0 gap-1 lg:flex-col">
            <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">
              {group}
            </p>
            {TOUR_FORM_SECTIONS.filter(
              (section) => section.group === group,
            ).map((section) => {
              const isActive = section.key === active;
              const hasError = invalid.includes(section.key);
              const count = counts[section.key];

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => onSelect(section.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="flex-1">{section.title}</span>
                  {count !== undefined && count > 0 ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-xs tabular-nums',
                        isActive
                          ? 'bg-primary-foreground/20'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                  {hasError ? (
                    <span
                      className="size-2 rounded-full bg-destructive"
                      aria-label="Hibás mező"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
