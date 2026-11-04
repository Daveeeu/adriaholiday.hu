import { Map as MapIcon } from "lucide-react";

type OfferRouteMapProps = {
  url: string;
  alt: string;
};

/** The tour's route map under the offer page's side panel; it opens full size in a new tab. */
export default function OfferRouteMap({ url, alt }: OfferRouteMapProps) {
  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f172a]">
        <MapIcon className="h-4 w-4 text-[#00c389]" />
        Útvonal
      </div>

      <a href={url} target="_blank" rel="noopener" className="block overflow-hidden rounded-xl" title="Térkép megnyitása nagyban">
        <img src={url} alt={alt} width={960} height={640} loading="lazy" className="h-auto w-full" />
      </a>
    </div>
  );
}
