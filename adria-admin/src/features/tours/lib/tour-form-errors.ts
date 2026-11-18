import type { FieldErrors, FieldPath, UseFormReturn } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

import type { TourFormValues } from './tours.types';

const toCamelCase = (segment: string) =>
  segment.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());

/**
 * The form field a server validation key belongs to: `seo_name` → `seoName`,
 * `price_box_price` → `priceBox.price`, `dates.0.price_box_label` →
 * `dates.0.priceBox.label`.
 */
export function tourFormPathForServerKey(key: string): string {
  return key
    .split('.')
    .map((segment) => (/^\d+$/.test(segment) ? segment : toCamelCase(segment)))
    .join('.')
    .replace(
      /(^|\.)priceBox([A-Z])/g,
      (_, separator: string, letter: string) =>
        `${separator}priceBox.${letter.toLowerCase()}`,
    );
}

/**
 * Shows the server's validation messages (422) at the fields they are about;
 * returns the fields it marked.
 */
export function setTourServerErrors(
  form: UseFormReturn<TourFormValues>,
  error: unknown,
): FieldPath<TourFormValues>[] {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return [];
  }

  const errors =
    (error.payload as { errors?: Record<string, unknown> } | null)?.errors ??
    {};
  const marked: FieldPath<TourFormValues>[] = [];

  for (const [key, messages] of Object.entries(errors)) {
    const path = tourFormPathForServerKey(key) as FieldPath<TourFormValues>;
    const message = (Array.isArray(messages) ? messages : [messages]).find(
      (item): item is string => typeof item === 'string' && item.trim() !== '',
    );

    if (message && form.getValues(path) !== undefined) {
      form.setError(path, { type: 'server', message });
      marked.push(path);
    }
  }

  return marked;
}

/** Every distinct message of the form's errors, nested fields included. */
export function collectFormErrorMessages(errors: FieldErrors): string[] {
  const messages = new Set<string>();

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === 'ref') {
        continue;
      }

      if (
        key === 'message' &&
        typeof value === 'string' &&
        value.trim() !== ''
      ) {
        messages.add(value);
      } else {
        visit(value);
      }
    }
  };

  visit(errors);

  return [...messages];
}
