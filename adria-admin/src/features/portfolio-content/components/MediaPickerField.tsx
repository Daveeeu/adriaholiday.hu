import { Download, ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { MEDIA_CATEGORY_OPTIONS, type MediaCategory } from '@/components/media/media.constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type MediaValue = {
  url: string;
  thumbnailUrl?: string | null;
  sizes?: {
    thumbnail?: string | null;
    preview?: string | null;
    large?: string | null;
    original?: string | null;
  } | null;
  alt?: string | null;
  title?: string | null;
  mimeType?: string | null;
} | null;

type MediaPickerFieldProps = {
  title: string;
  media: MediaValue;
  accept: string;
  previewMode: 'image' | 'video';
  alt: string;
  mediaTitle: string;
  category: MediaCategory;
  onCategoryChange: (value: MediaCategory) => void;
  onAltChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onDelete: () => void;
  onOpenOriginal?: () => void;
  selectedFileName?: string | null;
  isSaving?: boolean;
  footer?: ReactNode;
};

export function MediaPickerField({
  title,
  media,
  accept,
  previewMode,
  alt,
  mediaTitle,
  category,
  onCategoryChange,
  onAltChange,
  onTitleChange,
  onFileChange,
  onDelete,
  onOpenOriginal,
  selectedFileName,
  isSaving = false,
  footer,
}: MediaPickerFieldProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const previewUrl = media?.sizes?.preview ?? media?.thumbnailUrl ?? media?.url ?? '';
  const originalUrl = media?.sizes?.original ?? media?.url ?? '';
  const thumbnailUrl = media?.sizes?.thumbnail ?? media?.thumbnailUrl ?? media?.url ?? '';
  const largeUrl = media?.sizes?.large ?? media?.url ?? '';

  return (
    <div
      className={`space-y-4 rounded-2xl border border-dashed p-4 transition-colors ${
        isDragActive ? 'border-cyan-300 bg-cyan-300/10' : 'border-border/60 bg-muted/20'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        onFileChange(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">Drag & drop feltöltés, csere és törlés.</p>
        </div>
        {media ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDelete} disabled={isSaving}>
            <Trash2 className="size-4" />
            Törlés
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {previewUrl ? (
          previewMode === 'video' ? (
            <video src={previewUrl} className="h-56 w-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={previewUrl} alt={alt || title} className="h-56 w-full object-cover" />
          )
        ) : (
          <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            Nincs feltöltött média
          </div>
        )}
      </div>

        <label className="block text-sm">
          Feltöltés vagy csere
          <Input
            className="mt-2"
            type="file"
            accept={accept}
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </label>

      {selectedFileName ? (
        <p className="text-xs text-muted-foreground">Kijelölt fájl: {selectedFileName}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Alt
          <Input className="mt-2" value={alt} onChange={(event) => onAltChange(event.target.value)} />
        </label>
        <label className="block text-sm">
          Title
          <Input
            className="mt-2"
            value={mediaTitle}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm">
        Kategória
        <Select
          className="mt-2"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as MediaCategory)}
        >
          {MEDIA_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenOriginal}
          disabled={!originalUrl}
        >
          <Download className="size-4" />
          Original
        </Button>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          Thumb: {thumbnailUrl ? 'igen' : 'nem'}
        </span>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          Preview: {previewUrl ? 'igen' : 'nem'}
        </span>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          Large: {largeUrl ? 'igen' : 'nem'}
        </span>
      </div>

      {footer ?? null}
    </div>
  );
}
