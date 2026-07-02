import { useEffect, useMemo, useRef, useState } from 'react';
import {
  File,
  FileImage,
  FileText,
  LibraryBig,
  Loader2,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  getMediaAcceptString,
  getMediaFileType,
  matchesAllowedMediaTypes,
  MEDIA_CATEGORY_OPTIONS,
  type MediaAllowedType,
  type MediaCategory,
  getMediaCategoryLabel,
} from './media.constants';
import { listMedia, uploadMedia, type MediaAsset } from '@/services/media-service';

type MediaPickerProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null, media?: MediaAsset | null) => void;
  accept?: string;
  previewMode?: 'image' | 'video';
  description?: string;
  disabled?: boolean;
  className?: string;
  defaultCategory?: MediaCategory;
  allowedTypes?: MediaAllowedType[];
  sourceContext?: string;
  sourceId?: string | number;
  uploadAlt?: string;
  uploadTitle?: string;
};

function getPreviewUrl(value: string | null) {
  return value?.trim() ? value.trim() : '';
}

function getFileNameFromUrl(value: string | null) {
  const cleaned = getPreviewUrl(value);
  if (!cleaned) {
    return 'Ismeretlen fájl';
  }

  const fileName = cleaned.split('?')[0].split('#')[0].split('/').pop() ?? '';
  return fileName || 'Ismeretlen fájl';
}

function formatMediaDate(value?: string | null) {
  if (!value) {
    return 'Ismeretlen';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ismeretlen';
  }

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'Minden fájl' },
  ...MEDIA_CATEGORY_OPTIONS,
] as const;

function getMediaIcon(type: ReturnType<typeof getMediaFileType>) {
  switch (type) {
    case 'image':
      return <FileImage className="size-5" />;
    case 'pdf':
    case 'document':
      return <FileText className="size-5" />;
    case 'video':
      return <File className="size-5" />;
    default:
      return <File className="size-5" />;
  }
}

