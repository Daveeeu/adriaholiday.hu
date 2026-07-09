import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/page-loader';
import { cn } from '@/lib/utils';

import { DataTable, type DataTableColumn } from './data-table';
import { ModuleToolbar } from './module-toolbar';
import { SidePanel } from './side-panel';
import type {
  CrudListQuery,
  CrudListResponse,
  CrudSortDirection,
} from '../lib/bookings.types';

type PanelMode = 'create' | 'edit' | 'detail';

type PanelRenderContext<T, D> = {
  mode: PanelMode;
  record: T | null;
  isDetailLoading: boolean;
  draft: D;
  setDraft: Dispatch<SetStateAction<D>>;
  isSaving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type CrudModulePageProps<T, D, Q extends CrudListQuery = CrudListQuery> = {
  eyebrow: string;
  title: string;
  description: string;
  toolbarTitle: string;
  toolbarDescription: string;
  searchPlaceholder: string;
  createLabel: string;
  emptyText: string;
  queryKey: readonly unknown[];
  listQuery: (query: Q) => Promise<CrudListResponse<T>>;
  buildQuery: (state: {
    page: number;
    perPage: number;
    search: string;
    sortBy: string;
    sortDirection: CrudSortDirection;
  }) => Q;
  getId: (item: T) => string;
  columns: Array<DataTableColumn<T>>;
  createDraft: (record?: T | null) => D;
  detailQuery?: (id: string) => Promise<T | null>;
  createRecord: (values: D) => Promise<T>;
  updateRecord: (id: string, values: D) => Promise<T>;
  deleteRecord: (id: string) => Promise<void>;
  panelTitle: (mode: PanelMode, record: T | null) => string;
  panelDescription: (mode: PanelMode, record: T | null) => string;
  renderPanel: (context: PanelRenderContext<T, D>) => ReactNode;
  topContent?: ReactNode;
  extraToolbarControls?: ReactNode;
  initialSortBy?: string;
  initialSortDirection?: CrudSortDirection;
  initialPageSize?: number;
  onRowSelect?: (record: T) => void;
  className?: string;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

export function CrudModulePage<T, D, Q extends CrudListQuery = CrudListQuery>({
  eyebrow,
  title,
  description,
  toolbarTitle,
  toolbarDescription,
  searchPlaceholder,
  createLabel,
  emptyText,
  queryKey,
  listQuery,
  buildQuery,
  getId,
  columns,
  createDraft,
  detailQuery,
  createRecord,
  updateRecord,
  deleteRecord,
  panelTitle,
  panelDescription,
  renderPanel,
  topContent,
  extraToolbarControls,
  initialSortBy = 'createdAt',
  initialSortDirection = 'desc',
  initialPageSize = 10,
  onRowSelect,
  className,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: CrudModulePageProps<T, D, Q>) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] =
    useState<CrudSortDirection>(initialSortDirection);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPageSize);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('detail');
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<D>(createDraft());

  const query = useMemo(
    () =>
      buildQuery({
        page,
        perPage,
        search,
        sortBy,
        sortDirection,
      }),
    [buildQuery, page, perPage, search, sortBy, sortDirection],
  );

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listError,
  } = useQuery({
    queryKey: [...queryKey, query],
    queryFn: () => listQuery(query),
    placeholderData: (previous) => previous,
  });

  const selectedRecordQuery = useQuery({
    queryKey: [...queryKey, 'detail', selectedId],
    queryFn: () => detailQuery?.(selectedId ?? '') ?? Promise.resolve(null),
    enabled: Boolean(selectedId && detailQuery && panelOpen),
  });

  const selectedRecord =
    panelOpen && panelMode !== 'create'
      ? selectedRecordQuery.data ??
        (selectedId
          ? listData?.items.find((item) => getId(item) === selectedId) ?? null
          : null)
      : null;

  const createMutation = useMutation({
    mutationFn: createRecord,
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
      setPanelMode('create');
      setPanelOpen(false);
      setDraft(createDraft(record));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: D }) =>
      updateRecord(id, values),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
      setPanelMode('create');
      setPanelOpen(false);
      setDraft(createDraft(record));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
      setPanelMode('create');
      setPanelOpen(false);
      setDraft(createDraft(null));
    },
  });

  function handleCreate() {
    setSelectedId(null);
    setPanelMode('create');
    setPanelOpen(true);
    setDraft(createDraft(null));
  }

  function handleClose() {
    setPanelOpen(false);
    setSelectedId(null);
    setPanelMode('create');
    setDraft(createDraft(null));
  }

  function handleCancel() {
    handleClose();
  }

  function handleView(record: T) {
    const id = getId(record);
    setSelectedId(id);
    setPanelMode('detail');
    setPanelOpen(true);
    setDraft(createDraft(record));
    onRowSelect?.(record);
  }

  function handleEdit(record: T) {
    const id = getId(record);
    setSelectedId(id);
    setPanelMode('edit');
    setPanelOpen(true);
    setDraft(createDraft(record));
    onRowSelect?.(record);
  }

  function handleDelete(record: T) {
    if (!window.confirm('Biztosan törlöd ezt a rekordot?')) {
      return;
    }

    deleteMutation.mutate(getId(record));
  }

  function submit() {
    if (panelMode === 'edit' && selectedId) {
      updateMutation.mutate({ id: selectedId, values: draft });
      return;
    }

    createMutation.mutate(draft);
  }

  if (listLoading && !listData) {
    return <PageLoader />;
  }

  if (listError) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        A foglalási adatok nem tölthetők be.
      </div>
    );
  }

  const selectedRecordTitle = panelTitle(panelMode, selectedRecord);
  const selectedRecordDescription = panelDescription(panelMode, selectedRecord);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>

      {topContent}

      <ModuleToolbar
        title={toolbarTitle}
        description={toolbarDescription}
        search={search}
        placeholder={searchPlaceholder}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={canCreate ? handleCreate : undefined}
        createLabel={createLabel}
        onReset={() => {
          setSearch('');
          setSortBy(initialSortBy);
          setSortDirection(initialSortDirection);
          setPage(1);
        }}
        extraControls={extraToolbarControls}
      />

      <div className="space-y-4">
        <div className="space-y-4">
          <DataTable
            title={toolbarTitle}
            description={toolbarDescription}
            columns={columns}
            items={listData?.items ?? []}
            totalCount={listData?.totalCount ?? 0}
            page={page}
            perPage={perPage}
            sortBy={sortBy}
            sortDirection={sortDirection}
            emptyText={emptyText}
            isLoading={listFetching}
            onSortChange={(key) => {
              if (sortBy === key) {
                setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                setPage(1);
                return;
              }

              setSortBy(key);
              setSortDirection('asc');
              setPage(1);
            }}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
            renderActions={(record) => (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleView(record)}
                >
                  <ArrowLeftRight className="size-4" />
                </Button>
                {canUpdate ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(record)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(record)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            )}
          />
        </div>

        <SidePanel
          open={panelOpen}
          eyebrow={eyebrow}
          title={selectedRecordTitle}
          description={selectedRecordDescription}
          onClose={handleClose}
          footer={
            <div className="flex flex-wrap items-center gap-2">
              {panelMode === 'detail' && selectedRecord ? (
                <>
                  {canUpdate ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEdit(selectedRecord)}
                    >
                      <Pencil className="size-4" />
                      Szerkesztés
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDelete(selectedRecord)}
                    >
                      <Trash2 className="size-4" />
                      Törlés
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Mégse
                  </Button>
                  {(panelMode === 'edit' ? canUpdate : canCreate) ? (
                    <Button
                      type="button"
                      onClick={submit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {panelMode === 'edit' ? 'Mentés' : 'Létrehozás'}
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          }
        >
          {renderPanel({
            mode: panelMode,
            record: selectedRecord,
            isDetailLoading: Boolean(detailQuery) && selectedRecordQuery.isLoading,
            draft,
            setDraft,
            isSaving: createMutation.isPending || updateMutation.isPending,
            onSubmit: submit,
            onCancel: handleCancel,
            onEdit: () => (selectedRecord ? handleEdit(selectedRecord) : undefined),
            onDelete: selectedRecord ? () => handleDelete(selectedRecord) : () => undefined,
          })}
        </SidePanel>
      </div>
    </div>
  );
}
