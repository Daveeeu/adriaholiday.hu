import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

import {
  createPortfolioFilterChip,
  deletePortfolioFilterChip,
  getPortfolioFilterChips,
  updatePortfolioFilterChip,
} from '../lib/portfolio-filter-chips.api';
import type {
  PortfolioFilterChip,
  PortfolioFilterChipUpsertInput,
} from '../lib/portfolio-filter-chips.types';

const queryKey = ['portfolio-filter-chips'];

type SelectOption = {
  id: string | number;
  value: string | number;
  label: string;
};

type PriceConfigState = {
  min: string;
  max: string;
};

const EMPTY_FORM: PortfolioFilterChipUpsertInput = {
  scopeType: 'global',
  scopeValue: null,
  label: '',
  slug: '',
  icon: 'tag',
  filterType: 'theme',
  filterValue: '',
  filterConfig: null,
  sortOrder: 0,
  active: true,
  hideWhenZero: false,
};

const ICON_OPTIONS = [
  { value: 'waves', label: 'Waves' },
  { value: 'building-2', label: 'Building' },
  { value: 'mountain', label: 'Tree / Nature' },
  { value: 'bus', label: 'Bus' },
  { value: 'plane', label: 'Plane' },
  { value: 'sparkles', label: 'Sun / Sparkles' },
  { value: 'tag', label: 'Tag' },
  { value: 'map', label: 'Map' },
  { value: 'compass', label: 'Compass' },
  { value: 'wallet', label: 'Wallet' },
] as const;

function getFormValues(chip?: PortfolioFilterChip): PortfolioFilterChipUpsertInput {
  if (!chip) {
    return EMPTY_FORM;
  }

  return {
    scopeType: chip.scopeType,
    scopeValue: chip.scopeValue,
    label: chip.label,
    slug: chip.slug,
    icon: chip.icon,
    filterType: chip.filterType,
    filterValue: chip.filterValue,
    filterConfig: chip.filterConfig,
    sortOrder: chip.sortOrder,
    active: chip.active,
    hideWhenZero: chip.hideWhenZero,
  };
}

function getPriceConfigState(config: Record<string, unknown> | null | undefined): PriceConfigState {
  return {
    min: typeof config?.min === 'number' || typeof config?.min === 'string' ? String(config.min) : '',
    max: typeof config?.max === 'number' || typeof config?.max === 'string' ? String(config.max) : '',
  };
}

function formatPriceConfig(config: Record<string, unknown> | null | undefined) {
  const min = typeof config?.min === 'number' || typeof config?.min === 'string' ? Number(config.min) : null;
  const max = typeof config?.max === 'number' || typeof config?.max === 'string' ? Number(config.max) : null;

  if (min !== null && max !== null) {
    return `Ár: ${min.toLocaleString('hu-HU')} - ${max.toLocaleString('hu-HU')} Ft`;
  }
  if (max !== null) {
    return `Ár: max. ${max.toLocaleString('hu-HU')} Ft`;
  }
  if (min !== null) {
    return `Ár: min. ${min.toLocaleString('hu-HU')} Ft`;
  }

  return 'Ár: —';
}

function translateFilterType(type: PortfolioFilterChip['filterType']) {
  switch (type) {
    case 'travel_mode':
      return 'Közlekedés';
    case 'tag':
      return 'Címke';
    case 'theme':
      return 'Téma';
    case 'category':
      return 'Kategória';
    case 'country':
      return 'Ország';
    case 'price':
      return 'Ár';
    default:
      return 'Custom';
  }
}

