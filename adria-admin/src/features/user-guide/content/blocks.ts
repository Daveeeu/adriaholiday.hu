import type { GuideBlock, GuideField } from '../lib/user-guide.types';

/** Small builders that keep the chapter files readable. */

export const p = (text: string): GuideBlock => ({ type: 'paragraph', text });

export const list = (items: string[], title?: string): GuideBlock => ({
  type: 'list',
  items,
  title,
});

export const steps = (items: string[], title?: string): GuideBlock => ({
  type: 'steps',
  items,
  title,
});

export const tip = (text: string): GuideBlock => ({ type: 'tip', text });

export const warning = (text: string): GuideBlock => ({
  type: 'warning',
  text,
});

export const img = (
  file: string,
  alt: string,
  caption: string,
): GuideBlock => ({
  type: 'image',
  image: { file, alt, caption },
});

export const fields = (
  title: string,
  items: GuideField[],
  description?: string,
): GuideBlock => ({
  type: 'fields',
  title,
  description,
  fields: items,
});

export const field = (
  name: string,
  description: string,
  appearsAt?: string,
): GuideField => ({
  name,
  description,
  appearsAt,
});

/** Recurring "where it shows up" phrases, so the wording stays the same everywhere. */
export const ADMIN_ONLY = 'Csak az adminban, a publikus oldalon nem látszik.';
export const SEARCH_RESULTS =
  'A Google és más keresők találati listájában, valamint a böngésző fülén.';
