import type { LucideIcon } from 'lucide-react';

export type GuideImage = {
  /** File name inside public/user-guide, without the extension. */
  file: string;
  alt: string;
  caption: string;
};

export type GuideField = {
  /** The label exactly as the admin shows it. */
  name: string;
  /** What the setting does and how to fill it in. */
  description: string;
  /** Where the value shows up (public site, e-mail, partner feed, admin only). */
  appearsAt?: string;
};

export type GuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'steps'; title?: string; items: string[] }
  | {
      type: 'fields';
      title: string;
      description?: string;
      fields: GuideField[];
    }
  | { type: 'image'; image: GuideImage }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string };

export type GuideTopic = {
  id: string;
  title: string;
  summary: string;
  /** Admin route of the screen the topic describes. */
  path?: string;
  /** Menu path shown to the reader, e.g. "Körutazások › Ajánlatok". */
  menu?: string;
  /** Human readable name of the permission the screen needs, if any. */
  access?: string;
  blocks: GuideBlock[];
};

export type GuideChapter = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  topics: GuideTopic[];
};
