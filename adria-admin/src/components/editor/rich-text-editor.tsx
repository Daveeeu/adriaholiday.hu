import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-text-style/color';
import { BackgroundColor } from '@tiptap/extension-text-style/background-color';
import { FontFamily } from '@tiptap/extension-text-style/font-family';
import { FontSize } from '@tiptap/extension-text-style/font-size';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Quote,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { normalizeRichTextInput, richTextBlockClassName, sanitizeRichTextHtml } from '@/lib/rich-text';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  disabled?: boolean;
  error?: string | null;
  allowPreview?: boolean;
  allowedControls?: RichTextControl[];
  className?: string;
};

const DEFAULT_CONTROLS: RichTextControl[] = [
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

const FONT_FAMILIES = [
  { label: 'Alapértelmezett', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_SIZES = [
  { label: 'Alapértelmezett', value: '' },
  { label: '12 px', value: '12px' },
  { label: '14 px', value: '14px' },
  { label: '16 px', value: '16px' },
  { label: '18 px', value: '18px' },
  { label: '20 px', value: '20px' },
  { label: '24 px', value: '24px' },
];

function ToolbarButton({
  active,
  children,
  onClick,
  title,
  disabled,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      className="h-8 px-2.5"
      title={title}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ControlGroup({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 240,
  disabled = false,
  error = null,
  allowPreview = true,
  allowedControls,
  className = '',
}: RichTextEditorProps) {
  const controls = useMemo(
    () => new Set<RichTextControl>(allowedControls ?? DEFAULT_CONTROLS),
    [allowedControls],
  );
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        underline: false,
      }),
      TextStyle,
      Color.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      BackgroundColor.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      FontFamily.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      FontSize.configure({ types: ['textStyle', 'heading', 'paragraph'] }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Tartalom',
      }),
    ],
    content: normalizeRichTextInput(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap focus:outline-none',
          richTextBlockClassName(
            cn(
              'rounded-xl border bg-background px-3 py-2',
              disabled ? 'cursor-not-allowed opacity-70' : '',
            ),
          ),
        ),
        style: `min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalized = normalizeRichTextInput(value);

    if (normalized !== editor.getHTML()) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!allowPreview) {
    return (
      <div className={cn('space-y-2', className)}>
        {editor ? <RichTextToolbar editor={editor} controls={controls} disabled={disabled} /> : null}
        {editor ? <EditorContent editor={editor} /> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Tabs value={mode} onValueChange={(next) => setMode(next as 'edit' | 'preview')}>
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="edit">Szerkesztés</TabsTrigger>
            <TabsTrigger value="preview">Előnézet</TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground">
            HTML mentés, sanitizált előnézet
          </div>
        </div>

        <TabsContent value="edit" className="space-y-2">
          {editor ? <RichTextToolbar editor={editor} controls={controls} disabled={disabled} /> : null}
          {editor ? <EditorContent editor={editor} /> : null}
        </TabsContent>

        <TabsContent value="preview">
          <RichTextPreview value={value} />
        </TabsContent>
      </Tabs>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function RichTextPreview({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        richTextBlockClassName('rounded-xl border bg-muted/20 px-3 py-2 text-sm'),
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(value) || '<p>—</p>' }}
    />
  );
}

function RichTextToolbar({
  editor,
  controls,
  disabled,
}: {
  editor: Editor;
  controls: Set<RichTextControl>;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-2">
      <ControlGroup>
        {controls.has('undo') ? (
          <ToolbarButton
            title="Visszavonás"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('redo') ? (
          <ToolbarButton
            title="Újra"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('bold') ? (
          <ToolbarButton
            title="Félkövér"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            <Bold className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('italic') ? (
          <ToolbarButton
            title="Dőlt"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            <Italic className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('underline') ? (
          <ToolbarButton
            title="Aláhúzott"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('strike') ? (
          <ToolbarButton
            title="Áthúzott"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={disabled}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('paragraph') ? (
          <ToolbarButton
            title="Bekezdés"
            active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            disabled={disabled}
          >
            <Type className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('heading') ? (
          <>
            <ToolbarButton
              title="Címsor 2"
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={disabled}
            >
              <Heading2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Címsor 3"
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={disabled}
            >
              <Heading3 className="size-4" />
            </ToolbarButton>
          </>
        ) : null}
        {controls.has('blockquote') ? (
          <ToolbarButton
            title="Idézet"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
          >
            <Quote className="size-4" />
          </ToolbarButton>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('bulletList') ? (
          <ToolbarButton
            title="Felsorolás"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          >
            <List className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('orderedList') ? (
          <ToolbarButton
            title="Számozott lista"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('link') ? (
          <ToolbarButton
            title="Link"
            active={editor.isActive('link')}
            onClick={() => {
              const current = editor.getAttributes('link').href as string | undefined;
              const next = window.prompt('Link megadása', current ?? 'https://');

              if (next === null) {
                return;
              }

              const trimmed = next.trim();

              if (trimmed === '') {
                editor.chain().focus().unsetLink().run();
                return;
              }

              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: trimmed })
                .run();
            }}
            disabled={disabled}
          >
            <Link2 className="size-4" />
          </ToolbarButton>
        ) : null}
        {controls.has('color') ? (
          <label className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1 text-xs">
            <Palette className="size-4" />
            <input
              type="color"
              defaultValue="#111827"
              disabled={disabled}
              className="size-6 cursor-pointer rounded border border-border bg-transparent p-0"
              onChange={(event) => {
                if (disabled) {
                  return;
                }

                editor.chain().focus().setColor(event.target.value).run();
              }}
            />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled}
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              reset
            </button>
          </label>
        ) : null}
        {controls.has('backgroundColor') ? (
          <label className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1 text-xs">
            <Highlighter className="size-4" />
            <input
              type="color"
              defaultValue="#fef08a"
              disabled={disabled}
              className="size-6 cursor-pointer rounded border border-border bg-transparent p-0"
              onChange={(event) => {
                if (disabled) {
                  return;
                }

                editor.chain().focus().setBackgroundColor(event.target.value).run();
              }}
            />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled}
              onClick={() => editor.chain().focus().unsetBackgroundColor().run()}
            >
              reset
            </button>
          </label>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('fontFamily') ? (
          <label className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1 text-xs">
            <ChevronDown className="size-4" />
            <select
              className="h-8 bg-transparent text-xs outline-none"
              defaultValue=""
              disabled={disabled}
              onChange={(event) => {
                if (disabled) {
                  return;
                }

                if (event.target.value === '') {
                  editor.chain().focus().unsetFontFamily().run();
                  return;
                }

                editor.chain().focus().setFontFamily(event.target.value).run();
              }}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {controls.has('fontSize') ? (
          <label className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1 text-xs">
            <ChevronDown className="size-4" />
            <select
              className="h-8 bg-transparent text-xs outline-none"
              defaultValue=""
              disabled={disabled}
              onChange={(event) => {
                if (disabled) {
                  return;
                }

                if (event.target.value === '') {
                  editor.chain().focus().unsetFontSize().run();
                  return;
                }

                editor.chain().focus().setFontSize(event.target.value).run();
              }}
            >
              {FONT_SIZES.map((fontSize) => (
                <option key={fontSize.label} value={fontSize.value}>
                  {fontSize.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </ControlGroup>

      <ControlGroup>
        {controls.has('textAlign') ? (
          <>
            <ToolbarButton
              title="Balra zárás"
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={disabled}
            >
              <AlignLeft className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Középre zárás"
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={disabled}
            >
              <AlignCenter className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Jobbra zárás"
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={disabled}
            >
              <AlignRight className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Sorkizárt"
              active={editor.isActive({ textAlign: 'justify' })}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              disabled={disabled}
            >
              <AlignJustify className="size-4" />
            </ToolbarButton>
          </>
        ) : null}
      </ControlGroup>
    </div>
  );
}
