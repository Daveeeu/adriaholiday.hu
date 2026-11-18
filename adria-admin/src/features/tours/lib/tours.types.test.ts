import { describe, expect, it } from 'vitest';

import {
  mapTourToFormValues,
  normalizeTourFormValues,
  tourFormSchema,
} from './tours.types';

describe('mapTourToFormValues', () => {
  it('turns the API numeric departure place ids into the string ids the form looks names up by', () => {
    const values = mapTourToFormValues({ departurePlaceIds: [11, 21] });

    expect(values.departurePlaceIds).toEqual(['11', '21']);
  });

  it('starts a new tour without departure places', () => {
    expect(mapTourToFormValues().departurePlaceIds).toEqual([]);
  });

  it("keeps a date's maximum passengers through loading and saving", () => {
    const date = {
      id: '186',
      startDate: '2026-12-19',
      endDate: '2026-12-21',
      price: '',
      status: 'available' as const,
      capacity: 50,
    };
    const values = mapTourToFormValues({ dates: [date] });

    expect(values.dates[0].capacity).toBe('50');
    expect(normalizeTourFormValues(values).dates[0].capacity).toBe('50');
  });
});

describe('the form of a saved tour', () => {
  it('passes the form validation with the numbers the API sends as ids and prices', () => {
    const values = mapTourToFormValues({
      name: 'Montenegró',
      regionId: 7 as unknown as string,
      price: 259900 as unknown as string,
      countryIds: [3 as unknown as string],
      tagIds: [12 as unknown as string],
      categoryIds: [5 as unknown as string],
      dates: [
        {
          id: 186 as unknown as string,
          startDate: '2027-07-04',
          endDate: '2027-07-11',
          price: 289900 as unknown as string,
          status: 'available',
        },
      ],
    });

    const result = tourFormSchema.safeParse(values);

    expect(
      result.success
        ? []
        : result.error.issues.map((issue) => issue.path.join('.')),
    ).toEqual([]);
    expect(values.regionId).toBe('7');
    expect(values.dates[0].id).toBe('186');
    expect(values.dates[0].price).toBe('289900');
  });
});

describe('partner settings', () => {
  const defaults = {
    country_id: 6,
    country_name: 'Horvátország',
    accommodation_name: 'Hotel',
    city: 'Horvátország',
    insurance_value: 540,
    accommodation_description_travelmax: 'Medencés szálloda',
    travel_types: { general: 1, travelgate: 1, cesys: 1, travelmax: [1] },
  };

  it("fills the empty ones with the tour's defaults and keeps the stored ones", () => {
    const values = mapTourToFormValues({
      partnerXml: {
        ...defaults,
        country_id: null,
        country_name: null,
        accommodation_name: null,
        city: 'Makarska',
        insurance_value: null,
        accommodation_description_travelmax: null,
        travel_types: {
          general: null,
          travelgate: 2,
          cesys: null,
          travelmax: [],
        },
      },
      partnerXmlDefaults: defaults,
    });

    expect(values.partnerXml).toEqual({
      country_id: '6',
      country_name: 'Horvátország',
      accommodation_name: 'Hotel',
      city: 'Makarska',
      insurance_value: '540',
      accommodation_description_travelmax: 'Medencés szálloda',
      travel_types: {
        general: '1',
        travelgate: '2',
        cesys: '1',
        travelmax: ['1'],
      },
    });
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
    const values = {
      ...mapTourToFormValues(),
      gallery: [galleryRow(''), galleryRow('4573')],
    };

    expect(
      normalizeTourFormValues(values).gallery.map((item) => item.mediaId),
    ).toEqual(['4573']);
  });

  it('drops empty price items but keeps the filled ones', () => {
    const values = {
      ...mapTourToFormValues(),
      priceItems: [
        {
          clientId: 'a',
          type: 'included' as const,
          text: '  ',
          sortOrder: 1,
          active: true,
        },
        {
          clientId: 'b',
          type: 'included' as const,
          text: 'Szállás 3 éjszakára',
          sortOrder: 2,
          active: true,
        },
      ],
    };

    expect(
      normalizeTourFormValues(values).priceItems.map((item) => item.text),
    ).toEqual(['Szállás 3 éjszakára']);
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
    const values = {
      ...mapTourToFormValues(),
      programDays: [day, { ...day, clientId: 'day-2', description: '' }],
    };

    expect(
      normalizeTourFormValues(values).programDays.map((item) => item.clientId),
    ).toEqual(['day-1']);
  });
});
