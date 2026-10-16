import { ArrowRight, Building2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import ApartmentCard from "../apartments/ApartmentCard";
import { fetchApartmentHighlights, type ApartmentHighlights } from "../apartments/apartments-api";
import { EditableText } from "../content/EditableFields";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { responsiveImage } from "../lib/responsiveImage";

const NO_STAY = { arrival: "", departure: "", guests: null };

/**
 * The home page's apartment section: the locations with apartments (with a
 * link to their list) and a few apartments to show off. Not shown while the
 * site has no public apartments.
 */
export default function ApartmentsShowcase() {
  const [highlights, setHighlights] = useState<ApartmentHighlights | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchApartmentHighlights().then(
      (data) => {
        if (!cancelled) {
          setHighlights(data);
        }
      },
      () => {
        // The section stays hidden; the rest of the home page does not depend on it.
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!highlights || highlights.locations.length === 0) {
    return null;
  }

  const coverUrl = highlights.apartments[0]?.image?.url ?? null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5fbff] to-white py-16 md:py-20">
      <div className="absolute right-[6%] top-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#16b8ff]/8 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
        <motion.div
          className="mb-10 max-w-3xl"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00c389]/15 bg-white/80 px-4 py-2 text-sm font-bold text-[#00a878] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <Building2 className="h-4 w-4" />
            <EditableText fieldKey="home.apartments.eyebrow" fallback="APARTMANOK" as="span" />
          </div>
          <div className="mb-4">
            <EditablePortfolioHeading
              fieldKey="home.apartments.titleParts"
              fallbackParts={[{ text: "Saját apartman" }, { text: "a tengerparton", variant: "gradient" }]}
              as="h2"
              mode="inline"
              className="m-0 text-[#0f172a]"
              style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", fontWeight: 760, letterSpacing: "-0.045em", lineHeight: 1.05 }}
            />
          </div>
          <EditableText
            fieldKey="home.apartments.description"
            fallback="Apartmanok, villák és rezidenciák a tengerpart közelében, családoknak és baráti társaságoknak. Válaszd ki a kedvencedet, a foglalásodat kollégáink visszaigazolják."
            as="p"
            className="text-lg leading-relaxed text-gray-600"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          <div className="flex flex-col gap-6">
            {highlights.locations.map((location, index) => (
              <Link
                key={location.link}
                to={location.link}
                className="group relative flex min-h-[260px] flex-1 flex-col justify-end overflow-hidden rounded-[28px] bg-[#071426] p-7 text-white shadow-[0_20px_70px_rgba(7,20,38,0.18)]"
              >
                {index === 0 && coverUrl ? (
                  <img
                    {...responsiveImage(coverUrl)}
                    sizes="(min-width: 1024px) 25vw, 100vw"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-[#071426]/55 to-transparent" />
                <div className="relative">
                  <div className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7ff2ca]">
                    <MapPin className="h-4 w-4" />
                    {[location.areaName, location.regionName].filter(Boolean).join(" · ")}
                  </div>
                  <h3 className="text-3xl font-bold tracking-[-0.03em]">{location.name}</h3>
                  <p className="mt-1 text-white/70">{location.apartmentCount} apartman</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-white">
                    Összes apartman
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {highlights.apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} stay={NO_STAY} />
          ))}
        </div>
      </div>
    </section>
  );
}
