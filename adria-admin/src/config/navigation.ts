import {
  Building2,
  CalendarDays,
  Mail,
  Newspaper,
  GalleryVerticalEnd,
  LayoutDashboard,
  Megaphone,
  Settings,
  Ticket,
  TrainFront
} from 'lucide-react';

import {
  APARTMENT_ADMIN_ROUTES,
  APARTMENT_TYPES,
} from '@/features/apartments/constants/apartmentTypes';
import { TOUR_MAIN_NAV_ITEMS } from '@/features/tours/lib/tours.constants';

export type NavigationLink = {
  to: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  permission?: string | string[];
};

export type NavigationGroup = {
  labelKey: string;
  icon: typeof LayoutDashboard;
  to?: string;
  children: NavigationLink[];
  permission?: string | string[];
};

export type NavigationItem = NavigationLink | NavigationGroup;

export const navigationItems: NavigationItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, exact: true },
  {
    labelKey: 'nav.apartments',
    icon: Building2,
    permission: 'apartments.viewAny',
    children: [
      { to: '/apartments', labelKey: 'nav.apartments.overview', icon: Building2, exact: true, permission: 'apartments.viewAny' },
      ...APARTMENT_TYPES.map((type) => ({
        to: type.route,
        labelKey: type.navLabelKey,
        icon: Building2,
        permission: 'apartments.viewAny',
      })),
      ...APARTMENT_ADMIN_ROUTES.map((item) => ({
        to: item.route,
        labelKey: item.labelKey,
        icon: Building2,
        permission: 'apartments.viewAny',
      })),
    ],
  },
  { to: '/homepage-offers', labelKey: 'nav.homepageOffers', icon: Megaphone, permission: 'homepage-offers.viewAny' },
  {
    labelKey: 'nav.blog',
    icon: Newspaper,
    permission: ['blog-articles.viewAny', 'blog-categories.viewAny', 'blog-tags.viewAny'],
    children: [
      { to: '/blog', labelKey: 'nav.blog.articles', icon: Newspaper, exact: true, permission: 'blog-articles.viewAny' },
      { to: '/blog/categories', labelKey: 'nav.blog.categories', icon: Newspaper, permission: 'blog-categories.viewAny' },
      { to: '/blog/tags', labelKey: 'nav.blog.tags', icon: Newspaper, permission: 'blog-tags.viewAny' },
    ],
  },
  {
    labelKey: 'nav.bookings',
    icon: CalendarDays,
    to: '/bookings',
    permission: 'bookings.viewAny',
    children: [
      { to: '/bookings/tour-bookings', labelKey: 'nav.bookings.tourBookings', icon: CalendarDays, exact: true, permission: 'bookings.viewAny' },
      { to: '/bookings/tour-inquiries', labelKey: 'nav.bookings.tourInquiries', icon: Mail, permission: 'messages.viewAny' },
      { to: '/bookings/apartment-bookings', labelKey: 'nav.bookings.apartmentBookings', icon: Building2, permission: 'bookings.viewAny' },
      { to: '/bookings/partner-finances', labelKey: 'nav.bookings.partnerFinances', icon: Ticket, permission: 'partner-finances.viewAny' },
      { to: '/bookings/banner-generator', labelKey: 'nav.bookings.bannerGenerator', icon: Megaphone, permission: 'partner-banners.viewAny' },
      { to: '/bookings/messages', labelKey: 'nav.bookings.messages', icon: Mail, permission: 'messages.viewAny' },
      { to: '/bookings/coupons', labelKey: 'nav.bookings.coupons', icon: Ticket, permission: 'coupons.viewAny' },
      { to: '/bookings/email-csv-export', labelKey: 'nav.bookings.emailCsvExport', icon: Mail, permission: 'email-csv-export.view' },
    ],
  },
  {
    labelKey: 'nav.tours',
    icon: Ticket,
    permission: 'tours.viewAny',
    children: TOUR_MAIN_NAV_ITEMS.map((item) => ({
      to: item.route,
      labelKey: item.labelKey ?? 'nav.tours.offers',
      icon: Ticket,
      exact: item.route === '/tours',
      permission: 'tours.viewAny',
    })),
  },
  { to: '/offers', labelKey: 'nav.offers', icon: Ticket, permission: 'offers.viewAny' },
  { to: '/buses', labelKey: 'nav.buses', icon: TrainFront, permission: 'buses.viewAny' },
  { to: '/galleries', labelKey: 'nav.galleries', icon: GalleryVerticalEnd, permission: 'galleries.viewAny' },
  { to: '/email-templates', labelKey: 'nav.emailTemplates', icon: Mail },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
