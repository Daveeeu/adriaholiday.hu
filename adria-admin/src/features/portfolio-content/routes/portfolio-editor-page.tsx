import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilLine, ExternalLink, Upload, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type MediaCategory } from '@/components/media/media.constants';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

import { MediaPickerField } from '../components/MediaPickerField';
import {
  deletePortfolioContentMedia,
  getPortfolioContent,
  publishAllPortfolioContent,
  publishPortfolioContentBlock,
  uploadPortfolioContentMedia,
  updatePortfolioContentBlock,
} from '../lib/portfolio-content.api';
import type { PortfolioContentBlock } from '../lib/portfolio-content.types';

const PORTFOLIO_PAGE = 'home';

type HeadingVariant = 'default' | 'gradient' | 'muted' | 'accent';

type HeadingPartDraft = {
  text: string;
  variant: HeadingVariant;
};

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return '';
  }
}

function defaultHeadingPart(text: string, variant: HeadingVariant = 'default'): HeadingPartDraft {
  return { text, variant };
}

function headingPayload(parts: HeadingPartDraft[]) {
  return {
    titleParts: parts.map((part) => ({
      text: part.text,
      variant: part.variant,
    })),
  };
}

function isTitlePartsBlock(block?: PortfolioContentBlock | null): boolean {
  return !!block && block.key.endsWith('.titleParts');
}

function readHeadingParts(value: unknown, fallback: HeadingPartDraft[]): HeadingPartDraft[] {
  if (!value) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item || typeof item !== 'object') {
        return defaultHeadingPart(String(item ?? ''));
      }

      const part = item as { text?: string; variant?: HeadingVariant };
      return defaultHeadingPart(part.text ?? '', part.variant ?? 'default');
    });
  }

  if (typeof value === 'object') {
    const parts = (value as { titleParts?: unknown[]; parts?: unknown[] }).titleParts
      ?? (value as { titleParts?: unknown[]; parts?: unknown[] }).parts;
    if (Array.isArray(parts)) {
      return readHeadingParts(parts, fallback);
    }
  }

  return fallback;
}

const HERO_KEYS = [
  'home.hero.accent',
  'home.hero.titleParts',
  'home.hero.subtitle',
  'home.hero.image',
  'home.hero.video',
  'home.hero.cta.primary.label',
  'home.hero.cta.primary.url',
  'home.hero.cta.secondary.label',
  'home.hero.cta.secondary.url',
  'home.hero.stats',
  'home.hero.badges',
] as const;

