import { AlertTriangle, Lightbulb } from 'lucide-react';

import type { GuideBlock } from '../lib/user-guide.types';

import { GuideFieldList } from './guide-field-list';
import { GuideFigure } from './guide-figure';

export function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {block.text}
        </p>
      );

    case 'list':
      return (
        <div className="space-y-2">
          {block.title ? (
            <h4 className="font-semibold">{block.title}</h4>
          ) : null}
          <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/90">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'steps':
      return (
        <div className="space-y-2">
          {block.title ? (
            <h4 className="font-semibold">{block.title}</h4>
          ) : null}
          <ol className="space-y-2">
            {block.items.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] leading-relaxed text-foreground/90"
              >
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'fields':
      return (
        <GuideFieldList
          title={block.title}
          description={block.description}
          fields={block.fields}
        />
      );

    case 'image':
      return <GuideFigure image={block.image} />;

    case 'tip':
      return (
        <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
          <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Tipp: </span>
            {block.text}
          </p>
        </div>
      );

    case 'warning':
      return (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Figyelem: </span>
            {block.text}
          </p>
        </div>
      );
  }
}
