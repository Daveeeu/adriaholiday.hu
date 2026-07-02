import { PencilLine } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import type { CSSProperties, ElementType, ReactNode } from 'react';

import { usePortfolioContent } from './PortfolioContentProvider';
import type {
  PortfolioContentFieldType,
  PortfolioContentValue,
} from './portfolio-content.types';

type EditableTarget =
  | { kind: 'field'; fieldKey: string }
  | { kind: 'button'; labelKey: string; urlKey: string };

export function EditableFrame({
  target,
  children,
  className = '',
  label,
}: {
  target: EditableTarget;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const { isEditorEnabled, openFieldEditor, openButtonEditor } = usePortfolioContent();

  const openEditor = () => {
    if (target.kind === 'button') {
      openButtonEditor(target.labelKey, target.urlKey);
      return;
    }

    openFieldEditor(target.fieldKey);
  };

  return (
    <div
      className={`group relative ${isEditorEnabled ? 'cursor-pointer' : ''} ${className}`}
      onClickCapture={(event) => {
        if (!isEditorEnabled) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        openEditor();
      }}
      onKeyDown={(event) => {
        if (!isEditorEnabled) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEditor();
        }
      }}
      role={isEditorEnabled ? 'button' : undefined}
      tabIndex={isEditorEnabled ? 0 : undefined}
      aria-label={isEditorEnabled ? label ?? 'Szerkeszthető elem' : undefined}
    >
      {children}
      {isEditorEnabled ? (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent transition-all duration-200 group-hover:border-cyan-300/75 group-focus-visible:border-cyan-300/90 group-hover:bg-cyan-300/6 group-focus-visible:bg-cyan-300/6">
          <div className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-[#071426]/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <PencilLine className="h-3.5 w-3.5" />
            Gyors szerkesztés
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EditableText({
  fieldKey,
  fallback,
  as: Component = 'span',
  className = '',
  style,
}: {
  fieldKey: string;
  fallback: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const { getValue } = usePortfolioContent();
  const value = String(getValue(fieldKey, fallback) ?? fallback);

  return (
    <EditableFrame target={{ kind: 'field', fieldKey }} className={className}>
      <Component style={{ whiteSpace: 'pre-line', ...style }}>{value}</Component>
    </EditableFrame>
  );
}

export function EditableRichText({
  fieldKey,
  fallback,
  className = '',
}: {
  fieldKey: string;
  fallback: string;
  className?: string;
}) {
  const { getValue } = usePortfolioContent();
  const value = String(getValue(fieldKey, fallback) ?? fallback);

  return (
    <EditableFrame target={{ kind: 'field', fieldKey }} className={className}>
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </EditableFrame>
  );
}

export function EditableImage({
  fieldKey,
  fallback,
  className = '',
  imgClassName = '',
}: {
  fieldKey: string;
  fallback: { url: string; alt: string; title?: string };
  className?: string;
  imgClassName?: string;
}) {
  return (
    <EditableMedia
      fieldKey={fieldKey}
      fallback={fallback}
      kind="image"
      className={className}
      mediaClassName={imgClassName}
    />
  );
}

export function EditableMedia({
  fieldKey,
  fallback,
  kind,
  className = '',
  mediaClassName = '',
}: {
  fieldKey: string;
  fallback: { url: string; alt?: string; title?: string; mimeType?: string | null };
  kind?: 'image' | 'video';
  className?: string;
  mediaClassName?: string;
}) {
  const { getValue } = usePortfolioContent();
  const value = getValue(fieldKey, fallback) as {
    url?: string;
    alt?: string;
    title?: string;
    mimeType?: string | null;
  };
  const media = {
    url: value?.url ?? fallback.url,
    alt: value?.alt ?? fallback.alt ?? '',
    title: value?.title ?? fallback.title,
    mimeType: value?.mimeType ?? fallback.mimeType ?? null,
  };
  const isVideo = kind === 'video' || String(media.mimeType ?? '').startsWith('video/');

  return (
    <EditableFrame target={{ kind: 'field', fieldKey }} className={className}>
      {isVideo ? (
        <video
          src={media.url}
          aria-label={media.title ?? media.alt ?? 'Hero videó'}
          className={mediaClassName}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img src={media.url} alt={media.alt} title={media.title} className={mediaClassName} />
      )}
    </EditableFrame>
  );
}

export function EditableButton({
  fieldKey,
  labelKey,
  fallback,
  hrefFallback,
  className = '',
  children,
  onClick,
}: {
  fieldKey: string;
  labelKey: string;
  fallback: string;
  hrefFallback?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const { getValue } = usePortfolioContent();
  const label = String(getValue(labelKey, fallback) ?? fallback);
  const href = hrefFallback ? String(getValue(fieldKey, hrefFallback) ?? hrefFallback) : undefined;
  const isInternalLink = !!href && (href.startsWith('/') || href.startsWith('#'));

  return (
    <EditableFrame
      target={{ kind: 'button', labelKey, urlKey: fieldKey }}
      className={className}
      label={label}
    >
      {href ? (
        isInternalLink ? (
          <Link to={href} onClick={onClick}>
            {children ?? label}
          </Link>
        ) : (
          <a href={href} onClick={onClick}>
            {children ?? label}
          </a>
        )
      ) : (
        <button type="button" onClick={onClick}>
          {children ?? label}
        </button>
      )}
    </EditableFrame>
  );
}

export function EditableList<T>({
  fieldKey,
  fallback,
  renderItem,
  className = '',
}: {
  fieldKey: string;
  fallback: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const { getValue } = usePortfolioContent();
  const items = useMemo(() => {
    const value = getValue(fieldKey, fallback);
    return Array.isArray(value) ? (value as T[]) : fallback;
  }, [fallback, fieldKey, getValue]);

  return (
    <EditableFrame target={{ kind: 'field', fieldKey }} className={className}>
      <>
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </>
    </EditableFrame>
  );
}

export function useEditableContent<T extends PortfolioContentValue>(
  fieldKey: string,
  fallback: T,
  type: PortfolioContentFieldType = 'text',
) {
  const { getValue, getDraftValue } = usePortfolioContent();

  return {
    value: getValue(fieldKey, fallback),
    draftValue: getDraftValue(fieldKey, fallback),
    type,
  };
}
