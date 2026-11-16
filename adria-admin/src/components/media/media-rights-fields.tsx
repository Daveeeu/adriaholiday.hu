import { ShieldCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { MediaRights } from '@/services/media-service';

/**
 * Who made a media file and on what terms the site may use it. Filled from
 * the photo's own metadata on upload where it has any; the office completes it.
 */
export function MediaRightsFields({
  value,
  onChange,
  disabled = false,
}: {
  value: MediaRights;
  onChange: (value: MediaRights) => void;
  disabled?: boolean;
}) {
  const set = (field: keyof MediaRights) => (next: string) => onChange({ ...value, [field]: next });
  const isEmpty = Object.values(value).every((item) => item.trim() === '');

  return (
    <div className="space-y-4 rounded-2xl border bg-muted/10 p-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4" />
          Felhasználási jog
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {isEmpty
            ? 'Ehhez a fájlhoz még nincs rögzítve, kitől származik és milyen jogon használjuk.'
            : 'A feltöltött kép saját adataiból töltöttük ki, ahol volt ilyen; javítható és kiegészíthető.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Szerző / fotós
          <Input
            className="mt-2"
            value={value.author}
            maxLength={255}
            disabled={disabled}
            onChange={(event) => set('author')(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          Copyright
          <Input
            className="mt-2"
            value={value.copyright}
            maxLength={255}
            disabled={disabled}
            placeholder="pl. © 2026 Kovács Péter"
            onChange={(event) => set('copyright')(event.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm">
        Forrás
        <Input
          className="mt-2"
          value={value.origin}
          maxLength={255}
          disabled={disabled}
          placeholder="pl. saját fotó, Shutterstock #123456, partner szálloda"
          onChange={(event) => set('origin')(event.target.value)}
        />
      </label>

      <label className="block text-sm">
        Licenc / felhasználási feltételek
        <Textarea
          className="mt-2 min-h-20"
          value={value.license}
          maxLength={2000}
          disabled={disabled}
          placeholder="pl. Standard licenc, weboldalon és nyomtatásban korlátlan ideig"
          onChange={(event) => set('license')(event.target.value)}
        />
      </label>
    </div>
  );
}
