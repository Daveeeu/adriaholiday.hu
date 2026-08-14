import { MapPin } from "lucide-react";

import type { PortfolioOfferCity } from "@/app/content/portfolio-offer-detail-api";

type OfferCitiesSectionProps = {
  cities?: PortfolioOfferCity[] | null;
};

export default function OfferCitiesSection({ cities = [] }: OfferCitiesSectionProps) {
  const sortedCities = (cities ?? [])
    .filter((city) => typeof city.name === "string" && city.name.trim() !== "")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedCities.length === 0) {
    return null;
  }

  return (
    <div className="mb-20">
      <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
        <MapPin className="w-4 h-4" />
        ÚTVONAL
      </div>

      <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
        Érintett városok
      </h2>

      <p className="text-gray-500 text-lg mb-8">
        Az utazás során érintett helyszínek.
      </p>

      <div className="flex flex-wrap gap-3">
        {sortedCities.map((city) => (
          <span
            key={city.id}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base font-medium text-[#0f172a] shadow-sm"
          >
            <MapPin className="w-4 h-4 text-[#00a878]" />
            {city.name}
          </span>
        ))}
      </div>
    </div>
  );
}
