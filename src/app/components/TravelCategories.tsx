import { ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import { EditableText } from '../content/EditableFields';
import { EditablePortfolioHeading } from '../content/PortfolioHeading';
import {
  fetchPortfolioHomepageOffers,
  type PortfolioHomepageOffer,
} from '../content/portfolio-homepage-offers-api';
import { usePortfolioContent } from '../content/PortfolioContentProvider';
import { resolveCategorySlugFromOfferLink } from '../content/portfolio-offer-routing';
import MotionLink from './MotionLink';
import { HOVER_HOST } from "../lib/hoverHost";
import { responsiveImage } from "../lib/responsiveImage";

type TravelCategoryCard = {
  id: string;
  title: string;
  image: string;
  description: string;
  link: string;
};

const CARD_LIFT: Variants = { rest: { y: 0 }, hover: { y: -8 } };

const IMAGE_ZOOM: Variants = { rest: { scale: 1 }, hover: { scale: 1.08 } };

const ARROW_HIGHLIGHT: Variants = {
  rest: { x: 0, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  hover: { x: 4, backgroundColor: 'rgba(0, 195, 137, 0.9)' },
};

const CARD_OUTLINE: Variants = {
  rest: { boxShadow: 'inset 0 0 0 0px rgba(0, 195, 137, 0)' },
  hover: { boxShadow: 'inset 0 0 0 2px rgba(0, 195, 137, 0.2)' },
};

export default function TravelCategories() {
  const [homepageOffers, setHomepageOffers] = useState<PortfolioHomepageOffer[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { isEditorEnabled } = usePortfolioContent();

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioHomepageOffers()
      .then((regions) => {
        if (!cancelled) {
          setHomepageOffers(regions.items);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHomepageOffers([]);
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayCards = useMemo<TravelCategoryCard[]>(() => {
    if (homepageOffers && homepageOffers.length > 0) {
      return homepageOffers.map((offer) => ({
        id: String(offer.id),
        title: offer.name,
        image: offer.image?.url ?? '',
        description: offer.shortDescription ?? offer.seoName,
        link: offer.link || offer.seoName,
      }));
    }

    return [];
  }, [homepageOffers]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fbfdff] to-[#f7fbff] pb-20 pt-14">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fafc] to-white opacity-60" />

      <div className="relative mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <EditablePortfolioHeading
            fieldKey="home.categories.titleParts"
            fallbackParts={[
              { text: 'Fedezd fel' },
              { text: 'kedvenc úti célod', variant: 'gradient' },
            ]}
            as="h2"
            mode="inline"
            className="m-0 mb-6 text-[#0f172a]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          />

          <EditableText
            fieldKey="home.categories.subtitle"
            fallback="Valódi Adria Holiday ajánlatok, folyamatosan frissülő utazási kínálattal."
            as="p"
            className="mx-auto max-w-2xl text-lg leading-relaxed text-[#64748b]"
          />
        </motion.div>

        {displayCards.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-gray-200 bg-white/80 px-6 py-10 text-center shadow-[0_2px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
            <p className="text-lg font-semibold text-[#0f172a]">
              {isEditorEnabled
                ? 'Nincs még megjeleníthető főoldali ajánlat.'
                : 'Jelenleg nincs megjeleníthető ajánlat.'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">
              {loadError
                ? 'A főoldali ajánlatok nem töltődtek be. Kérjük, próbáld újra később.'
                : isEditorEnabled
                  ? 'A "Főoldali ajánlatok" modulban aktiválj és rendezz ajánlatokat.'
                  : 'A következő ajánlatok hamarosan megjelennek itt.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {displayCards.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <MotionLink
                  to={`/kategoriak/${resolveCategorySlugFromOfferLink(category.link)}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="group block text-left"
                  {...HOVER_HOST}
                >
                  <motion.div
                    className="relative isolate overflow-hidden rounded-[24px] border border-gray-100/50 bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] transition-shadow duration-500 group-hover:shadow-[0_12px_48px_rgba(0,195,137,0.15)]"
                    variants={CARD_LIFT}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  >
                    <div className="relative isolate h-72 overflow-hidden">
                      <motion.img
                        {...responsiveImage(category.image)}
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        loading="lazy"
                        decoding="async"
                        alt={category.title}
                        className="h-full w-full object-cover"
                        variants={IMAGE_ZOOM}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 via-[#0f172a]/25 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3
                          className="mb-2 text-white"
                          style={{
                            fontSize: '1.45rem',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                          }}
                        >
                          {category.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="max-w-[75%] text-sm font-medium text-white/80">
                            {category.description}
                          </div>

                          <motion.div
                            className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm"
                            variants={ARROW_HIGHLIGHT}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight
                              className="h-4 w-4 text-white"
                              strokeWidth={2.5}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[24px]"
                      variants={CARD_OUTLINE}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </MotionLink>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
