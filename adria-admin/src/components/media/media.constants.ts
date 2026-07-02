export type MediaCategory =
  | 'general'
  | 'blog'
  | 'tours'
  | 'apartments'
  | 'homepage_offers'
  | 'portfolio'
  | 'galleries'
  | 'buses';

export const MEDIA_CATEGORY_OPTIONS: Array<{ value: MediaCategory; label: string }> = [
  { value: 'general', label: 'Általános' },
  { value: 'blog', label: 'Blog' },
  { value: 'tours', label: 'Utazások' },
  { value: 'apartments', label: 'Apartmanok' },
  { value: 'homepage_offers', label: 'Főoldali ajánlatok' },
  { value: 'portfolio', label: 'Portfólió' },
  { value: 'galleries', label: 'Galériák' },
  { value: 'buses', label: 'Buszok' },
];

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = MEDIA_CATEGORY_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.label;
    return accumulator;
  },
  {} as Record<MediaCategory, string>,
);

export function getMediaCategoryLabel(category?: string | null) {
  if (!category || !(category in MEDIA_CATEGORY_LABELS)) {
    return MEDIA_CATEGORY_LABELS.general;
  }

  return MEDIA_CATEGORY_LABELS[category as MediaCategory];
}

export type MediaAllowedType = 'image' | 'pdf' | 'document' | 'video' | 'file';

const DOCUMENT_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
const DOCUMENT_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export function getMediaExtension(value?: string | null) {
  const extension = value?.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase() ?? '';
  return extension;
}

export function getMediaFileType(input: {
  mimeType?: string | null;
  extension?: string | null;
  fileName?: string | null;
  url?: string | null;
}): MediaAllowedType {
  const mimeType = input.mimeType?.toLowerCase() ?? '';
  const extension = (input.extension ?? getMediaExtension(input.fileName ?? input.url ?? '')).toLowerCase();

  if (mimeType.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }

  if (DOCUMENT_MIME_TYPES.has(mimeType) || DOCUMENT_EXTENSIONS.has(extension)) {
    return 'document';
  }

  return 'file';
}

export function matchesAllowedMediaTypes(
  input: {
    mimeType?: string | null;
    extension?: string | null;
    fileName?: string | null;
    url?: string | null;
  },
  allowedTypes: MediaAllowedType[] = ['image'],
) {
  const fileType = getMediaFileType(input);
  return allowedTypes.includes(fileType) || (allowedTypes.includes('file') && fileType === 'file');
}

export function getMediaAcceptString(allowedTypes: MediaAllowedType[] = ['image']) {
  const accept = new Set<string>();

  if (allowedTypes.includes('image')) {
    accept.add('image/*');
    accept.add('.jpg');
    accept.add('.jpeg');
    accept.add('.png');
    accept.add('.webp');
    accept.add('.gif');
    accept.add('.svg');
  }

  if (allowedTypes.includes('video')) {
    accept.add('video/*');
  }

  if (allowedTypes.includes('pdf')) {
    accept.add('application/pdf');
    accept.add('.pdf');
  }

  if (allowedTypes.includes('document')) {
    accept.add('application/msword');
    accept.add('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    accept.add('application/vnd.ms-excel');
    accept.add('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    accept.add('.doc');
    accept.add('.docx');
    accept.add('.xls');
    accept.add('.xlsx');
  }

  if (allowedTypes.includes('file')) {
    accept.add('*/*');
  }

  return Array.from(accept).join(',');
}
