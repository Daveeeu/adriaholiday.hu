import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import { EditableText } from '../content/EditableFields';
import { EditablePortfolioHeading } from '../content/PortfolioHeading';
import {
  fetchPortfolioHomepageOffers,
  type PortfolioHomepageOffer,
} from '../content/portfolio-homepage-offers-api';
import { usePortfolioContent } from '../content/PortfolioContentProvider';

interface TravelCategoriesProps {
  onCategorySelect: (category: string) => void;
}

type TravelCategoryCard = {
  id: string;
  title: string;
  image: string;
  description: string;
  link: string;
};

export default function TravelCategories({
  onCategorySelect,
}: TravelCategoriesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
            fallback="Valós Adria Holiday ajánlatok, aktuális utazási kínálattal."
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
                ? 'A főoldali ajánlatok nem töltődtek be. Kérjük próbáld újra később.'
                : isEditorEnabled
                  ? 'A "Főoldali ajánlatok" modulban aktiválj és rendezz ajánlatokat.'
                  : 'A következő ajánlatok hamarosan megjelennek itt.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {displayCards.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => onCategorySelect(category.link)}
                className="group block text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.div
                  className="relative overflow-hidden rounded-[24px] border border-gray-100/50 bg-white/90 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-500 hover:shadow-[0_12px_48px_rgba(0,195,137,0.15)]"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                >
                  <div className="relative h-72 overflow-hidden">
                    <motion.img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover"
                      animate={{
                        scale: hoveredId === category.id ? 1.08 : 1,
                      }}
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
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm"
                          animate={{
                            x: hoveredId === category.id ? 4 : 0,
                            backgroundColor:
                              hoveredId === category.id
                                ? 'rgba(0, 195, 137, 0.9)'
                                : 'rgba(255, 255, 255, 0.15)',
                          }}
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
                    animate={{
                      boxShadow:
                        hoveredId === category.id
                          ? 'inset 0 0 0 2px rgba(0, 195, 137, 0.2)'
                          : 'inset 0 0 0 0px rgba(0, 195, 137, 0)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
