import { Star } from "lucide-react";

/** The apartment's category as stars; nothing for an uncategorised one. */
export default function ApartmentStars({ stars, className = "" }: { stars: number; className?: string }) {
  if (stars <= 0) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${stars} csillagos kategória`}>
      {Array.from({ length: stars }).map((_, index) => (
        <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      ))}
    </span>
  );
}
