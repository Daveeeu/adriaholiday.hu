import { tourEditorTopics } from '@/features/user-guide/content/tour-editor';
import type { GuideField } from '@/features/user-guide/lib/user-guide.types';

/** The user guide's tour editor entries by the form field they document. */
const HELP_BY_FIELD = new Map<string, GuideField>(
  tourEditorTopics.flatMap((topic) =>
    topic.blocks.flatMap((block) =>
      block.type === 'fields'
        ? block.fields.flatMap((field) =>
            (field.formFields ?? []).map(
              (formField) => [formField, field] as const,
            ),
          )
        : [],
    ),
  ),
);

/** A form field's path without its row indices: `dates.3.priceBox.label` → `dates.priceBox.label`. */
export function tourFieldHelpKey(name: string): string {
  return name
    .split('.')
    .filter((segment) => !/^\d+$/.test(segment))
    .join('.');
}

/** The guide's entry for a tour form field, if it has one. */
export function getTourFieldHelp(name: string): GuideField | undefined {
  return HELP_BY_FIELD.get(tourFieldHelpKey(name));
}
