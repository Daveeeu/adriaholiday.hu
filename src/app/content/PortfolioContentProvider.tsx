import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router';

import {
  deletePortfolioContentMedia,
  fetchPortfolioContent,
  publishAllPortfolioContent,
  publishPortfolioContentBlock,
  uploadPortfolioContentMedia,
  updatePortfolioContentBlock,
} from './portfolio-content-api';
import type {
  AdminPortfolioContentBlock,
  PortfolioContentFieldType,
  PortfolioContentMode,
  PortfolioContentValue,
  PortfolioEditorSelection,
  PortfolioMedia,
  PublicPortfolioContentBlock,
} from './portfolio-content.types';
import {
  PortfolioInlineEditorPanel,
  PortfolioInlineEditorToolbar,
} from './PortfolioInlineEditor';

type EditableField = {
  key: string;
  label?: string;
  type: PortfolioContentFieldType;
  publishedValue: PortfolioContentValue;
  draftValue: PortfolioContentValue;
  publishedMedia?: PortfolioMedia | null;
  draftMedia?: PortfolioMedia | null;
  hasDraft: boolean;
  section?: string | null;
};

type PortfolioContentContextValue = {
  page: string;
  isEditorRequested: boolean;
  isEditorEnabled: boolean;
  isLoading: boolean;
  contentError: string | null;
  blocks: Record<string, PublicPortfolioContentBlock | AdminPortfolioContentBlock>;
  selectedEditor: PortfolioEditorSelection | null;
  openFieldEditor: (fieldKey: string) => void;
  openButtonEditor: (labelKey: string, urlKey: string) => void;
  closeFieldEditor: () => void;
  refreshContent: () => Promise<void>;
  updateFieldDraft: (
    fieldKey: string,
    value: PortfolioContentValue,
    type: PortfolioContentFieldType,
  ) => Promise<AdminPortfolioContentBlock | null>;
  publishField: (fieldKey: string) => Promise<AdminPortfolioContentBlock | null>;
  publishAll: () => Promise<void>;
  uploadFieldMedia: (
    fieldKey: string,
    file: File,
    metadata?: { alt?: string; title?: string },
  ) => Promise<AdminPortfolioContentBlock | null>;
  deleteFieldMedia: (fieldKey: string) => Promise<AdminPortfolioContentBlock | null>;
  getValue: <T extends PortfolioContentValue>(fieldKey: string, fallback: T) => T;
  getDraftValue: <T extends PortfolioContentValue>(fieldKey: string, fallback: T) => T;
  getField: (fieldKey: string) => EditableField | null;
};

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null);

function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of ['admin_api_token', 'access_token', 'token']) {
    const token = window.localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
}

function normalizePage(pathname: string) {
  if (pathname === '/' || pathname === '/utazasok' || pathname === '/portfolio') {
    return 'home';
  }

  return pathname.replace(/^\/+/, '').split('/')[0] || 'home';
}

function isAdminBlock(
  block: PublicPortfolioContentBlock | AdminPortfolioContentBlock,
): block is AdminPortfolioContentBlock {
  return 'publishedValue' in block;
}

