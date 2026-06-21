import { useState } from 'react';
import { Download, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getTourBookings, getTourInquiries } from '../lib/bookings.api';
import type { TourBooking, TourInquiry } from '../lib/bookings.types';

function toCsv(rows: Array<Record<string, string | number | boolean>>) {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | boolean) =>
    `"${String(value).replace(/"/g, '""')}"`;

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header] ?? '')).join(',')),
  ].join('\n');
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function EmailCsvExportPage() {
  const [status, setStatus] = useState<string>('');

  async function exportBookings() {
    const response = await getTourBookings({
      page: 1,
      perPage: 1000,
      search: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    const rows = response.items.map((item: TourBooking) => ({
      id: item.id,
      partner: item.partnerName,
      email: item.partnerEmail,
      offer: item.offerName,
      date: item.applicationDate,
      status: item.status,
    }));

    downloadFile('tour-bookings-email-export.csv', toCsv(rows));
    setStatus('A foglalási CSV export elkészült.');
  }

  async function exportInquiries() {
    const response = await getTourInquiries({
      page: 1,
      perPage: 1000,
      search: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    const rows = response.items.map((item: TourInquiry) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      offer: item.offerName,
      createdAt: item.createdAt,
      status: item.status,
    }));

    downloadFile('tour-inquiries-email-export.csv', toCsv(rows));
    setStatus('Az ajánlatkérés CSV export elkészült.');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Foglalások</p>
        <h1 className="text-3xl font-semibold tracking-tight">E-mail CSV export</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Egyszerű eszközoldal e-mail exportok generálásához foglalásokból és ajánlatkérésekből.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              CSV export foglalásokból
            </CardTitle>
            <CardDescription>
              A körutazás foglalások e-mail címeit és kapcsolódó alapadatait exportálja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={exportBookings}>
              <Download className="size-4" />
              Export indítása
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              CSV export ajánlatkérésekből
            </CardTitle>
            <CardDescription>
              Az ajánlatkérések e-mail címeit és státuszait exportálja egy külön CSV fájlba.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={exportInquiries}>
              <Download className="size-4" />
              Export indítása
            </Button>
          </CardContent>
        </Card>
      </div>

      {status ? (
        <div className="rounded-3xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {status}
        </div>
      ) : null}
    </div>
  );
}

