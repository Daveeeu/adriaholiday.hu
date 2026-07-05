import { lazy, Suspense, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export type { RichTextControl } from './rich-text-editor-impl';
export { RichTextPreview } from './rich-text-preview';

const RichTextEditorImpl = lazy(() =>
  import('./rich-text-editor-impl').then((module) => ({
    default: module.RichTextEditor,
  })),
);

type RichTextEditorProps = ComponentProps<typeof RichTextEditorImpl>;

export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'animate-pulse rounded-xl border bg-muted/20',
            props.className,
          )}
          style={{ minHeight: props.minHeight ?? 240 }}
        />
      }
    >
      <RichTextEditorImpl {...props} />
    </Suspense>
  );
}
