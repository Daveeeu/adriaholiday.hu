import { Bus, Calendar, Clock, Plane, Utensils } from "lucide-react";
import type { ReactNode } from "react";

import { INQUIRE_LABEL, type UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";

export type OfferMetaItem = {
  key: "departure" | "duration" | "transport" | "meals";
  icon: ReactNode;
  value: string;
};

/** The date, length, transport and meals of a trip, as its cards show them. */
export function offerMetaItems(offer: UnifiedOfferCardModel): OfferMetaItem[] {
  return [
    {
      key: "departure",
      icon: <Calendar className="h-4 w-4" />,
      value: offer.departureLabel ?? INQUIRE_LABEL,
    },
    {
      key: "duration",
      icon: <Clock className="h-4 w-4" />,
      value: offer.durationLabel ?? "Többnapos út",
    },
    {
      key: "transport",
      icon: offer.transportLabel?.includes("Repül") ? <Plane className="h-4 w-4" /> : <Bus className="h-4 w-4" />,
      value: offer.transportLabel ?? "Szervezett út",
    },
    {
      key: "meals",
      icon: <Utensils className="h-4 w-4" />,
      value: offer.mealsLabel ?? "Információ később",
    },
  ];
}
