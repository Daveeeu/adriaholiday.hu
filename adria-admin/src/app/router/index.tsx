import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { RouteErrorFallback } from '@/components/common/route-error-fallback';
import { AppShell } from '@/components/layout/app-shell';
import { AdminPlaceholderPage } from '@/features/shared/components/admin-placeholder-page';
import { ApartmentsPage } from '@/features/apartments/routes/apartments-page';
import {
  APARTMENT_ADMIN_ROUTES,
  APARTMENT_TYPES,
} from '@/features/apartments/constants/apartmentTypes';
import { TourBookingsPage } from '@/features/bookings/routes/tour-bookings-page';
import { TourInquiriesPage } from '@/features/bookings/routes/tour-inquiries-page';
import { ApartmentBookingsPage } from '@/features/bookings/routes/apartment-bookings-page';
import { PartnerFinancesPage } from '@/features/bookings/routes/partner-finances-page';
import { BannerGeneratorPage } from '@/features/bookings/routes/banner-generator-page';
import { MessagesPage } from '@/features/bookings/routes/messages-page';
import { CouponsPage } from '@/features/bookings/routes/coupons-page';
import { EmailCsvExportPage } from '@/features/bookings/routes/email-csv-export-page';
import { BookingsOverviewPage } from '@/features/bookings/routes/bookings-overview-page';
import { BusesPage } from '@/features/buses/routes/buses-page';
import { DashboardPage } from '@/features/dashboard/routes/dashboard-page';
import { AnalyticsPage } from '@/features/analytics/routes/analytics-page';
import { EmailTemplatesPage } from '@/features/email-templates/routes/email-templates-page';
import { GalleriesPage } from '@/features/galleries/routes/galleries-page';
import { GuestsPage } from '@/features/guests/routes/guests-page';
import { LocationsPage } from '@/features/locations/routes/locations-page';
import { OfferDatesPage } from '@/features/offer-dates/routes/offer-dates-page';
import { OffersPage } from '@/features/offers/routes/offers-page';
import { RegionsPage } from '@/features/regions/routes/regions-page';
import { SettingsPage } from '@/features/settings/routes/settings-page';
import { HomepageOffersPage } from '@/features/homepage-offers/routes/homepage-offers-page';
import { PortfolioFilterChipsPage } from '@/features/portfolio-filter-chips/routes/portfolio-filter-chips-page';
import { BlogPage } from '@/features/blog/routes/blog-page';
import { BlogCategoriesPage } from '@/features/blog/routes/blog-categories-page';
import { BlogTagsPage } from '@/features/blog/routes/blog-tags-page';
import { PortfolioEditorPage } from '@/features/portfolio-content';
import { ToursPage } from '@/features/tours/routes/tours-page';
import { TourPartnerOffersPage } from '@/features/tours/pages/TourPartnerOffersPage';
import { TourRegionGroupsPage } from '@/features/tours/pages/TourRegionGroupsPage';
import { TourSeasonalGroupsPage } from '@/features/tours/pages/TourSeasonalGroupsPage';
import { TourDeparturePlacesPage } from '@/features/tours/pages/TourDeparturePlacesPage';

const basename =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin' : '/';

