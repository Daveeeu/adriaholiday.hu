import { describe, expect, it } from 'vitest';

import { mapTourToFormValues, normalizeTourFormValues } from './tours.types';

describe('mapTourToFormValues', () => {
  it('turns the API numeric departure place ids into the string ids the form looks names up by', () => {
    const values = mapTourToFormValues({ departurePlaceIds: [11, 21] });

    expect(values.departurePlaceIds).toEqual(['11', '21']);
  });

  it('starts a new tour without departure places', () => {
    expect(mapTourToFormValues().departurePlaceIds).toEqual([]);
  });
});

describe('normalizeTourFormValues', () => {
  const galleryRow = (mediaId: string) => ({
    clientId: `row-${mediaId || 'empty'}`,
    mediaId,
    image: mediaId ? `/storage/${mediaId}/kep.webp` : '',
    title: '',
    alt: '',
    caption: '',
    sortOrder: 1,
    active: true,
  });

  it('drops a gallery row the user added but chose no image for', () => {
    const values = { ...mapTourToFormValues(), gallery: [galleryRow(''), galleryRow('4573')] };

    expect(normalizeTourFormValues(values).gallery.map((item) => item.mediaId)).toEqual(['4573']);
  });

  it('drops empty price items but keeps the filled ones', () => {
    const values = {
      ...mapTourToFormValues(),
      priceItems: [
        { clientId: 'a', type: 'included' as const, text: '  ', sortOrder: 1, active: true },
        { clientId: 'b', type: 'included' as const, text: 'Szállás 3 éjszakára', sortOrder: 2, active: true },
      ],
    };

    expect(normalizeTourFormValues(values).priceItems.map((item) => item.text)).toEqual(['Szállás 3 éjszakára']);
  });

  it('keeps a partly filled program day so the server can say what is missing', () => {
    const day = {
      clientId: 'day-1',
      sortOrder: 1,
      dayNumber: 1,
      title: '',
      description: 'Indulás Budapestről',
      image: '',
      icon: '',
      experienceType: '',
      badges: [],
      active: true,
    };
    const values = { ...mapTourToFormValues(), programDays: [day, { ...day, clientId: 'day-2', description: '' }] };

    expect(normalizeTourFormValues(values).programDays.map((item) => item.clientId)).toEqual(['day-1']);
  });
});
