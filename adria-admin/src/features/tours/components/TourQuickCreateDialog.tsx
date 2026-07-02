import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { slugifyTourText } from '../lib/tours.constants';
import type { SelectOption } from '../lib/tours.types';

export type TourQuickCreateKind =
  | 'region'
  | 'group'
  | 'offer-group'
  | 'fit'
  | 'program-type'
  | 'travel-mode'
  | 'difficulty'
  | 'departure-place'
  | 'country'
  | 'tag'
  | 'category';

export type TourQuickCreateValues = {
  name: string;
  code: string;
  countryCode: string;
  city: string;
  fee: string;
  active: boolean;
};

type TourQuickCreateDialogProps = {
  open: boolean;
  kind: TourQuickCreateKind | null;
  inputValue: string;
  title: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourQuickCreateValues) => Promise<SelectOption>;
};

const KIND_LABELS: Record<TourQuickCreateKind, string> = {
  region: 'Régió',
  group: 'Csoport',
  'offer-group': 'Ajánlat csoport',
  fit: 'FIT',
  'program-type': 'Program típus',
  'travel-mode': 'Közlekedés',
  difficulty: 'Nehézségi szint',
  'departure-place': 'Felszállási hely',
  country: 'Ország',
  tag: 'Címke',
  category: 'Kategória',
};

function codeLabelForKind(kind: TourQuickCreateKind) {
  switch (kind) {
    case 'region':
      return 'Slug / SEO név';
    case 'group':
    case 'offer-group':
    case 'fit':
    case 'program-type':
    case 'travel-mode':
    case 'difficulty':
    case 'country':
      return 'Kód / value';
    case 'tag':
    case 'category':
      return 'Slug / SEO név';
    case 'departure-place':
      return '';
  }
}

export function TourQuickCreateDialog({
  open,
  kind,
  inputValue,
  title,
  onOpenChange,
  onSubmit,
}: TourQuickCreateDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');
  const [fee, setFee] = useState('');
  const [active, setActive] = useState(true);
  const [codeTouched, setCodeTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportsCode = kind !== 'departure-place';
  const supportsCountryCode = kind === 'region';
  const supportsCity = kind === 'departure-place';
  const supportsFee = kind === 'departure-place';

  useEffect(() => {
    if (!open || !kind) {
      return;
    }

    setName(inputValue);
    setCode(slugifyTourText(inputValue));
    setCountryCode('');
    setCity(inputValue);
    setFee('');
    setActive(true);
    setCodeTouched(false);
    setError(null);
    setSubmitting(false);
  }, [inputValue, kind, open]);

  const kindLabel = useMemo(() => (kind ? KIND_LABELS[kind] : ''), [kind]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {kindLabel} létrehozása. Az új elem a mentés után automatikusan kiválasztódik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Név</label>
            <Input
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!codeTouched) {
                  setCode(slugifyTourText(nextName));
                }
              }}
              placeholder="Megjelenő név"
            />
          </div>

          {supportsCode ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{codeLabelForKind(kind!)}</label>
              <Input
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setCodeTouched(true);
                }}
                placeholder="auto-generált"
              />
            </div>
          ) : null}

          {supportsCountryCode ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Országkód</label>
              <Input
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                placeholder="hr"
              />
            </div>
          ) : null}

          {supportsCity ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Város</label>
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Budapest"
              />
            </div>
          ) : null}

          {supportsFee ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Díj</label>
              <Input
                value={fee}
                onChange={(event) => setFee(event.target.value)}
                placeholder="0"
              />
            </div>
          ) : null}

          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            Aktív
          </label>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Mégse
          </Button>
          <Button
            type="button"
            disabled={submitting || !name.trim()}
            onClick={async () => {
              try {
                setSubmitting(true);
                setError(null);

                await onSubmit({
                  name: name.trim(),
                  code: supportsCode ? code.trim() : '',
                  countryCode: countryCode.trim(),
                  city: city.trim(),
                  fee: fee.trim(),
                  active,
                });
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'Nem sikerült létrehozni az elemet.',
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Létrehozás...' : `Új ${kindLabel} létrehozása`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
