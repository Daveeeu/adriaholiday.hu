const EURO = new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** "300 m", or "1,2 km" from a kilometre on. */
export function formatDistance(metres: number | null | undefined): string | null {
  if (metres == null || metres <= 0) {
    return null;
  }

  return metres >= 1000
    ? `${(metres / 1000).toLocaleString('hu-HU', { maximumFractionDigits: 1 })} km`
    : `${metres} m`;
}

export function formatEuro(amount: number): string {
  return EURO.format(amount);
}

/** "2027.07.03." of an ISO date (YYYY-MM-DD). */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  return year && month && day ? `${year}.${month}.${day}.` : isoDate;
}

/** "07.03.–07.10." within a year, with the year once in front of the first. */
export function formatPeriod(startDate: string, endDate: string): { year: string; days: string } {
  const [startYear, startMonth, startDay] = startDate.split('-');
  const [endYear, endMonth, endDay] = endDate.split('-');

  return {
    year: startYear === endYear ? startYear : `${startYear}–${endYear}`,
    days: `${startMonth}.${startDay}.–${endMonth}.${endDay}.`,
  };
}

/** Nights between two ISO dates, or null when the order is wrong. */
export function nightsBetween(arrival: string, departure: string): number | null {
  const start = Date.parse(`${arrival}T00:00:00Z`);
  const end = Date.parse(`${departure}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return null;
  }

  return Math.round((end - start) / 86_400_000);
}
