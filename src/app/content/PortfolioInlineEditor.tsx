import { Save, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { PortfolioMediaPicker } from './PortfolioMediaPicker';
import type { PortfolioEditorSelection } from './portfolio-content.types';
import { usePortfolioContent } from './PortfolioContentProvider';

function displayValue(value: unknown) {
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return typeof value === 'string' ? value : '';
}

export function PortfolioInlineEditorToolbar() {
  const {
    isEditorEnabled,
    contentError,
    publishAll,
  } = usePortfolioContent();

  if (!isEditorEnabled) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-[80] -translate-x-1/2 rounded-full border border-white/20 bg-[#071426]/90 px-4 py-3 text-white shadow-[0_16px_50px_rgba(7,20,38,0.32)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          Szerkesztői mód
        </span>
        {contentError ? (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
            {contentError}
          </span>
        ) : null}
        <button
          type="button"
          className="rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-4 py-2 text-sm font-semibold"
          onClick={() => {
            void publishAll();
          }}
        >
          Publikálás
        </button>
        <button
          type="button"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80"
          onClick={() => {
            exitEditorMode();
          }}
        >
          Kilépés
        </button>
      </div>
    </div>
  );
}

function exitEditorMode() {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('editor');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export function PortfolioInlineEditorPanel({
  selectedEditor,
}: {
  selectedEditor: PortfolioEditorSelection | null;
}) {
  const {
    isEditorEnabled,
    closeFieldEditor,
    getField,
    updateFieldDraft,
    publishField,
    uploadFieldMedia,
    deleteFieldMedia,
  } = usePortfolioContent();
  const [draftText, setDraftText] = useState('');
  const [draftJsonText, setDraftJsonText] = useState('');
  const [draftButtonLabel, setDraftButtonLabel] = useState('');
  const [draftButtonUrl, setDraftButtonUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const field = useMemo(() => {
    if (!selectedEditor) {
      return null;
    }

    if (selectedEditor.kind === 'field') {
      return getField(selectedEditor.fieldKey);
    }

    return getField(selectedEditor.labelKey);
  }, [getField, selectedEditor]);

  const urlField = useMemo(() => {
    if (!selectedEditor || selectedEditor.kind !== 'button') {
      return null;
    }

    return getField(selectedEditor.urlKey);
  }, [getField, selectedEditor]);

  const isMediaField = field?.type === 'image' || field?.type === 'video';

  useEffect(() => {
    if (!selectedEditor || !field) {
      setDraftText('');
      setDraftJsonText('');
      setDraftButtonLabel('');
      setDraftButtonUrl('');
      setMediaAlt('');
      setMediaTitle('');
      setSelectedFile(null);
      return;
    }

    if (selectedEditor.kind === 'button') {
      setDraftButtonLabel(displayValue(field.draftValue ?? field.publishedValue));
      setDraftButtonUrl(displayValue(urlField?.draftValue ?? urlField?.publishedValue));
      setSelectedFile(null);
      return;
    }

    if (isMediaField) {
      const mediaValue = (field.draftValue ?? field.publishedValue ?? {}) as {
        alt?: string;
        title?: string;
      };
      setMediaAlt(mediaValue.alt ?? '');
      setMediaTitle(mediaValue.title ?? '');
      setSelectedFile(null);
      return;
    }

    if (field.type === 'button' || field.type === 'list' || field.type === 'json') {
      setDraftJsonText(
        JSON.stringify(field.draftValue ?? field.publishedValue ?? null, null, 2),
      );
    } else {
      setDraftText(displayValue(field.draftValue ?? field.publishedValue ?? ''));
    }
  }, [field, isMediaField, selectedEditor, urlField]);

  if (!isEditorEnabled || !selectedEditor || !field) {
    return null;
  }

  const panelTitle =
    selectedEditor.kind === 'button'
      ? 'Gomb szerkesztése'
      : field.type === 'image'
        ? 'Kép szerkesztése'
        : field.type === 'video'
          ? 'Videó szerkesztése'
          : field.type === 'richtext'
            ? 'Rich text szerkesztése'
            : field.type === 'url'
              ? 'Link szerkesztése'
              : 'Szöveg szerkesztése';

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (selectedEditor.kind === 'button') {
        await Promise.all([
          updateFieldDraft(selectedEditor.labelKey, draftButtonLabel, 'text'),
          updateFieldDraft(selectedEditor.urlKey, draftButtonUrl, 'url'),
        ]);
        return;
      }

      if (isMediaField) {
        if (selectedFile) {
          await uploadFieldMedia(field.key, selectedFile, {
            alt: mediaAlt || undefined,
            title: mediaTitle || undefined,
          });
          setSelectedFile(null);
        } else {
          await updateFieldDraft(
            field.key,
            {
              alt: mediaAlt || null,
              title: mediaTitle || null,
            },
            field.type,
          );
        }
        return;
      }

      if (field.type === 'button' || field.type === 'list' || field.type === 'json') {
        const parsed = JSON.parse(draftJsonText || 'null');
        await updateFieldDraft(field.key, parsed, field.type);
        return;
      }

      await updateFieldDraft(field.key, draftText, field.type);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (selectedEditor.kind === 'button') {
        await Promise.all([
          publishField(selectedEditor.labelKey),
          publishField(selectedEditor.urlKey),
        ]);
        return;
      }

      await publishField(field.key);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] cursor-default bg-black/10 backdrop-blur-[1px]"
        aria-label="Szerkesztő panel bezárása"
        onClick={closeFieldEditor}
      />
      <aside className="fixed right-0 top-0 z-[80] h-full w-full max-w-[min(100vw,980px)] border-l border-white/10 bg-[#071426] text-white shadow-[0_24px_80px_rgba(7,20,38,0.45)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">
              Inline editor
            </div>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{panelTitle}</h3>
                <p className="mt-1 text-sm text-white/55">{field.label}</p>
                <p className="mt-1 text-xs text-white/35">{field.key}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 p-2 text-white/75"
                onClick={closeFieldEditor}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {selectedEditor.kind === 'button' ? (
              <div className="space-y-4">
                <label className="block text-sm">
                  Gomb szöveg
                  <Input
                    className="mt-2 border-white/10 bg-white/5 text-white"
                    value={draftButtonLabel}
                    onChange={(event) => setDraftButtonLabel(event.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  Gomb link
                  <Input
                    className="mt-2 border-white/10 bg-white/5 text-white"
                    value={draftButtonUrl}
                    onChange={(event) => setDraftButtonUrl(event.target.value)}
                  />
                </label>
              </div>
            ) : isMediaField ? (
              <PortfolioMediaPicker
                title={field.label}
                media={(field.draftMedia ?? field.publishedMedia) as
                  | {
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
                    }
                  | null}
                accept={field.type === 'video' ? 'video/*' : 'image/*'}
                previewMode={field.type === 'video' ? 'video' : 'image'}
                alt={mediaAlt}
                mediaTitle={mediaTitle}
                onAltChange={setMediaAlt}
                onTitleChange={setMediaTitle}
                onFileChange={setSelectedFile}
                onDelete={() => {
                  void deleteFieldMedia(field.key);
                  setSelectedFile(null);
                }}
                onOpenOriginal={() => {
                  const media = (field.draftMedia ?? field.publishedMedia) as { url?: string } | null;
                  if (media?.url) {
                    window.open(media.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                selectedFileName={selectedFile?.name ?? null}
                isSaving={isSaving}
              />
            ) : field.type === 'button' || field.type === 'list' || field.type === 'json' ? (
              <label className="block text-sm">
                JSON
                <Textarea
                  className="mt-2 min-h-[420px] border-white/10 bg-white/5 font-mono text-sm text-white"
                  value={draftJsonText}
                  onChange={(event) => setDraftJsonText(event.target.value)}
                />
              </label>
            ) : field.type === 'richtext' ? (
              <label className="block text-sm">
                Rich text
                <Textarea
                  className="mt-2 min-h-[320px] border-white/10 bg-white/5 text-white"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                />
              </label>
            ) : (
              <label className="block text-sm">
                {field.type === 'url' ? 'Link' : 'Szöveg'}
                <Input
                  className="mt-2 border-white/10 bg-white/5 text-white"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                />
              </label>
            )}
          </div>

          <div className="border-t border-white/10 px-6 py-5">
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => {
                  void handleSave();
                }}
                disabled={isSaving}
              >
                <Save className="mr-2 inline-flex h-4 w-4" />
                Mentés draftként
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/85 disabled:opacity-60"
                onClick={() => {
                  void handlePublish();
                }}
                disabled={isSaving}
              >
                <Upload className="mr-2 inline-flex h-4 w-4" />
                Publikálás
              </button>
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60"
              onClick={closeFieldEditor}
            >
              Mégse
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
