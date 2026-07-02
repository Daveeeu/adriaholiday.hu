import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Award,
  Bus,
  Calendar,
  Camera,
  CheckCircle,
  Compass,
  Eye,
  Gift,
  Globe,
  Heart,
  Hotel,
  Landmark,
  Mountain,
  MapPin,
  MessageCircle,
  Plane,
  SunMedium,
  Shield,
  ShieldCheck,
  Utensils,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, LucideIcon> = {
  arrowright: ArrowRight,
  award: Award,
  bus: Bus,
  calendar: Calendar,
  camera: Camera,
  checkcircle: CheckCircle,
  'check-circle': CheckCircle,
  compass: Compass,
  eye: Eye,
  gift: Gift,
  globe: Globe,
  heart: Heart,
  hotel: Hotel,
  hiking: Mountain,
  landmark: Landmark,
  museum: Landmark,
  map: MapPin,
  mappin: MapPin,
  'map-pin': MapPin,
  messagecircle: MessageCircle,
  'message-circle': MessageCircle,
  plane: Plane,
  beach: SunMedium,
  shield: Shield,
  shieldcheck: ShieldCheck,
  'shield-check': ShieldCheck,
  food: Utensils,
  sparkles: Sparkles,
  star: Star,
  users: Users,
  zap: Zap,
};

function normalizeIconKey(iconKey?: unknown) {
  if (typeof iconKey !== 'string') {
    return '';
  }

  return iconKey.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function renderContentIcon(iconKey?: unknown, className = ''): ReactNode {
  const Icon = iconMap[normalizeIconKey(iconKey)] ?? Sparkles;

  return <Icon className={className} />;
}