type HeroDraftState = {
  accent: string;
  titleParts: HeadingPartDraft[];
  subtitle: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  stats: string;
  badges: string;
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function HeroSectionEditor({ blocks }: { blocks: Record<string, PortfolioContentBlock> }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<HeroDraftState>(() => {
    const accent = blocks['home.hero.accent'];
    const titleParts = blocks['home.hero.titleParts'];
    const subtitle = blocks['home.hero.subtitle'];
    const primaryLabel = blocks['home.hero.cta.primary.label'];
    const primaryUrl = blocks['home.hero.cta.primary.url'];
    const secondaryLabel = blocks['home.hero.cta.secondary.label'];
    const secondaryUrl = blocks['home.hero.cta.secondary.url'];
    const stats = blocks['home.hero.stats'];
    const badges = blocks['home.hero.badges'];

    return {
      accent: readString(accent?.draftValue ?? accent?.publishedValue ?? 'Az élmény vár rád'),
      titleParts: readHeadingParts(
        titleParts?.draftValue ?? titleParts?.publishedValue ?? null,
        [
          { text: 'Buszos utak,' , variant: 'default' },
          { text: 'amikre', variant: 'default' },
          { text: 'emlékezni fogsz', variant: 'gradient' },
        ],
      ),
      subtitle: readString(
        subtitle?.draftValue ?? subtitle?.publishedValue ?? 'Tengerparti utak, városlátogatások és körutazások tapasztalt szervezéssel, kényelmes buszokkal.',
      ),
      primaryLabel: readString(primaryLabel?.draftValue ?? primaryLabel?.publishedValue ?? 'Utazások keresése'),
      primaryUrl: readString(primaryUrl?.draftValue ?? primaryUrl?.publishedValue ?? '/utazasok'),
      secondaryLabel: readString(secondaryLabel?.draftValue ?? secondaryLabel?.publishedValue ?? 'Last Minute ajánlatok'),
      secondaryUrl: readString(secondaryUrl?.draftValue ?? secondaryUrl?.publishedValue ?? '/utazasok'),
      stats: safeStringify(stats?.draftValue ?? stats?.publishedValue ?? [
        { value: '10 000+', label: 'elégedett utas' },
        { value: '15+', label: 'év tapasztalat' },
        { value: '4.9/5', label: 'értékelés' },
        { value: '100%', label: 'kényelmes utazás' },
      ]),
      badges: safeStringify(badges?.draftValue ?? badges?.publishedValue ?? [
        { icon: 'users', text: 'Már csak 4 hely!' },
        { icon: 'eye', text: '12 ember nézi most' },
      ]),
    };
  });

  const saveHero = useMutation({
    mutationFn: async () => {
      await Promise.all([
        updatePortfolioContentBlock('home.hero.accent', { draftValue: draft.accent }),
        updatePortfolioContentBlock('home.hero.titleParts', { draftValueJson: headingPayload(draft.titleParts) }),
        updatePortfolioContentBlock('home.hero.subtitle', { draftValue: draft.subtitle }),
        updatePortfolioContentBlock('home.hero.cta.primary.label', { draftValue: draft.primaryLabel }),
        updatePortfolioContentBlock('home.hero.cta.primary.url', { draftValue: draft.primaryUrl }),
        updatePortfolioContentBlock('home.hero.cta.secondary.label', { draftValue: draft.secondaryLabel }),
        updatePortfolioContentBlock('home.hero.cta.secondary.url', { draftValue: draft.secondaryUrl }),
        updatePortfolioContentBlock('home.hero.stats', { draftValueJson: JSON.parse(draft.stats || '[]') }),
        updatePortfolioContentBlock('home.hero.badges', { draftValueJson: JSON.parse(draft.badges || '[]') }),
      ]);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
      toast.success('Hero draft mentve.');
    },
    onError: () => {
      toast.error('Nem sikerült menteni a hero blokkot.');
    },
  });

  const publishHero = useMutation({
    mutationFn: async () => {
      await Promise.all(HERO_KEYS.map((key) => publishPortfolioContentBlock(key)));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
      toast.success('Hero publikálva.');
    },
    onError: () => {
      toast.error('Nem sikerült publikálni a hero blokkot.');
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hero szekció</h2>
          <p className="text-sm text-muted-foreground">
            A teljes hero tartalom külön editorban.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              void saveHero.mutateAsync();
            }}
          >
            <Save className="size-4" />
            Mentés draftként
          </Button>
          <Button
            onClick={() => {
              void publishHero.mutateAsync();
            }}
          >
            <Upload className="size-4" />
            Hero publikálása
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput label="Hero alcím" value={draft.accent} onChange={(value) => setDraft((current) => ({ ...current, accent: value }))} />
            <HeadingPartsEditor
              label="Hero főcím részek"
              value={draft.titleParts}
              onChange={(value) => setDraft((current) => ({ ...current, titleParts: value }))}
              className="md:col-span-2"
            />
            <FieldTextarea label="Hero alcím / leírás" value={draft.subtitle} onChange={(value) => setDraft((current) => ({ ...current, subtitle: value }))} className="md:col-span-2" />
            <FieldInput label="Elsődleges CTA szöveg" value={draft.primaryLabel} onChange={(value) => setDraft((current) => ({ ...current, primaryLabel: value }))} />
            <FieldInput label="Elsődleges CTA link" value={draft.primaryUrl} onChange={(value) => setDraft((current) => ({ ...current, primaryUrl: value }))} />
            <FieldInput label="Másodlagos CTA szöveg" value={draft.secondaryLabel} onChange={(value) => setDraft((current) => ({ ...current, secondaryLabel: value }))} />
            <FieldInput label="Másodlagos CTA link" value={draft.secondaryUrl} onChange={(value) => setDraft((current) => ({ ...current, secondaryUrl: value }))} />
          </div>

          <FieldTextarea
            label="Hero statisztikák"
            value={draft.stats}
            onChange={(value) => setDraft((current) => ({ ...current, stats: value }))}
            helper="JSON tömb, a jelenlegi statisztika kártyákhoz."
            className="min-h-56"
          />

          <FieldTextarea
            label="Hero badge-ek"
            value={draft.badges}
            onChange={(value) => setDraft((current) => ({ ...current, badges: value }))}
            helper="JSON tömb, a lebegő badge-ekhez."
            className="min-h-56"
          />
        </div>

        <div className="space-y-4">
          <HeroMediaEditor
            key={blocks['home.hero.image']?.updatedAt ?? 'hero-image'}
            block={blocks['home.hero.image']}
            title="Hero háttérkép"
            accept="image/*"
            previewMode="image"
            onRefresh={async () => {
              await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
            }}
          />
          <HeroMediaEditor
            key={blocks['home.hero.video']?.updatedAt ?? 'hero-video'}
            block={blocks['home.hero.video']}
            title="Hero videó"
            accept="video/*"
            previewMode="video"
            onRefresh={async () => {
              await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
            }}
          />
        </div>
      </div>
    </Card>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <Input
        className="mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  helper,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
      </div>
      <Textarea
        className="mt-2 min-h-32 font-mono text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function HeadingPartsEditor({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: HeadingPartDraft[];
  onChange: (value: HeadingPartDraft[]) => void;
  className?: string;
}) {
  return (
    <div className={`block text-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">Text | Típus</span>
      </div>

      <div className="mt-2 space-y-3 rounded-2xl border border-border bg-background p-4">
        {value.map((part, index) => (
          <div key={`${part.text}-${index}`} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <Input
              value={part.text}
              placeholder="Szöveg"
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...part, text: event.target.value };
                onChange(next);
              }}
            />

            <select
              value={part.variant}
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...part, variant: event.target.value as HeadingVariant };
                onChange(next);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="default">default</option>
              <option value="gradient">gradient</option>
              <option value="muted">muted</option>
              <option value="accent">accent</option>
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const next = value.filter((_, rowIndex) => rowIndex !== index);
                onChange(next.length > 0 ? next : [defaultHeadingPart('')]);
              }}
            >
              Törlés
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...value, defaultHeadingPart('')])}
        >
          + Új sor
        </Button>
      </div>
    </div>
  );
}

function HeroMediaEditor({
  block,
  title,
  accept,
  previewMode,
  onRefresh,
}: {
  block?: PortfolioContentBlock;
  title: string;
  accept: string;
  previewMode: 'image' | 'video';
  onRefresh: () => Promise<void>;
}) {
  const [draftAlt, setDraftAlt] = useState(() => {
    const source = (block?.draftValue ?? block?.publishedValue ?? {}) as { alt?: string } | null;
    return source?.alt ?? '';
  });
  const [draftTitle, setDraftTitle] = useState(() => {
    const source = (block?.draftValue ?? block?.publishedValue ?? {}) as { title?: string } | null;
    return source?.title ?? '';
  });
  const [draftCategory, setDraftCategory] = useState<MediaCategory>('portfolio');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!block) {
        return;
      }

      if (selectedFile) {
        await uploadPortfolioContentMedia(block.key, selectedFile, {
          alt: draftAlt || undefined,
          title: draftTitle || undefined,
          category: draftCategory,
          sourceContext: 'portfolio_content',
        });
        return;
      }

      await updatePortfolioContentBlock(block.key, {
        draftValueJson: {
          alt: draftAlt || null,
          title: draftTitle || null,
        },
      });
    },
    onSuccess: async () => {
      await onRefresh();
      toast.success('Média mentve.');
    },
    onError: () => {
      toast.error('Nem sikerült menteni a médiát.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!block) {
        return;
      }

      await deletePortfolioContentMedia(block.key);
    },
    onSuccess: async () => {
      await onRefresh();
      toast.success('Média törölve.');
    },
    onError: () => {
      toast.error('Nem sikerült törölni a médiát.');
    },
  });

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{block?.key ?? 'Nincs blokk'}</p>
        </div>
        {block ? (
          <span className={`rounded-full px-2 py-1 text-xs ${block.hasDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {block.hasDraft ? 'Draft van' : 'Publikált'}
          </span>
        ) : null}
      </div>

      <MediaPickerField
        title={title}
        media={(block?.draftValue ?? block?.publishedValue ?? null) as {
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
        } | null}
        accept={accept}
        previewMode={previewMode}
        alt={draftAlt}
        mediaTitle={draftTitle}
        category={draftCategory}
        onCategoryChange={setDraftCategory}
        onAltChange={setDraftAlt}
        onTitleChange={setDraftTitle}
        onFileChange={setSelectedFile}
        onDelete={() => {
          void deleteMutation.mutateAsync();
        }}
        onOpenOriginal={() => {
          const preview = (block?.draftValue ?? block?.publishedValue ?? null) as { url?: string } | null;
          if (preview?.url) {
            window.open(preview.url, '_blank', 'noopener,noreferrer');
          }
        }}
        selectedFileName={selectedFile?.name ?? null}
      />

      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => {
            void saveMutation.mutateAsync();
          }}
          disabled={!block}
        >
          <Save className="size-4" />
          Mentés
        </Button>
      </div>
    </Card>
  );
}

