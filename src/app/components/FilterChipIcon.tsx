import { Building2, Bus, Mountain, Plane, SlidersHorizontal, Sparkles, Sun, Wallet, Waves, type LucideIcon } from "lucide-react";

/** Icon keys the admin can pick for a listing filter chip. */
const FILTER_ICON_MAP: Record<string, LucideIcon> = {
  waves: Waves,
  "building-2": Building2,
  mountain: Mountain,
  wallet: Wallet,
  bus: Bus,
  plane: Plane,
  sparkles: Sparkles,
  sun: Sun,
};

export default function FilterChipIcon({ icon, className = "h-4 w-4" }: { icon: string | null; className?: string }) {
  const Icon = (icon ? FILTER_ICON_MAP[icon] : undefined) ?? SlidersHorizontal;

  return <Icon className={className} aria-hidden="true" />;
}
