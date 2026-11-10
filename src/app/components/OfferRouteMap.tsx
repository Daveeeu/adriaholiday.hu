import { Map as MapIcon } from "lucide-react";

import { tripSection } from "../lib/tripSection";
import { TRIP_SECTION_HEADING } from "../lib/tripTypography";

type OfferRouteMapProps = {
  url: string;
  alt: string;
};

/** The tour's route map as a section of the trip page, with its own "Térkép" tab; it opens full size in a new tab. */
export default function OfferRouteMap({ url, alt }: OfferRouteMapProps) {
  return (
    <section className="mb-20" {...tripSection("Térkép")}>
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#00a878]">
        <MapIcon className="h-4 w-4" />
        ÚTVONAL
      </div>

      <h2 className={`${TRIP_SECTION_HEADING} mb-6`}>Útvonaltérkép</h2>

      <a
        href={url}
        target="_blank"
        rel="noopener"
        title="Térkép megnyitása nagyban"
        className="block overflow-hidden rounded-[34px] border border-[#e7eef5] bg-white shadow-[0_12px_42px_rgba(15,23,42,0.05)]"
      >
        <img src={url} alt={alt} width={960} height={640} loading="lazy" className="h-auto w-full" />
      </a>
    </section>
  );
}
