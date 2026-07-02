import type { LucideIcon } from 'lucide-react';
import {
  Bus,
  Camera,
  Globe,
  Landmark,
  MapPin,
  Mountain,
  SunMedium,
  Hotel,
  Utensils,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, LucideIcon> = {
  bus: Bus,
  camera: Camera,
  globe: Globe,
  landmark: Landmark,
  museum: Landmark,
  map: MapPin,
  mappin: MapPin,
  hotel: Hotel,
  hiking: Mountain,
  beach: SunMedium,
  food: Utensils,
  sparkles: Sparkles,
};

function normalizeIconKey(iconKey?: unknown) {
  if (typeof iconKey !== 'string') {
    return '';
  }

  return iconKey.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function renderProgramDayIcon(iconKey?: unknown, className = ''): ReactNode {
  const Icon = iconMap[normalizeIconKey(iconKey)] ?? Sparkles;

  return <Icon className={className} />;
}
