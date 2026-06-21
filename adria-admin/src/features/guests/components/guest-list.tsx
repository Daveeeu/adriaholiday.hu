import { Mail, MapPin, Phone } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { t } from '@/i18n';
import { Separator } from '@/components/ui/separator';
import type { Guest } from '@/types/domain';

type GuestListProps = {
  guests: Guest[];
};

export function GuestList({ guests }: GuestListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('guests.list.title')}</CardTitle>
        <CardDescription>{t('guests.list.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guests.map((guest, index) => (
          <div key={guest.id}>
            <div className="flex flex-col gap-4 rounded-2xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback>
                    {guest.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{guest.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Kedvelt szállás: {guest.preferredProperty}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground sm:text-right">
                <p className="inline-flex items-center gap-2 sm:justify-end">
                  <Mail className="size-4" />
                  {guest.email}
                </p>
                <p className="inline-flex items-center gap-2 sm:justify-end">
                  <Phone className="size-4" />
                  {guest.phone}
                </p>
                <p className="inline-flex items-center gap-2 sm:justify-end">
                  <MapPin className="size-4" />
                  {guest.country}
                </p>
              </div>
            </div>
            {index < guests.length - 1 ? <Separator className="mt-4" /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
