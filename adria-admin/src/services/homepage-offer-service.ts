import type {
  HomepageOffer,
  HomepageOfferFormValues,
} from '@/features/homepage-offers/lib/homepage-offer-schema';

let homepageOffers: HomepageOffer[] = [
  {
    id: '7',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80',
    imageTitle: 'Körutazások',
    link: 'https://adriaholiday.hu/korutazasok/csoport/korutazas',
    autoSeo: true,
    translations: {
      hu: { name: 'KÖRUTAZÁSOK', seoName: 'korutazasok', shortDescription: '' },
      en: { name: 'ROUND TRIPS', seoName: 'round-trips', shortDescription: '' },
      de: { name: 'RUNDREISEN', seoName: 'rundreisen', shortDescription: '' },
    },
  },
  {
    id: '86',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=500&q=80',
    imageTitle: 'Repülős körutazások',
    link: 'https://adriaholiday.hu/korutazasok/regio/repulos-utak',
    autoSeo: true,
    translations: {
      hu: { name: 'REPÜLŐS körutazások', seoName: 'repulos-korutazasok', shortDescription: '' },
      en: { name: 'Flight round trips', seoName: 'flight-round-trips', shortDescription: '' },
      de: { name: 'Flug Rundreisen', seoName: 'flug-rundreisen', shortDescription: '' },
    },
  },
];
function wait<T>(value: T): Promise<T> {
  console.log('[homepage-offer-service] wait start', value);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[homepage-offer-service] wait resolve', value);
      resolve(value);
    }, 250);
  });
}
export async function getHomepageOffers(): Promise<HomepageOffer[]> {
  return wait([...homepageOffers]);
}

export async function createHomepageOffer(
  values: HomepageOfferFormValues,
): Promise<HomepageOffer> {
  const offer: HomepageOffer = {
    id: crypto.randomUUID(),
    ...values,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  homepageOffers = [offer, ...homepageOffers];

  return wait(offer);
}

export async function updateHomepageOffer(
  id: string,
  values: HomepageOfferFormValues,
): Promise<HomepageOffer> {
  const updatedOffer: HomepageOffer = {
    id,
    ...values,
    updatedAt: new Date().toISOString(),
  };

  homepageOffers = homepageOffers.map((offer) =>
    offer.id === id ? { ...offer, ...updatedOffer } : offer,
  );

  return wait(updatedOffer);
}

export async function deleteHomepageOffer(id: string): Promise<void> {
  homepageOffers = homepageOffers.filter((offer) => offer.id !== id);
  return wait(undefined);
}
