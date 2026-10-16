import { ArrowRight, Users, Waves } from "lucide-react";
import { Link } from "react-router";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

import RichTextContent from "../components/RichTextContent";
import { responsiveImage } from "../lib/responsiveImage";
import ApartmentStars from "./ApartmentStars";
import { formatDistance, formatEuro } from "./apartment-format";
import { apartmentLink, type ApartmentStay } from "./apartment-search-params";
import type { ApartmentCard as ApartmentCardData } from "./apartments-api";

const VISIBLE_SERVICES = 4;

export default function ApartmentCard({ apartment, stay }: { apartment: ApartmentCardData; stay: ApartmentStay }) {
  const imageUrl = apartment.image?.url ?? apartment.image?.thumbnailUrl ?? null;
  const sea = formatDistance(apartment.distanceToSeaM);
  const description = isRichTextEmpty(apartment.shortDescription) ? "" : sanitizeRichTextHtml(apartment.shortDescription);
  const hiddenServices = apartment.services.length - VISIBLE_SERVICES;

  return (
    <Link
      to={apartmentLink(apartment.link, stay)}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          <img
            {...responsiveImage(imageUrl)}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            alt={apartment.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#dff8ef] to-[#e5f4ff]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/60 via-transparent to-transparent" />
        {apartment.code ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wide text-[#0f172a] shadow-sm backdrop-blur">
            Kód: {apartment.code}
          </span>
        ) : null}
        {sea ? (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#07111f]/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Waves className="h-3.5 w-3.5 text-[#5eead4]" aria-hidden="true" />
            Tengerpart {sea}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <ApartmentStars stars={apartment.stars} className="text-[#f5b301]" />
        <h3 className="text-xl font-bold tracking-[-0.02em] text-[#0f172a]">{apartment.name}</h3>
        {apartment.address ? <p className="text-sm text-gray-500">{apartment.address}</p> : null}

        {description ? (
          <RichTextContent html={description} className="line-clamp-3 prose-p:my-0 prose-p:text-sm prose-p:leading-6" />
        ) : null}

        {apartment.services.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Szolgáltatások">
            {apartment.services.slice(0, VISIBLE_SERVICES).map((service) => (
              <li key={service.key} className="rounded-full bg-[#f1f8f5] px-2.5 py-1 text-xs font-medium text-[#047857]">
                {service.label}
              </li>
            ))}
            {hiddenServices > 0 ? (
              <li className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">+{hiddenServices}</li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            {apartment.lowestPrice !== null ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Már</div>
                <div className="text-lg font-bold text-[#0f172a]">
                  {formatEuro(apartment.lowestPrice)}
                  <span className="text-sm font-medium text-gray-500"> / éj-től</span>
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-gray-500">Árak érdeklődésre</div>
            )}
            {apartment.maxGuests ? (
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                max. {apartment.maxGuests} fő
              </div>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a878]">
            Megnézem
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