export function PortfolioFilterChipsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState<PortfolioFilterChip | undefined>();
  const [formValues, setFormValues] = useState<PortfolioFilterChipUpsertInput>(EMPTY_FORM);
  const [customConfigText, setCustomConfigText] = useState('{}');
  const [priceConfig, setPriceConfig] = useState<PriceConfigState>({ min: '', max: '' });

  const queryParams = useMemo(
    () => ({ page, perPage: 20, search, sortBy: 'sort_order', sortDirection: 'asc' as const }),
    [page, search],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getPortfolioFilterChips(queryParams),
    placeholderData: (previous) => previous,
  });

  const { data: travelModeOptions = [] } = useQuery({
    queryKey: ['portfolio-filter-chip-options', 'travel-modes'],
    queryFn: () => apiClient.get<SelectOption[]>('/api/admin/select-options/travel-modes'),
  });
  const { data: tagOptions = [] } = useQuery({
    queryKey: ['portfolio-filter-chip-options', 'blog-tags'],
    queryFn: () => apiClient.get<SelectOption[]>('/api/admin/select-options/blog-tags'),
  });
  const { data: countryOptions = [] } = useQuery({
    queryKey: ['portfolio-filter-chip-options', 'countries'],
    queryFn: () => apiClient.get<SelectOption[]>('/api/admin/select-options/countries'),
  });
  const { data: categoryOptions = [] } = useQuery({
    queryKey: ['portfolio-filter-chip-options', 'blog-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{
        items: Array<{ id: string | number; translations?: { hu?: { name?: string; seoName?: string } } }>;
      }>('/api/admin/blog/categories', { query: { page: 1, perPage: 1000 } });

      return response.items.map((item) => ({
        id: String(item.id),
        value: item.translations?.hu?.seoName || String(item.id),
        label: item.translations?.hu?.name || String(item.id),
      }));
    },
  });
  const { data: homepageOfferOptions = [] } = useQuery({
    queryKey: ['portfolio-filter-chip-options', 'homepage-offers'],
    queryFn: async () => {
      const response = await apiClient.get<{
        items: Array<{ id: string | number; translations?: { hu?: { name?: string; seoName?: string } } }>;
      }>('/api/admin/homepage-offers', { query: { page: 1, perPage: 1000 } });

      return response.items.map((item) => ({
        id: String(item.id),
        value: item.translations?.hu?.seoName || String(item.id),
        label: item.translations?.hu?.name || String(item.id),
      }));
    },
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (dialogOpen) {
      const nextValues = getFormValues(selectedChip);
      setFormValues(nextValues);
      setPriceConfig(getPriceConfigState(nextValues.filterConfig));
      setCustomConfigText(JSON.stringify(nextValues.filterConfig ?? {}, null, 2));
    }
  }, [dialogOpen, selectedChip]);

  const createMutation = useMutation({
    mutationFn: createPortfolioFilterChip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Filter chip létrehozva.');
      setDialogOpen(false);
      setSelectedChip(undefined);
    },
    onError: () => toast.error('Nem sikerült létrehozni a filter chipet.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: PortfolioFilterChipUpsertInput }) =>
      updatePortfolioFilterChip(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Filter chip módosítva.');
      setDialogOpen(false);
      setSelectedChip(undefined);
    },
    onError: () => toast.error('Nem sikerült módosítani a filter chipet.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioFilterChip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Filter chip törölve.');
      setDialogOpen(false);
      setSelectedChip(undefined);
    },
    onError: () => toast.error('Nem sikerült törölni a filter chipet.'),
  });

  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / (data?.perPage ?? 20)));
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const optionLabelMaps = useMemo(() => {
    const toMap = (items: Array<{ value: string | number; label: string }>) =>
      new Map(items.map((item) => [String(item.value), item.label]));

    return {
      travelMode: toMap(travelModeOptions),
      tag: toMap(tagOptions),
      country: toMap(countryOptions),
      categoryScope: toMap(categoryOptions),
      categoryFilter: new Map(categoryOptions.map((item) => [String(item.id), item.label])),
      homepageOffer: toMap(homepageOfferOptions),
    };
  }, [categoryOptions, countryOptions, homepageOfferOptions, tagOptions, travelModeOptions]);

  const scopeValueOptions = useMemo(() => {
    switch (formValues.scopeType) {
      case 'category':
        return categoryOptions;
      case 'homepage_offer':
        return homepageOfferOptions;
      default:
        return [];
    }
  }, [categoryOptions, formValues.scopeType, homepageOfferOptions]);

  const selectedFilterOptions = useMemo(() => {
    switch (formValues.filterType) {
      case 'travel_mode':
        return travelModeOptions;
      case 'tag':
      case 'theme':
        return tagOptions;
      case 'category':
        return categoryOptions.map((item) => ({ value: item.id, label: item.label }));
      case 'country':
        return countryOptions;
      default:
        return [];
    }
  }, [categoryOptions, countryOptions, formValues.filterType, tagOptions, travelModeOptions]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a portfólió filter chipeket.
      </div>
    );
  }

  const validate = () => {
    if (!formValues.label.trim()) {
      toast.error('A label megadása kötelező.');
      return false;
    }
    if (!formValues.slug.trim()) {
      toast.error('A slug megadása kötelező.');
      return false;
    }
    if (!formValues.scopeType) {
      toast.error('A scope típus megadása kötelező.');
      return false;
    }
    if (!formValues.filterType) {
      toast.error('A filter típus megadása kötelező.');
      return false;
    }
    if (formValues.scopeType !== 'global' && !formValues.scopeValue?.trim()) {
      toast.error('A scope érték megadása kötelező.');
      return false;
    }
    if (!['price', 'custom'].includes(formValues.filterType) && !formValues.filterValue?.trim()) {
      toast.error('A filter érték megadása kötelező.');
      return false;
    }
    if (formValues.filterType === 'price' && !priceConfig.min.trim() && !priceConfig.max.trim()) {
      toast.error('Ár típusnál minimum vagy maximum ár megadása kötelező.');
      return false;
    }

    return true;
  };

  const submit = () => {
    if (!validate()) {
      return;
    }

    let filterConfig: Record<string, unknown> | null = null;

    if (formValues.filterType === 'price') {
      filterConfig = {};
      if (priceConfig.min.trim()) {
        filterConfig.min = Number(priceConfig.min);
      }
      if (priceConfig.max.trim()) {
        filterConfig.max = Number(priceConfig.max);
      }
    } else if (formValues.filterType === 'custom') {
      try {
        const parsed = JSON.parse(customConfigText || '{}') as Record<string, unknown>;
        filterConfig = Object.keys(parsed).length > 0 ? parsed : null;
      } catch {
        toast.error('A custom filter config csak érvényes JSON lehet.');
        return;
      }
    }

    const payload: PortfolioFilterChipUpsertInput = {
      ...formValues,
      scopeValue:
        formValues.scopeType === 'global'
          ? null
          : formValues.scopeValue?.trim()
            ? formValues.scopeValue.trim()
            : null,
      icon: formValues.icon?.trim() ? formValues.icon.trim() : null,
      filterValue:
        formValues.filterType === 'price' || formValues.filterType === 'custom'
          ? formValues.filterValue?.trim() || null
          : formValues.filterValue?.trim()
            ? formValues.filterValue.trim()
            : null,
      filterConfig,
    };

    if (selectedChip) {
      updateMutation.mutate({ id: selectedChip.id, values: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const formatScope = (chip: PortfolioFilterChip) => {
    if (chip.scopeType === 'global') {
      return 'Globális';
    }
    if (chip.scopeType === 'category') {
      return `Kategória: ${optionLabelMaps.categoryScope.get(chip.scopeValue ?? '') ?? chip.scopeValue ?? '—'}`;
    }
    if (chip.scopeType === 'homepage_offer') {
      return `Főoldali ajánlat: ${optionLabelMaps.homepageOffer.get(chip.scopeValue ?? '') ?? chip.scopeValue ?? '—'}`;
    }

    return chip.scopeType;
  };

  const formatFilter = (chip: PortfolioFilterChip) => {
    switch (chip.filterType) {
      case 'travel_mode':
        return `Közlekedés: ${optionLabelMaps.travelMode.get(chip.filterValue ?? '') ?? chip.filterValue ?? '—'}`;
      case 'tag':
        return `Címke: ${optionLabelMaps.tag.get(chip.filterValue ?? '') ?? chip.filterValue ?? '—'}`;
      case 'theme':
        return `Téma: ${optionLabelMaps.tag.get(chip.filterValue ?? '') ?? chip.filterValue ?? '—'}`;
      case 'category':
        return `Kategória: ${optionLabelMaps.categoryFilter.get(chip.filterValue ?? '') ?? chip.filterValue ?? '—'}`;
      case 'country':
        return `Ország: ${optionLabelMaps.country.get(chip.filterValue ?? '') ?? chip.filterValue ?? '—'}`;
      case 'price':
        return formatPriceConfig(chip.filterConfig);
      default:
        return `Custom: ${chip.filterValue || '—'}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Portfólió</p>
        <h1 className="text-3xl font-semibold tracking-tight">Filter chipek</h1>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Kategória oldali filter chipek</h2>
            <p className="text-sm text-muted-foreground">{data.totalCount} találat.</p>
          </div>
          <Button
            onClick={() => {
              setSelectedChip(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Új filter chip
          </Button>
        </div>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés címke, slug vagy scope alapján..."
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Címke</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Filter</TableHead>
                <TableHead>Sorrend</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((chip) => (
                  <TableRow key={chip.id}>
                    <TableCell>{chip.id}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{chip.label}</div>
                        <div className="text-xs text-muted-foreground">/{chip.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatScope(chip)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{translateFilterType(chip.filterType)}</div>
                        <div className="text-xs text-muted-foreground">{formatFilter(chip)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{chip.sortOrder}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {chip.active ? 'Aktív' : 'Inaktív'} / {chip.hideWhenZero ? 'Rejt 0-nál' : 'Mutat 0-nál'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedChip(chip);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMutation.mutate(chip.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                    Nincs megjeleníthető filter chip.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-4 text-sm">
          <div className="text-muted-foreground">
            Találatok: <span className="font-medium text-foreground">{data.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
              Előző
            </Button>
            <span className="text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button variant="outline" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
              Következő
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedChip ? 'Filter chip szerkesztése' : 'Új filter chip'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Label">
              <Input value={formValues.label} onChange={(event) => setFormValues((current) => ({ ...current, label: event.target.value }))} />
            </Field>
            <Field label="Slug">
              <Input value={formValues.slug} onChange={(event) => setFormValues((current) => ({ ...current, slug: event.target.value }))} />
            </Field>
            <Field label="Ikon">
              <select
                value={formValues.icon ?? ''}
                onChange={(event) => setFormValues((current) => ({ ...current, icon: event.target.value }))}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sorrend">
              <Input type="number" value={formValues.sortOrder} onChange={(event) => setFormValues((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} />
            </Field>
            <Field label="Scope típus">
              <select
                value={formValues.scopeType}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    scopeType: event.target.value as PortfolioFilterChipUpsertInput['scopeType'],
                    scopeValue: event.target.value === 'global' ? null : '',
                  }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="global">Globális</option>
                <option value="category">Kategória</option>
                <option value="homepage_offer">Főoldali ajánlat</option>
              </select>
            </Field>
            <Field label="Scope érték">
              {formValues.scopeType === 'global' ? (
                <Input value="" disabled placeholder="Globális chipnél nincs scope érték" />
              ) : (
                <select
                  value={formValues.scopeValue ?? ''}
                  onChange={(event) => setFormValues((current) => ({ ...current, scopeValue: event.target.value }))}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Válassz...</option>
                  {scopeValueOptions.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Filter típus">
              <select
                value={formValues.filterType}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    filterType: event.target.value as PortfolioFilterChipUpsertInput['filterType'],
                    filterValue: '',
                  }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="tag">Címke</option>
                <option value="theme">Téma</option>
                <option value="travel_mode">Közlekedés</option>
                <option value="category">Kategória</option>
                <option value="country">Ország</option>
                <option value="price">Ár</option>
                <option value="custom">Custom</option>
              </select>
            </Field>
            <Field label="Filter érték">
              {['travel_mode', 'tag', 'theme', 'category', 'country'].includes(formValues.filterType) ? (
                <select
                  value={formValues.filterValue ?? ''}
                  onChange={(event) => setFormValues((current) => ({ ...current, filterValue: event.target.value }))}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Válassz...</option>
                  {selectedFilterOptions.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : formValues.filterType === 'price' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    value={priceConfig.min}
                    onChange={(event) => setPriceConfig((current) => ({ ...current, min: event.target.value }))}
                    placeholder="Minimum ár"
                  />
                  <Input
                    type="number"
                    value={priceConfig.max}
                    onChange={(event) => setPriceConfig((current) => ({ ...current, max: event.target.value }))}
                    placeholder="Maximum ár"
                  />
                </div>
              ) : (
                <Input
                  value={formValues.filterValue ?? ''}
                  onChange={(event) => setFormValues((current) => ({ ...current, filterValue: event.target.value }))}
                  placeholder="Custom érték"
                />
              )}
            </Field>
          </div>

          {formValues.filterType === 'custom' ? (
            <Field label="Custom config JSON">
              <div className="space-y-2">
                <p className="text-xs text-amber-600">Haladó beállítás. Csak fejlesztői használatra.</p>
                <Textarea
                  rows={8}
                  value={customConfigText}
                  onChange={(event) => setCustomConfigText(event.target.value)}
                />
              </div>
            </Field>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={formValues.active}
                onChange={(event) => setFormValues((current) => ({ ...current, active: event.target.checked }))}
              />
              Aktív
            </label>
            <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={formValues.hideWhenZero}
                onChange={(event) => setFormValues((current) => ({ ...current, hideWhenZero: event.target.checked }))}
              />
              Elrejtés 0 találatnál
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Mégse
            </Button>
            <Button onClick={submit} disabled={isSubmitting}>
              Mentés
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
