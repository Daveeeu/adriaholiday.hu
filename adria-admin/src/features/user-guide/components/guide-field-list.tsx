import { MapPin } from 'lucide-react';

import type { GuideField } from '../lib/user-guide.types';

type GuideFieldListProps = {
  title: string;
  description?: string;
  fields: GuideField[];
};

export function GuideFieldList({
  title,
  description,
  fields,
}: GuideFieldListProps) {
  return (
    <div className="@container overflow-hidden rounded-2xl border bg-card">
      <div className="border-b bg-muted/40 px-4 py-3">
        <h4 className="font-semibold">{title}</h4>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <dl className="divide-y">
        {fields.map((field) => (
          <div
            key={field.name}
            className="grid gap-1.5 px-4 py-3 @xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] @xl:gap-6"
          >
            <dt className="text-sm font-semibold text-foreground">
              {field.name}
            </dt>
            <dd className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              <p>{field.description}</p>
              {field.appearsAt ? (
                <p className="flex gap-1.5 text-foreground/80">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium">Hol jelenik meg: </span>
                    {field.appearsAt}
                  </span>
                </p>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
