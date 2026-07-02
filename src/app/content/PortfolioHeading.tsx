import type { CSSProperties, ElementType } from 'react';

import { EditableFrame } from './EditableFields';
import { usePortfolioContent } from './PortfolioContentProvider';

export type PortfolioHeadingVariant = 'default' | 'gradient' | 'muted' | 'accent';

export type PortfolioHeadingPart = {
  text: string;
  variant?: PortfolioHeadingVariant;
};

export type PortfolioHeadingMode = 'inline' | 'multiline';

type PortfolioHeadingValue =
  | string
  | {
      titleParts?: PortfolioHeadingPart[];
      parts?: PortfolioHeadingPart[];
    }
  | PortfolioHeadingPart[]
  | null
  | undefined;

function normalizeHeadingPart(part: PortfolioHeadingPart): PortfolioHeadingPart {
  return {
    text: String(part.text ?? ''),
    variant: part.variant ?? 'default',
  };
}

function extractParts(value: PortfolioHeadingValue, fallbackParts: PortfolioHeadingPart[]) {
  if (typeof value === 'string') {
    return [normalizeHeadingPart({ text: value })];
  }

  if (Array.isArray(value)) {
    return value.map(normalizeHeadingPart).filter((part) => part.text.trim().length > 0);
  }

  if (value && typeof value === 'object') {
    const parts = value.titleParts ?? value.parts;
    if (Array.isArray(parts)) {
      return parts.map(normalizeHeadingPart).filter((part) => part.text.trim().length > 0);
    }
  }

  return fallbackParts.map(normalizeHeadingPart);
}

function variantClassName(variant: PortfolioHeadingVariant) {
  switch (variant) {
    case 'gradient':
      return 'bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent';
    case 'muted':
      return 'text-gray-500';
    case 'accent':
      return 'text-[#00c389]';
    default:
      return 'text-inherit';
  }
}

export function PortfolioHeading({
  parts,
  as: Component = 'h2',
  className = '',
  style,
  partClassName = '',
  mode = 'inline',
}: {
  parts: PortfolioHeadingPart[];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  partClassName?: string;
  mode?: PortfolioHeadingMode;
}) {
  return (
    <Component className={className} style={style}>
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={`${mode === 'multiline' ? 'block' : 'inline'} ${variantClassName(part.variant ?? 'default')} ${partClassName}`}
        >
          {part.text}
          {mode === 'inline' && index < parts.length - 1 ? ' ' : null}
        </span>
      ))}
    </Component>
  );
}

export function EditablePortfolioHeading({
  fieldKey,
  fallbackParts,
  as,
  className = '',
  style,
  partClassName = '',
  mode = 'inline',
  label,
}: {
  fieldKey: string;
  fallbackParts: PortfolioHeadingPart[];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  partClassName?: string;
  mode?: PortfolioHeadingMode;
  label?: string;
}) {
  const { getValue } = usePortfolioContent();
  const value = getValue(fieldKey, { titleParts: fallbackParts }) as PortfolioHeadingValue;
  const parts = extractParts(value, fallbackParts);

  return <EditableFrame target={{ kind: 'field', fieldKey }} label={label}>
    <PortfolioHeading
      parts={parts}
      as={as}
      className={className}
      style={style}
      partClassName={partClassName}
      mode={mode}
    />
  </EditableFrame>;
}

export function headingPart(text: string, variant: PortfolioHeadingVariant = 'default'): PortfolioHeadingPart {
  return { text, variant };
}

export function headingValue(parts: PortfolioHeadingPart[]): { titleParts: PortfolioHeadingPart[] } {
  return { titleParts: parts.map(normalizeHeadingPart) };
}

export function headingText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((part) => (part && typeof part === 'object' ? String((part as { text?: string }).text ?? '') : '')).join(' ');
  }

  return '';
}
