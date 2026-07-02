import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

import { usePortfolioContent } from "../content/PortfolioContentProvider";
import {
  fetchPortfolioFeaturedTours,
  type PortfolioFeaturedTour,
} from "../content/portfolio-featured-tours-api";
import {
  toUnifiedOfferCardModel,
  type UnifiedOfferCardModel,
} from "../content/portfolio-offer-card-model";
import OfferCard from "./OfferCard";

const filters = [
  "Összes ajánlat",
  "Buszos utak",
  "Tengerpart",
  "Körutazások",
  "Last Minute",
  "Országok",
];

export default function FeaturedOffers() {
  const navigate = useNavigate();
  const { isEditorEnabled } = usePortfolioContent();
  const [selectedFilter, setSelectedFilter] = useState("Összes ajánlat");
  const [tours, setTours] = useState<PortfolioFeaturedTour[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioFeaturedTours(6)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setTours(response.items ?? []);
        setHasError(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setTours([]);
        setHasError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOffers = useMemo<UnifiedOfferCardModel[]>(() => {
    const offers = tours ?? [];

    const result = offers.filter((offer) => {
      if (selectedFilter === "Összes ajánlat") return true;

      if (selectedFilter === "Buszos utak") {
        return offer.transport === "bus";
      }

      if (selectedFilter === "Tengerpart") {
        return /tengerpart|strand/i.test(
          `${offer.shortDescription} ${offer.listDescription}`,
        );
      }

      if (selectedFilter === "Körutazások") {
        return true;
      }

      if (selectedFilter === "Last Minute") {
        return offer.badge === "Last Minute";
      }

      if (selectedFilter === "Országok") {
        return Boolean(offer.country);
      }

      return false;
    });

    return result.slice(0, 6).map(toUnifiedOfferCardModel);
  }, [selectedFilter, tours]);

  const emptyState =
    isLoading || filteredOffers.length > 0
      ? null
      : hasError
        ? "A kiemelt ajánlatok nem töltődtek be."
        : isEditorEnabled
          ? "Nincs aktív kiemelt utazás."
          : "Jelenleg nincs kiemelt ajánlat.";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7fbff] via-white to-white pb-16 pt-14">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gradient-to-bl from-[#00c389]/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-[#00c389]/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
        <motion.div
          className="mb-7 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="mb-3 text-gray-900"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Kiemelt{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              ajánlataink
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Válassz a legfrissebb utazási lehetőségek közül
          </p>
        </motion.div>

        <motion.div
          className="mb-8 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full px-5 py-2.5 transition-all ${
                selectedFilter === filter
                  ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-[#00c389]/40 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="rounded-[28px] border border-gray-100 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Kiemelt ajánlatok betöltése...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOffers.length > 0 ? (
              <motion.div
                key={selectedFilter}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
              >
                {filteredOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  >
                    <OfferCard offer={offer} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-gray-200 bg-white/90 px-6 py-14 text-center shadow-sm">
                <p className="font-semibold text-gray-700">{emptyState}</p>
              </div>
            )}
          </AnimatePresence>
        )}

        {!isLoading && filteredOffers.length > 0 ? (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <motion.button
              className="group rounded-2xl border border-gray-200 bg-white px-8 py-4 text-gray-900 shadow-md transition-all hover:border-[#00c389] hover:shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/utazasok")}
            >
              <span className="flex items-center gap-2 text-base font-semibold">
                Összes ajánlat megtekintése
                <ArrowRight
                  className="h-5 w-5 text-[#00c389] transition-transform group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </span>
            </motion.button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