export function PortfolioEditorPage() {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftJson, setDraftJson] = useState('');
  const [draftHeadingParts, setDraftHeadingParts] = useState<HeadingPartDraft[]>([
    { text: '', variant: 'default' },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-content', PORTFOLIO_PAGE],
    queryFn: () => getPortfolioContent(PORTFOLIO_PAGE),
  });

  const blocks = useMemo(() => Object.values(data ?? {}), [data]);
  const selectedBlock = selectedKey ? data?.[selectedKey] : null;
  const heroEditorKey = useMemo(() => {
    const keys = [
      data?.['home.hero.accent']?.updatedAt,
      data?.['home.hero.titleParts']?.updatedAt,
      data?.['home.hero.subtitle']?.updatedAt,
      data?.['home.hero.image']?.updatedAt,
      data?.['home.hero.video']?.updatedAt,
      data?.['home.hero.cta.primary.label']?.updatedAt,
      data?.['home.hero.cta.primary.url']?.updatedAt,
      data?.['home.hero.cta.secondary.label']?.updatedAt,
      data?.['home.hero.cta.secondary.url']?.updatedAt,
      data?.['home.hero.stats']?.updatedAt,
      data?.['home.hero.badges']?.updatedAt,
    ];

    return keys.filter(Boolean).join('|');
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, block }: { key: string; block: PortfolioContentBlock }) =>
      updatePortfolioContentBlock(key, isTitlePartsBlock(block)
        ? { draftValueJson: headingPayload(draftHeadingParts) }
        : {
            draftValue:
              block.type === 'text' || block.type === 'textarea' || block.type === 'richtext' || block.type === 'url'
                ? draftText
                : undefined,
            draftValueJson:
              block.type === 'image' || block.type === 'button' || block.type === 'list' || block.type === 'json'
                ? JSON.parse(draftJson || 'null')
                : undefined,
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
      toast.success('Piszkozat mentve.');
      setSelectedKey(null);
    },
    onError: () => {
      toast.error('Nem sikerült menteni a piszkozatot.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishPortfolioContentBlock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
      toast.success('Blokk publikálva.');
    },
    onError: () => {
      toast.error('Nem sikerült publikálni a blokkot.');
    },
  });

  const publishAllMutation = useMutation({
    mutationFn: () => publishAllPortfolioContent(PORTFOLIO_PAGE),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-content', PORTFOLIO_PAGE] });
      toast.success('Az összes draft publikálva.');
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Portfólió szerkesztése
            </h1>
            <p className="text-sm text-muted-foreground">
              A home oldal inline szerkesztésének alapjai.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/portfolio?editor=1', '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="size-4" />
              Portfólió megnyitása szerkesztői módban
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void publishAllMutation.mutateAsync();
              }}
            >
              <Upload className="size-4" />
              Összes publikálása
            </Button>
          </div>
        </div>
      </Card>

      <HeroSectionEditor key={heroEditorKey} blocks={data ?? {}} />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-6">Betöltés...</Card>
          ) : (
            blocks.map((block) => (
              <Card key={block.key} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{block.label}</h2>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {block.type}
                      </span>
                      {block.hasDraft ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                          Draft van
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                          Publikált
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{block.key}</p>
                    <p className="text-sm text-muted-foreground">
                      Published: {safeStringify(block.publishedValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Draft: {safeStringify(block.draftValue)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedKey(block.key);
                        if (isTitlePartsBlock(block)) {
                          setDraftHeadingParts(
                            readHeadingParts(block.draftValue ?? block.publishedValue, [
                              { text: 'Közös naplementék.', variant: 'default' },
                              { text: 'Új élmények.', variant: 'gradient' },
                              { text: 'Emlékek egy életre.', variant: 'default' },
                            ]),
                          );
                          setDraftText('');
                          setDraftJson('');
                        } else {
                          setDraftText(
                            typeof block.draftValue === 'string'
                              ? block.draftValue
                              : typeof block.publishedValue === 'string'
                                ? block.publishedValue
                                : '',
                          );
                          setDraftJson(
                            block.type === 'image' || block.type === 'button' || block.type === 'list' || block.type === 'json'
                              ? safeStringify(block.draftValue ?? block.publishedValue)
                              : '',
                          );
                        }
                      }}
                    >
                      <PencilLine className="size-4" />
                      Szerkesztés
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void publishMutation.mutateAsync(block.key);
                      }}
                    >
                      Publikálás
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="sticky top-6 h-fit p-5">
          <div className="flex items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="font-semibold">Editor panel</h2>
              <p className="text-sm text-muted-foreground">
                {selectedBlock?.label ?? 'Válassz egy blokkot'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedKey(null)}>
              <X className="size-4" />
            </Button>
          </div>

          {selectedBlock ? (
            <div className="space-y-4 pt-4">
              <div className="rounded-xl bg-muted p-3 text-xs">
                <p><strong>Key:</strong> {selectedBlock.key}</p>
                <p><strong>Típus:</strong> {selectedBlock.type}</p>
              </div>

              {isTitlePartsBlock(selectedBlock) ? (
                <HeadingPartsEditor
                  label="Főcím részek"
                  value={draftHeadingParts}
                  onChange={setDraftHeadingParts}
                />
              ) : selectedBlock.type === 'image' || selectedBlock.type === 'button' || selectedBlock.type === 'list' || selectedBlock.type === 'json' ? (
                <Textarea
                  value={draftJson}
                  onChange={(event) => setDraftJson(event.target.value)}
                  className="min-h-[320px] font-mono text-xs"
                />
              ) : selectedBlock.type === 'richtext' ? (
                <RichTextEditor
                  value={draftText}
                  onChange={setDraftText}
                  minHeight={320}
                  allowPreview
                  placeholder={selectedBlock.label}
                />
              ) : (
                <Input
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                />
              )}

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => {
                    void saveMutation.mutateAsync({ key: selectedBlock.key, block: selectedBlock });
                  }}
                >
                  <Save className="size-4" />
                  Mentés draftként
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    void publishMutation.mutateAsync(selectedBlock.key);
                  }}
                >
                  Publikálás
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-sm text-muted-foreground">
              Nincs kiválasztott blokk.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