function getBlockValue(
  block: PublicPortfolioContentBlock | AdminPortfolioContentBlock,
  published = true,
) {
  if (isAdminBlock(block)) {
    return published ? block.publishedValue : block.draftValue;
  }

  return block.value;
}

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const page = useMemo(() => normalizePage(location.pathname), [location.pathname]);
  const isEditorRequested = new URLSearchParams(location.search).get('editor') === '1';
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<
    Record<string, PublicPortfolioContentBlock | AdminPortfolioContentBlock>
  >({});
  const [selectedEditor, setSelectedEditor] = useState<PortfolioEditorSelection | null>(null);

  const loadContent = useCallback(
    async (forcedMode?: PortfolioContentMode) => {
      setIsLoading(true);

      const requestedMode: PortfolioContentMode =
        forcedMode ?? (isEditorRequested && getStoredAuthToken() ? 'editor' : 'public');

      try {
        const response = await fetchPortfolioContent(page, requestedMode);

        setBlocks(response as Record<string, PublicPortfolioContentBlock | AdminPortfolioContentBlock>);
        setIsEditorEnabled(requestedMode === 'editor');
        setContentError(null);
      } catch {
        if (requestedMode === 'editor') {
          try {
            const fallbackResponse = await fetchPortfolioContent(page, 'public');
            setBlocks(fallbackResponse as Record<string, PublicPortfolioContentBlock>);
            setIsEditorEnabled(false);
            setContentError(
              'A szerkesztői tartalom nem töltött be, a publikus fallback látszik.',
            );
          } catch {
            setBlocks({});
            setIsEditorEnabled(false);
            setContentError('Nem sikerült betölteni a portfolio tartalmat.');
          }
        } else {
          setBlocks({});
          setIsEditorEnabled(false);
          setContentError('Nem sikerült betölteni a portfolio tartalmat.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isEditorRequested, page],
  );

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (!isEditorEnabled) {
      setSelectedEditor(null);
    }
  }, [isEditorEnabled]);

  const commitBlock = useCallback(
    (block: AdminPortfolioContentBlock) => {
      setBlocks((current) => ({
        ...current,
        [block.key]: block,
      }));
    },
    [],
  );

  const openFieldEditor = useCallback((fieldKey: string) => {
    if (!isEditorEnabled) {
      return;
    }

    setSelectedEditor({ kind: 'field', fieldKey });
  }, [isEditorEnabled]);

  const openButtonEditor = useCallback((labelKey: string, urlKey: string) => {
    if (!isEditorEnabled) {
      return;
    }

    setSelectedEditor({ kind: 'button', labelKey, urlKey });
  }, [isEditorEnabled]);

  const closeFieldEditor = useCallback(() => {
    setSelectedEditor(null);
  }, []);

  const refreshContent = useCallback(async () => {
    await loadContent(isEditorEnabled ? 'editor' : 'public');
  }, [isEditorEnabled, loadContent]);

  const updateFieldDraft = useCallback(
    async (
      fieldKey: string,
      value: PortfolioContentValue,
      type: PortfolioContentFieldType,
    ) => {
      const response = await updatePortfolioContentBlock(fieldKey, value, type);
      commitBlock(response);
      return response;
    },
    [commitBlock],
  );

  const publishField = useCallback(
    async (fieldKey: string) => {
      const response = await publishPortfolioContentBlock(fieldKey);
      commitBlock(response);
      return response;
    },
    [commitBlock],
  );

  const publishAll = useCallback(async () => {
    await publishAllPortfolioContent(page);
    await refreshContent();
  }, [page, refreshContent]);

  const uploadFieldMedia = useCallback(
    async (fieldKey: string, file: File, metadata?: { alt?: string; title?: string }) => {
      const response = await uploadPortfolioContentMedia(fieldKey, file, metadata);
      commitBlock(response);
      return response;
    },
    [commitBlock],
  );

  const deleteFieldMedia = useCallback(
    async (fieldKey: string) => {
      const response = await deletePortfolioContentMedia(fieldKey);
      commitBlock(response);
      return response;
    },
    [commitBlock],
  );

  const value = useMemo<PortfolioContentContextValue>(
    () => ({
      page,
      isEditorRequested,
      isEditorEnabled,
      isLoading,
      contentError,
      blocks,
      selectedEditor,
      openFieldEditor,
      openButtonEditor,
      closeFieldEditor,
      refreshContent,
      updateFieldDraft,
      publishField,
      publishAll,
      uploadFieldMedia,
      deleteFieldMedia,
      getValue: <T extends PortfolioContentValue,>(fieldKey: string, fallback: T): T => {
        const block = blocks[fieldKey];
        if (!block) {
          return fallback;
        }

        const value = isEditorEnabled ? getBlockValue(block, false) : getBlockValue(block, true);
        return (value ?? fallback) as T;
      },
      getDraftValue: <T extends PortfolioContentValue,>(fieldKey: string, fallback: T): T => {
        const block = blocks[fieldKey];
        if (!block) {
          return fallback;
        }

        const value = getBlockValue(block, false);
        return (value ?? fallback) as T;
      },
      getField: (fieldKey: string) => {
        const block = blocks[fieldKey];
        if (!block || !isAdminBlock(block)) {
          return null;
        }

        return {
          key: block.key,
          label: block.label,
          type: block.type as PortfolioContentFieldType,
          publishedValue: block.publishedValue,
          draftValue: block.draftValue,
          publishedMedia: block.publishedMedia ?? null,
          draftMedia: block.draftMedia ?? null,
          hasDraft: block.hasDraft,
          section: block.section,
        };
      },
    }),
    [
      blocks,
      closeFieldEditor,
      contentError,
      deleteFieldMedia,
      isEditorEnabled,
      isEditorRequested,
      isLoading,
      openButtonEditor,
      openFieldEditor,
      page,
      publishAll,
      publishField,
      refreshContent,
      selectedEditor,
      updateFieldDraft,
      uploadFieldMedia,
    ],
  );

  return (
    <PortfolioContentContext.Provider value={value}>
      {children}
      <PortfolioInlineEditorToolbar />
      <PortfolioInlineEditorPanel selectedEditor={selectedEditor} />
    </PortfolioContentContext.Provider>
  );
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext);

  if (!context) {
    throw new Error('usePortfolioContent must be used within PortfolioContentProvider');
  }

  return context;
}
