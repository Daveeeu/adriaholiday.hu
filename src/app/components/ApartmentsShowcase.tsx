import { Building2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import ApartmentCard from "../apartments/ApartmentCard";
import { fetchApartmentHighlights, type ApartmentHighlights } from "../apartments/apartments-api";
import { EditableText } from "../content/EditableFields";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";

const NO_STAY = { arrival: "", departure: "", guests: null };

type ApartmentLocationLink = ApartmentHighlights["locations"][number];

/**
 * The home page's apartment section: a few apartments to show off and every
 * location with apartments, linking to its list. Not shown while the site has
 * no public apartments.
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5fbff] to-white py-16 md:py-20">
      <div className="absolute right-[6%] top-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#16b8ff]/8 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
        <motion.div
          className="mb-10 max-w-4xl"
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
            className="max-w-3xl text-lg leading-relaxed text-gray-600"
          />
        </motion.div>

        {highlights.apartments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {highlights.apartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} stay={NO_STAY} />
            ))}
          </div>
        ) : null}

        <div className="mt-12">
          <h3 className="mb-5 text-xl font-bold tracking-[-0.02em] text-[#0f172a]">Válassz úti célt</h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {highlights.locations.map((location) => (
              <li key={location.link}>
                <LocationLink location={location} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LocationLink({ location }: { location: ApartmentLocationLink }) {
  // Some locations' area is the country itself (Korfu: Görögország · Görögország).
  const place = [...new Set([location.areaName, location.regionName].filter(Boolean))].join(" · ");

  return (
    <Link
      to={location.link}
      className="group flex h-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#00c389]/30 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8faf3] text-[#00a878]">
        <MapPin className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-[#0f172a] group-hover:text-[#00a878]">{location.name}</span>
        {place ? <span className="block truncate text-sm text-gray-500">{place}</span> : null}
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-bold leading-tight text-[#0f172a]">{location.apartmentCount}</span>
        <span className="block text-xs text-gray-500">apartman</span>
      </span>
    </Link>
  );
}