const apartmentModuleRoutes = [
  {
    path: 'apartments',
    element: <Outlet />,
    handle: { crumbKey: 'nav.apartments' },
    children: [
      { index: true, element: <ApartmentsPage /> },
      {
        path: 'new',
        element: <ApartmentsPage />,
        handle: { crumbKey: 'nav.apartments.create' },
      },
      {
        path: 'detail/:apartmentId',
        element: <ApartmentsPage />,
        handle: { crumbKey: 'nav.apartments.detail' },
      },
      {
        path: 'detail/:apartmentId/edit',
        element: <ApartmentsPage />,
        handle: { crumbKey: 'nav.apartments.edit' },
      },
      ...APARTMENT_TYPES.map((type) => ({
        path: type.route.replace('/apartments/', ''),
        element: <Outlet />,
        handle: { crumbKey: type.navLabelKey },
        children: [
          { index: true, element: <ApartmentsPage /> },
          {
            path: 'new',
            element: <ApartmentsPage />,
            handle: { crumbKey: 'nav.apartments.create' },
          },
          {
            path: 'detail/:apartmentId',
            element: <ApartmentsPage />,
            handle: { crumbKey: 'nav.apartments.detail' },
          },
          {
            path: 'detail/:apartmentId/edit',
            element: <ApartmentsPage />,
            handle: { crumbKey: 'nav.apartments.edit' },
          },
        ],
      })),
      ...APARTMENT_ADMIN_ROUTES.map((route) => ({
        path: route.route.replace('/apartments/', ''),
        element:
          route.route === '/apartments/regions' ? (
            <RegionsPage />
          ) : route.route === '/apartments/places' ? (
            <LocationsPage />
          ) : (
            <AdminPlaceholderPage
              eyebrow="Apartmanok"
              title={
                route.route === '/apartments/types'
                  ? 'Típusok'
                  : route.route === '/apartments/services'
                    ? 'Szolgáltatások'
                    : route.route === '/apartments/actions'
                      ? 'Akciók'
                    : 'Egyedi intervallumok'
              }
              description={
                route.route === '/apartments/types'
                  ? 'Az apartman típusszótár és a kapcsolódó kategóriák kezelési helye.'
                  : route.route === '/apartments/services'
                    ? 'Szolgáltatás katalógus kezelőfelület.'
                    : route.route === '/apartments/actions'
                      ? 'Apartman akciók kezelőfelülete.'
                    : 'Egyedi időintervallumok kezelése.'
              }
              metrics={[
                {
                  label: 'Állapot',
                  value: 'Előkészítve',
                  hint: 'A modul jelenleg előkészített állapotban van.',
                },
              ]}
            />
          ),
        handle: { crumbKey: route.labelKey },
      })),
    ],
  },
];

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      handle: { crumbKey: 'nav.dashboard' },
      errorElement: <RouteErrorFallback />,
      children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
        handle: { crumbKey: 'nav.analytics' },
      },
      {
        path: 'regions',
        element: <RegionsPage />,
        handle: { crumbKey: 'nav.regions' },
      },
      {
        path: 'locations',
        element: <LocationsPage />,
        handle: { crumbKey: 'nav.locations' },
      },
      ...apartmentModuleRoutes,
      {
        path: 'offers',
        element: <OffersPage />,
        handle: { crumbKey: 'nav.offers' },
      },
      {
        path: 'offers/dates',
        element: <OfferDatesPage />,
        handle: { crumbKey: 'nav.offerDates' },
      },
      {
        path: 'bookings',
        element: <Outlet />,
        handle: { crumbKey: 'nav.bookings' },
        children: [
          {
            index: true,
            element: <BookingsOverviewPage />,
          },
          {
            path: 'tour-bookings',
            element: <TourBookingsPage />,
            handle: { crumbKey: 'nav.bookings.tourBookings' },
          },
          {
            path: 'tour-inquiries',
            element: <TourInquiriesPage />,
            handle: { crumbKey: 'nav.bookings.tourInquiries' },
          },
          {
            path: 'apartment-bookings',
            element: <ApartmentBookingsPage />,
            handle: { crumbKey: 'nav.bookings.apartmentBookings' },
          },
          {
            path: 'partner-finances',
            element: <PartnerFinancesPage />,
            handle: { crumbKey: 'nav.bookings.partnerFinances' },
          },
          {
            path: 'banner-generator',
            element: <BannerGeneratorPage />,
            handle: { crumbKey: 'nav.bookings.bannerGenerator' },
          },
          {
            path: 'messages',
            element: <MessagesPage />,
            handle: { crumbKey: 'nav.bookings.messages' },
          },
          {
            path: 'coupons',
            element: <CouponsPage />,
            handle: { crumbKey: 'nav.bookings.coupons' },
          },
          {
            path: 'email-csv-export',
            element: <EmailCsvExportPage />,
            handle: { crumbKey: 'nav.bookings.emailCsvExport' },
          },
        ],
      },
      { path: 'buses', element: <BusesPage />, handle: { crumbKey: 'nav.buses' } },
      {
        path: 'media',
        element: <GalleriesPage />,
        handle: { crumbKey: 'nav.galleries' },
      },
      {
        path: 'gallery',
        element: <GalleriesPage />,
        handle: { crumbKey: 'nav.galleries' },
      },
      {
        path: 'galleries',
        element: <Navigate replace to="/media" />,
      },
      {
        path: 'email-templates',
        element: <EmailTemplatesPage />,
        handle: { crumbKey: 'nav.emailTemplates' },
      },
      {
        path: 'tours',
        element: <Outlet />,
        handle: { crumbKey: 'nav.tours' },
        children: [
          { index: true, element: <ToursPage />, handle: { crumbKey: 'nav.tours.offers' } },
          {
            path: 'partner-offers',
            element: <TourPartnerOffersPage />,
            handle: { crumbKey: 'nav.tours.partnerOffers' },
          },
          {
            path: 'region-groups',
            element: <TourRegionGroupsPage />,
            handle: { crumbKey: 'nav.tours.regionGroups' },
          },
          {
            path: 'seasonal-groups',
            element: <TourSeasonalGroupsPage />,
            handle: { crumbKey: 'nav.tours.seasonalGroups' },
          },
          {
            path: 'departure-places',
            element: <TourDeparturePlacesPage />,
            handle: { crumbKey: 'nav.tours.departurePlaces' },
          },
        ],
      },
      {
        path: 'homepage-offers',
        element: <HomepageOffersPage />,
        handle: { crumbKey: 'nav.homepageOffers' },
      },
      {
        path: 'portfolio-filter-chips',
        element: <PortfolioFilterChipsPage />,
        handle: { crumbKey: 'nav.portfolioFilterChips' },
      },
      {
        path: 'portfolio-editor',
        element: <PortfolioEditorPage />,
        handle: { crumbKey: 'nav.portfolioContent' },
      },
      {
        path: 'blog',
        element: <Outlet />,
        handle: { crumbKey: 'nav.blog' },
        children: [
          { index: true, element: <BlogPage />, handle: { crumbKey: 'nav.blog.articles' } },
          {
            path: 'categories',
            element: <BlogCategoriesPage />,
            handle: { crumbKey: 'nav.blog.categories' },
          },
          {
            path: 'tags',
            element: <BlogTagsPage />,
            handle: { crumbKey: 'nav.blog.tags' },
          },
        ],
      },
      { path: 'guests', element: <GuestsPage />, handle: { crumbKey: 'nav.guests' } },
      {
        path: 'settings',
        element: <SettingsPage />,
        handle: { crumbKey: 'nav.settings' },
      },
      { path: '*', element: <Navigate replace to="/" /> },
      ],
    },
  ],
  { basename },
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