export function MediaPicker({
  label,
  value,
  onChange,
  accept,
  previewMode = 'image',
  description = 'Drag & drop vagy kattintás a feltöltéshez.',
  disabled = false,
  className,
  defaultCategory = 'general',
  allowedTypes = ['image'],
  sourceContext,
  sourceId,
  uploadAlt,
  uploadTitle,
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState<MediaCategory | 'all'>(defaultCategory);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>(defaultCategory);
  const [isUploading, setIsUploading] = useState(false);
  const acceptValue = accept ?? getMediaAcceptString(allowedTypes);
  const previewUrl = getPreviewUrl(value);
  const previewType = getMediaFileType({ url: previewUrl });

  useEffect(() => {
    setLibraryCategory(defaultCategory);
    setUploadCategory(defaultCategory);
  }, [defaultCategory]);

  const mediaQuery = useQuery({
    queryKey: ['admin-media', librarySearch, libraryCategory, allowedTypes.join(',')],
    queryFn: () =>
      listMedia({
        perPage: 24,
        page: 1,
        search: librarySearch || undefined,
        category: libraryCategory === 'all' ? undefined : libraryCategory,
      }),
    enabled: libraryOpen,
  });

  const libraryItems = useMemo(
    () =>
      (mediaQuery.data?.items ?? []).filter((media) =>
        matchesAllowedMediaTypes(
          {
            mimeType: media.mimeType,
            extension: media.extension,
            fileName: media.fileName,
            url: media.url,
          },
          allowedTypes,
        ),
      ),
    [allowedTypes, mediaQuery.data?.items],
  );

  const handleUpload = async (file: File | null) => {
    if (!file || disabled) {
      return;
    }

    if (!matchesAllowedMediaTypes({ mimeType: file.type, fileName: file.name }, allowedTypes)) {
      toast.error('A kiválasztott fájltípus nem engedélyezett ebben a mezőben.');
      return;
    }

    setIsUploading(true);
    try {
      const media = await uploadMedia(file, {
        category: uploadCategory,
        sourceContext,
        sourceId,
        alt: uploadAlt,
        title: uploadTitle,
      });
      onChange(media.url, media);
      toast.success('Fájl feltöltve.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nem sikerült feltölteni a fájlt.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const emptyState = useMemo(
    () => (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
        {getMediaIcon(previewType)}
        {previewType === 'image' ? 'Nincs kiválasztott kép' : 'Nincs kiválasztott fájl'}
      </div>
    ),
    [previewType],
  );

  return (
    <div className={cn('space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{label}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Fájl kiválasztása
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLibraryCategory(defaultCategory);
              setLibrarySearch('');
              setLibraryOpen(true);
            }}
            disabled={disabled}
          >
            <LibraryBig className="size-4" />
            Médiatár
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null, null)}
              disabled={disabled}
            >
              <Trash2 className="size-4" />
              Fájl eltávolítása
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Feltöltési kategória
          </div>
          <Select
            value={uploadCategory}
            onChange={(event) => setUploadCategory(event.target.value as MediaCategory)}
            disabled={disabled || isUploading}
          >
            {MEDIA_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Kiválasztott kategória
          </div>
          <div className="text-sm font-medium">{getMediaCategoryLabel(uploadCategory)}</div>
        </div>
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptValue}
        onChange={(event) => {
          void handleUpload(event.target.files?.[0] ?? null);
        }}
      />

      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-background transition-colors',
          isDragActive ? 'border-cyan-400 bg-cyan-50' : 'border-border',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragActive(true);
          }
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          void handleUpload(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        {previewUrl ? (
          previewType === 'image' ? (
            previewMode === 'video' ? (
              <video src={previewUrl} className="h-56 w-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <img src={previewUrl} alt={label} className="h-56 w-full object-cover" />
            )
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-3 px-4 text-center">
              {getMediaIcon(previewType)}
              <div className="space-y-1">
                <div className="text-sm font-medium">{getFileNameFromUrl(previewUrl)}</div>
                <div className="text-xs text-muted-foreground">
                  {previewType === 'pdf'
                    ? 'PDF dokumentum'
                    : previewType === 'document'
                      ? 'Dokumentum'
                      : previewType === 'video'
                        ? 'Videó'
                        : 'Fájl'}
                </div>
              </div>
            </div>
          )
        ) : (
          emptyState
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border bg-background px-3 py-1">
          Kliensoldali preview: {previewUrl ? 'igen' : 'nem'}
        </span>
        <span className="rounded-full border bg-background px-3 py-1">
          Feltöltés: {isUploading ? 'folyamatban' : 'kész'}
        </span>
      </div>

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Médiatár</DialogTitle>
            <DialogDescription>Válassz korábban feltöltött fájlt vagy tölts fel újat.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
              <Input
                value={librarySearch}
                onChange={(event) => setLibrarySearch(event.target.value)}
                placeholder="Keresés név, fájlnév, alt vagy title alapján"
              />
              <Select
                value={libraryCategory}
                onChange={(event) => setLibraryCategory(event.target.value as MediaCategory | 'all')}
              >
                {CATEGORY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
                <Button type="button" variant="outline" onClick={() => mediaQuery.refetch()}>
                  <Search className="size-4" />
                Keresés
              </Button>
            </div>

            {mediaQuery.isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Médiatár betöltése...
              </div>
            ) : mediaQuery.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Nem sikerült betölteni a médiatárat.
              </div>
            ) : (
              <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
                {libraryItems.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nincs találat.
                  </div>
                ) : (
                  libraryItems.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      disabled={!matchesAllowedMediaTypes({
                        mimeType: media.mimeType,
                        extension: media.extension,
                        fileName: media.fileName,
                        url: media.url,
                      }, allowedTypes)}
                      className={cn(
                        'overflow-hidden rounded-2xl border bg-background text-left transition-colors hover:border-primary/50',
                        media.url === previewUrl ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                      )}
                      onClick={() => {
                        onChange(media.url, media);
                        setLibraryOpen(false);
                      }}
                      >
                      <div className="aspect-[4/3] bg-muted/20">
                        {media.type === 'image' && (media.thumbnailUrl || media.url) ? (
                          <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                            {getMediaIcon(
                              getMediaFileType({
                                mimeType: media.mimeType,
                                extension: media.extension,
                                fileName: media.fileName,
                                url: media.url,
                              }),
                            )}
                            <span className="text-xs text-muted-foreground">
                              {media.type === 'pdf'
                                ? 'PDF'
                                : media.type === 'document'
                                  ? 'Dokumentum'
                                  : media.type === 'video'
                                    ? 'Videó'
                                    : 'Fájl'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-3">
                        <div className="line-clamp-2 text-sm font-medium">{media.fileName || media.name}</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-transparent bg-muted/80 text-muted-foreground">
                            {media.categoryLabel || getMediaCategoryLabel(media.category)}
                          </Badge>
                          <Badge className="border-transparent bg-muted/80 text-muted-foreground">
                            {media.type === 'pdf'
                              ? 'PDF'
                              : media.type === 'document'
                                ? 'Dokumentum'
                                : media.type === 'video'
                                  ? 'Videó'
                                  : 'Kép'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>{media.fileName || 'Ismeretlen fájlnév'}</div>
                          <div>{formatMediaDate(media.createdAt)}</div>
                          <div>{(media.size / 1024).toFixed(0)} KB</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
