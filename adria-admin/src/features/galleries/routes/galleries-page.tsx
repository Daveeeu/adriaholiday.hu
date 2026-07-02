import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { PageLoader } from '@/components/common/page-loader';
import {
  getMediaAcceptString,
  MEDIA_CATEGORY_OPTIONS,
  getMediaFileType,
  type MediaCategory,
  getMediaCategoryLabel,
} from '@/components/media/media.constants';
import {
  deleteMedia,
  getMedia,
  listMedia,
  type MediaAsset,
  updateMedia,
  uploadMedia,
} from '@/services/media-service';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Legújabb' },
  { value: 'oldest', label: 'Legrégebbi' },
  { value: 'name', label: 'Név szerint' },
] as const;

function formatBytes(bytes?: number | null) {
  if (!bytes || Number.isNaN(bytes)) {
    return '0 KB';
  }

  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Ismeretlen';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ismeretlen';
  }

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatDateTimeLong(value?: string | null) {
  if (!value) {
    return 'Ismeretlen';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ismeretlen';
  }

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

const SOURCE_CONTEXT_LABELS: Record<string, string> = {
  blog_article: 'Blog cikk',
  tour: 'Körutazás',
  tour_program_pdf: 'Körutazás program PDF',
  apartment: 'Apartman',
  portfolio_content: 'Portfólió tartalom',
  homepage_offer: 'Főoldali ajánlat',
  gallery: 'Galéria',
  region: 'Régió',
  partner_banner: 'Partner banner',
};

function getSourceContextLabel(value?: string | null) {
  if (!value) {
    return 'Média';
  }

  return SOURCE_CONTEXT_LABELS[value] ?? value.replace(/_/g, ' ');
}

function getUsageEntityName(label?: string | null) {
  if (!label) {
    return 'Kézi feltöltés';
  }

  return label;
}

function getUsageCountLabel(count: number) {
  if (count === 0) {
    return 'Nincs még rögzített felhasználás';
  }

  if (count === 1) {
    return '1 felhasználási hely';
  }

  return `${count} felhasználási hely`;
}

function getMediaTypeLabel(type?: string | null) {
  switch (type) {
    case 'image':
      return 'Kép';
    case 'pdf':
      return 'PDF';
    case 'document':
      return 'Dokumentum';
    case 'video':
      return 'Videó';
    default:
      return 'Fájl';
  }
}

function getMediaTypeIcon(type?: string | null) {
  switch (type) {
    case 'image':
      return <FileImage className="size-8" />;
    case 'pdf':
      return <FileText className="size-8" />;
    case 'document':
      return <FileSpreadsheet className="size-8" />;
    case 'video':
      return <File className="size-8" />;
    default:
      return <File className="size-8" />;
  }
}

function getFileNameFromUrl(value?: string | null) {
  if (!value) {
    return 'Ismeretlen fájl';
  }

  const fileName = value.split('?')[0].split('#')[0].split('/').pop() ?? '';
  return fileName || 'Ismeretlen fájl';
}

function MediaUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (media: MediaAsset) => void;
}) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [category, setCategory] = useState<MediaCategory>('general');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const fileType = file ? getMediaFileType({ mimeType: file.type, fileName: file.name }) : null;

  useEffect(() => {
    if (!open) {
      setFile(null);
      setIsDragActive(false);
      setCategory('general');
      setAlt('');
      setTitle('');
    }
  }, [open]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Válassz egy fájlt.');
      }

      return uploadMedia(file, {
        category,
        alt: alt || undefined,
        title: title || undefined,
      });
    },
    onSuccess: async (media) => {
      toast.success('Fájl feltöltve.');
      await queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      onUploaded(media);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nem sikerült feltölteni a fájlt.');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fájl feltöltése</DialogTitle>
          <DialogDescription>Drag & Drop vagy fájlválasztó segítségével tölts fel képet, PDF-et vagy dokumentumot.</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'space-y-4 rounded-2xl border border-dashed p-4 transition-colors',
            isDragActive ? 'border-cyan-400 bg-cyan-50' : 'border-border bg-muted/20',
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragActive(false);
            setFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <label className="block text-sm">
            Fájl
            <Input
              className="mt-2"
              type="file"
              accept={getMediaAcceptString(['image', 'pdf', 'document'])}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm">
              Kategória
              <Select
                className="mt-2"
                value={category}
                onChange={(event) => setCategory(event.target.value as MediaCategory)}
              >
                {MEDIA_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm md:col-span-2">
              Alt
              <Input className="mt-2" value={alt} onChange={(event) => setAlt(event.target.value)} />
            </label>
          </div>

          <label className="block text-sm">
            Cím
            <Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          {file ? (
            <div className="flex items-center gap-3 rounded-2xl border bg-background p-3 text-sm">
              {getMediaTypeIcon(fileType)}
              <div className="min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {getMediaTypeLabel(fileType)}
                  {' · '}
                  {formatBytes(file.size)}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-background p-6 text-center text-sm text-muted-foreground">
              Húzd ide a fájlt vagy válassz egyet a gépről. Kép, PDF vagy dokumentum.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button
            type="button"
            onClick={() => {
              void uploadMutation.mutateAsync();
            }}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Feltöltés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaDetailSheet({
  media,
  open,
  onOpenChange,
}: {
  media: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [draftCategory, setDraftCategory] = useState<MediaCategory>('general');
  const [draftAlt, setDraftAlt] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'done'>('idle');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!media) {
      return;
    }

    setDraftCategory((media.category as MediaCategory) ?? 'general');
    setDraftAlt(media.alt ?? '');
    setDraftTitle(media.title ?? '');
    setCopyState('idle');
    setConfirmDeleteOpen(false);
  }, [media]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!media) {
        throw new Error('Hiányzó média.');
      }

      return updateMedia(media.id, {
        category: draftCategory,
        alt: draftAlt || undefined,
        title: draftTitle || undefined,
      });
    },
    onSuccess: async () => {
      toast.success('Média mentve.');
      await queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      if (media) {
        await queryClient.invalidateQueries({ queryKey: ['admin-media', media.id] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nem sikerült menteni a médiát.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!media) {
        throw new Error('Hiányzó média.');
      }

      await deleteMedia(media.id);
    },
    onSuccess: async () => {
      toast.success('Média törölve.');
      await queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nem sikerült törölni a médiát.');
    },
  });

  const previewUrl = media?.sizes?.large ?? media?.sizes?.preview ?? media?.thumbnailUrl ?? media?.url ?? '';
  const mediaType = media
    ? (media.type ?? getMediaFileType({
      mimeType: media.mimeType,
      extension: media.extension,
      fileName: media.fileName,
      url: media.url,
    }))
    : 'file';
  const isImage = mediaType === 'image';
  const isPdf = mediaType === 'pdf';
  const canDownload = !!media?.url;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Média részletei</SheetTitle>
            <SheetDescription>Előnézet, kategória, metaadatok és használati információk.</SheetDescription>
          </SheetHeader>

          {media ? (
            <div className="mt-6 space-y-6">
              <div className="overflow-hidden rounded-2xl border bg-background">
                {previewUrl ? (
                  isImage ? (
                    <img src={previewUrl} alt={media.name} className="h-64 w-full object-cover" />
                  ) : isPdf ? (
                    <div className="flex h-64 items-center justify-center px-4 text-center">
                      <div className="space-y-3">
                        {getMediaTypeIcon(mediaType)}
                        <div className="text-sm font-medium">{media.fileName || getFileNameFromUrl(media.url) || media.name}</div>
                        <div className="text-xs text-muted-foreground">PDF dokumentum</div>
                      </div>
                    </div>
                  ) : mediaType === 'video' ? (
                    <video src={previewUrl} className="h-64 w-full object-cover" controls playsInline />
                  ) : (
                    <div className="flex h-64 items-center justify-center px-4 text-center">
                      <div className="space-y-3">
                        {getMediaTypeIcon(mediaType)}
                        <div className="text-sm font-medium">{media.fileName || getFileNameFromUrl(media.url) || media.name}</div>
                        <div className="text-xs text-muted-foreground">{getMediaTypeLabel(mediaType)}</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Nincs előnézet.
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <label className="block text-sm">
                  Fájlnév
                  <Input className="mt-2" value={media.fileName ?? ''} readOnly />
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      window.open(media.url, '_blank', 'noopener,noreferrer');
                    }}
                    disabled={!media.url}
                  >
                    <ExternalLink className="size-4" />
                    Megnyitás új lapon
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const anchor = document.createElement('a');
                      anchor.href = media.url;
                      anchor.download = media.fileName || media.name || 'media';
                      anchor.rel = 'noopener noreferrer';
                      document.body.appendChild(anchor);
                      anchor.click();
                      anchor.remove();
                    }}
                    disabled={!canDownload}
                  >
                    <Download className="size-4" />
                    Letöltés
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void copyText(media.url)
                        .then(() => {
                          setCopyState('done');
                          toast.success('URL másolva.');
                          window.setTimeout(() => setCopyState('idle'), 1200);
                        })
                        .catch(() => toast.error('Nem sikerült másolni az URL-t.'));
                    }}
                  >
                    {copyState === 'done' ? <Check className="size-4" /> : <Copy className="size-4" />}
                    URL másolása
                  </Button>
                </div>
                <label className="block text-sm">
                  URL
                  <Input className="mt-2" value={media.url} readOnly />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    Kategória
                    <Select
                      className="mt-2"
                      value={draftCategory}
                      onChange={(event) => setDraftCategory(event.target.value as MediaCategory)}
                    >
                      {MEDIA_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Méret</div>
                    <div className="mt-1 text-sm font-medium">{formatBytes(media.size)}</div>
                  </div>
                </div>
                <label className="block text-sm">
                  Alt szöveg
                  <Textarea
                    className="mt-2 min-h-24"
                    value={draftAlt}
                    onChange={(event) => setDraftAlt(event.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  Cím
                  <Input
                    className="mt-2"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                  />
                </label>
                <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Feltöltés dátuma</span>
                    <span className="font-medium">{formatDateTimeLong(media.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Kategória badge</span>
                    <Badge>{media.categoryLabel || getMediaCategoryLabel(media.category)}</Badge>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/10 p-4">
                  <div className="mb-3 text-sm font-semibold">Hol használják?</div>
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {getUsageCountLabel((media.usage ?? []).length)}
                  </div>
                  <div className="space-y-3">
                    {(media.usage ?? []).length === 0 ? (
                      <div className="rounded-xl border border-dashed bg-background px-4 py-3 text-sm text-muted-foreground">
                        Ehhez a fájlhoz még nincs rögzített felhasználás.
                      </div>
                    ) : (
                      (media.usage ?? []).map((item) => (
                        <div
                          key={`${item.label}-${item.sourceId ?? item.modelId ?? 'x'}`}
                          className="rounded-xl border bg-background p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-primary/20 bg-primary/10 text-primary">
                              {getSourceContextLabel(item.sourceContext)}
                            </Badge>
                            <span className="text-sm font-medium">{getUsageEntityName(item.label)}</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {item.sourceContext ? `sourceContext: ${getSourceContextLabel(item.sourceContext)}` : 'Forrás nélkül rögzítve'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="mr-auto"
                >
                  <Trash2 className="size-4" />
                  Törlés
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    void saveMutation.mutateAsync();
                  }}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Mentés
                </Button>
              </SheetFooter>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed bg-muted/10 p-6 text-sm text-muted-foreground">
              Válassz ki egy médiát a részletek megjelenítéséhez.
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biztosan törölni szeretnéd?</DialogTitle>
            <DialogDescription>
              A fájl végleg törlődik a médiatárból.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Mégse
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void deleteMutation.mutateAsync();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Igen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GalleriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MediaCategory | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [page, setPage] = useState(1);
  const [selectedMediaId, setSelectedMediaId] = useState<string | number | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Array<string | number>>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const mediaQuery = useQuery({
    queryKey: ['admin-media', { search, category, sort, page }],
    queryFn: () =>
      listMedia({
        search: search || undefined,
        category: category === 'all' ? undefined : category,
        sort,
        page,
        perPage: 24,
      }),
  });

  useEffect(() => {
    setPage(1);
    setSelectedMediaIds([]);
  }, [search, category, sort]);

  useEffect(() => {
    setSelectedMediaIds([]);
  }, [page]);

  const selectedMediaQuery = useQuery({
    queryKey: ['admin-media', selectedMediaId],
    queryFn: () => getMedia(selectedMediaId as string | number),
    enabled: selectedMediaId !== null,
  });

  const totalPages = useMemo(() => {
    const totalCount = mediaQuery.data?.totalCount ?? 0;
    const perPage = mediaQuery.data?.perPage ?? 24;
    return Math.max(1, Math.ceil(totalCount / perPage));
  }, [mediaQuery.data?.perPage, mediaQuery.data?.totalCount]);

  const cards = mediaQuery.data?.items ?? [];
  const selectedMedia = selectedMediaQuery.data ?? null;
  const selectedCount = selectedMediaIds.length;

  const toggleSelectedMedia = (mediaId: string | number) => {
    setSelectedMediaIds((current) =>
      current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId],
    );
  };

  const clearSelectedMedia = () => {
    setSelectedMediaIds([]);
  };

  if (mediaQuery.isLoading && !mediaQuery.data) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Galéria
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Médiatár</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Ez a teljes adminisztrációs médiakezelő felület. Itt tölthetsz fel, szerkeszthetsz,
              törölhetsz és szűrhetsz minden fájlt, amit a rendszer használ.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setUploadOpen(true)}>
              <Plus className="size-4" />
              Fájl feltöltése
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px_180px]">
          <label className="block text-sm">
            Keresés
            <div className="mt-2 flex items-center gap-2 rounded-xl border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Fájlnév, alt, cím..."
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </label>

          <label className="block text-sm">
            Kategória
            <Select
              className="mt-2"
              value={category}
              onChange={(event) => setCategory(event.target.value as MediaCategory | 'all')}
            >
              <option value="all">Minden fájl</option>
              {MEDIA_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="block text-sm">
            Rendezés
            <Select
              className="mt-2"
              value={sort}
              onChange={(event) => setSort(event.target.value as 'newest' | 'oldest' | 'name')}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <div className="rounded-xl border bg-background p-3 text-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Találat</div>
            <div className="mt-1 font-semibold">{mediaQuery.data?.totalCount ?? 0} fájl</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/10 px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            {selectedCount > 0 ? (
              <span className="font-medium text-foreground">{selectedCount} fájl kijelölve</span>
            ) : (
              'Kijelölés nélkül böngészheted a médiatárat.'
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={clearSelectedMedia}
            disabled={selectedCount === 0}
          >
            Kijelölés törlése
          </Button>
        </div>
      </Card>

      {mediaQuery.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Nem sikerült betölteni a médiatárat.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((media) => {
              const isActive = selectedMediaId === media.id;
              const isSelected = selectedMediaIds.includes(media.id);
              const mediaType = media.type ?? getMediaFileType({
                mimeType: media.mimeType,
                extension: media.extension,
                fileName: media.fileName,
                url: media.url,
              });
              const preview = media.thumbnailUrl || media.url;

              return (
                <button
                  key={media.id}
                  type="button"
                  className={cn(
                    'group overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                    isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border/60',
                    isSelected ? 'border-cyan-500/70 ring-2 ring-cyan-500/20' : '',
                  )}
                  onClick={() => setSelectedMediaId(media.id)}
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-muted/20">
                    {preview && mediaType === 'image' ? (
                      <img
                        src={preview}
                        alt={media.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-muted-foreground">
                        {getMediaTypeIcon(mediaType)}
                        <span className="text-xs">{getMediaTypeLabel(mediaType)}</span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 z-10">
                      <label
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-background/80 bg-background/95 shadow-sm backdrop-blur"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectedMedia(media.id)}
                          className="size-4 accent-cyan-600"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="min-h-12 text-sm font-semibold leading-6 line-clamp-2">{media.fileName || media.name}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-transparent bg-primary/10 text-primary">
                        {media.categoryLabel || getMediaCategoryLabel(media.category)}
                      </Badge>
                      <Badge className="border-transparent bg-muted/80 text-muted-foreground">
                        {getMediaTypeLabel(mediaType)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border bg-muted/40 px-2.5 py-1">{formatBytes(media.size)}</span>
                      <span className="rounded-full border bg-muted/40 px-2.5 py-1">{formatDateTime(media.createdAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nincs találat.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">
              Oldal {mediaQuery.data?.page ?? 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                Előző
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Következő
              </Button>
            </div>
          </div>
        </>
      )}

      <MediaDetailSheet
        media={selectedMedia}
        open={selectedMediaId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMediaId(null);
          }
        }}
      />

      <MediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(media) => {
          setPage(1);
          setSort('newest');
          setSelectedMediaId(media.id);
          void queryClient.invalidateQueries({ queryKey: ['admin-media'] });
        }}
      />
    </div>
  );
}
