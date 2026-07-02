import { Download, ImageIcon, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '../components/ui/input';

import type { PortfolioMedia } from './portfolio-content.types';

type PortfolioMediaPickerProps = {
  title: string;
  media: PortfolioMedia | null;
  accept: string;
  previewMode: 'image' | 'video';
  alt: string;
  mediaTitle: string;
  onAltChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onDelete: () => void;
  onOpenOriginal?: () => void;
  selectedFileName?: string | null;
  isSaving?: boolean;
};

export function PortfolioMediaPicker({
  title,
  media,
  accept,
  previewMode,
  alt,
  mediaTitle,
  onAltChange,
  onTitleChange,
  onFileChange,
  onDelete,
  onOpenOriginal,
  selectedFileName,
  isSaving = false,
}: PortfolioMediaPickerProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const previewUrl = useMemo(
    () => media?.sizes?.preview ?? media?.thumbnailUrl ?? media?.url ?? '',
    [media],
  );
  const originalUrl = media?.sizes?.original ?? media?.url ?? '';
  const thumbnailUrl = media?.sizes?.thumbnail ?? media?.thumbnailUrl ?? media?.url ?? '';
  const largeUrl = media?.sizes?.large ?? media?.url ?? '';

  return (
    <div
      className={`rounded-3xl border border-dashed p-4 transition-colors ${isDragActive ? 'border-cyan-300 bg-cyan-300/10' : 'border-border bg-muted/20'}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        if (file) {
          onFileChange(file);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">Drag & drop, csere, törlés és preview.</p>
        </div>
        {media ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            onClick={onDelete}
            disabled={isSaving}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Törlés
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-background">
        {previewUrl ? (
          previewMode === 'video' ? (
            <video src={previewUrl} className="h-56 w-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={previewUrl} alt={alt || title} className="h-56 w-full object-cover" />
          )
        ) : (
          <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Nincs feltöltött média
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          Feltöltés vagy csere
          <Input
            type="file"
            accept={accept}
            className="mt-2"
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
            }}
          />
        </label>
        {selectedFileName ? (
          <p className="text-xs text-muted-foreground md:col-span-2">
            Kijelölt fájl: {selectedFileName}
          </p>
        ) : null}

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

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
          Méretek
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs"
          onClick={onOpenOriginal}
          disabled={!originalUrl}
        >
          <Download className="h-3.5 w-3.5" />
          Original
        </button>
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
    </div>
  );
}
