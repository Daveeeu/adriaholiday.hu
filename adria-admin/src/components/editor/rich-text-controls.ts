export type RichTextControl =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'heading'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'color'
  | 'backgroundColor'
  | 'textAlign'
  | 'fontFamily'
  | 'fontSize'
  | 'undo'
  | 'redo';

export const DEFAULT_CONTROLS: RichTextControl[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'heading',
  'paragraph',
  'bulletList',
  'orderedList',
  'blockquote',
  'link',
  'color',
  'backgroundColor',
  'textAlign',
  'fontFamily',
  'fontSize',
  'undo',
  'redo',
];

/**
 * The fixed formats of trip texts, so every trip looks the same: headings,
 * bold, italics, lists and links, but no fonts, sizes, colours or underlines
 * of their own (the site and the program PDF drop them too).
 */
export const FIXED_FORMAT_CONTROLS: RichTextControl[] = [
  'bold',
  'italic',
  'heading',
  'paragraph',
  'bulletList',
  'orderedList',
  'blockquote',
  'link',
  'textAlign',
  'undo',
  'redo',
];
