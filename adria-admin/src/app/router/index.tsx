import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import { lazy } from 'react';

import { RouteErrorFallback } from '@/components/common/route-error-fallback';
import { AppShell } from '@/components/layout/app-shell';
import { AdminPlaceholderPage } from '@/features/shared/components/admin-placeholder-page';
import {
  APARTMENT_ADMIN_ROUTES,
  APARTMENT_TYPES,
} from '@/features/apartments/constants/apartmentTypes';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/routes/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/routes/analytics-page').then((module) => ({
    default: module.AnalyticsPage,
  })),
);
const GalleriesPage = lazy(() =>
  import('@/features/galleries/routes/galleries-page').then((module) => ({
    default: module.GalleriesPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/routes/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
);
const PortfolioEditorPage = lazy(() =>
  import('@/features/portfolio-content').then((module) => ({
    default: module.PortfolioEditorPage,
  })),
);
const ToursPage = lazy(() =>
  import('@/features/tours/pages/ToursPage').then((module) => ({
    default: module.ToursPage,
  })),
);
const ApartmentsPage = lazy(() =>
  import('@/features/apartments/routes/apartments-page').then((module) => ({
    default: module.ApartmentsPage,
  })),
);
const TourBookingsPage = lazy(() =>
  import('@/features/bookings/routes/tour-bookings-page').then((module) => ({
    default: module.TourBookingsPage,
  })),
);
const TourInquiriesPage = lazy(() =>
  import('@/features/bookings/routes/tour-inquiries-page').then((module) => ({
    default: module.TourInquiriesPage,
  })),
);
const ApartmentBookingsPage = lazy(() =>
  import('@/features/bookings/routes/apartment-bookings-page').then(
    (module) => ({ default: module.ApartmentBookingsPage }),
  ),
);
const PartnerFinancesPage = lazy(() =>
  import('@/features/bookings/routes/partner-finances-page').then((module) => ({
    default: module.PartnerFinancesPage,
  })),
);
const BannerGeneratorPage = lazy(() =>
  import('@/features/bookings/routes/banner-generator-page').then((module) => ({
    default: module.BannerGeneratorPage,
  })),
);
const MessagesPage = lazy(() =>
  import('@/features/bookings/routes/messages-page').then((module) => ({
    default: module.MessagesPage,
  })),
);
const CouponsPage = lazy(() =>
  import('@/features/bookings/routes/coupons-page').then((module) => ({
    default: module.CouponsPage,
  })),
);
const EmailCsvExportPage = lazy(() =>
  import('@/features/bookings/routes/email-csv-export-page').then((module) => ({
    default: module.EmailCsvExportPage,
  })),
);
const BookingsOverviewPage = lazy(() =>
  import('@/features/bookings/routes/bookings-overview-page').then(
    (module) => ({ default: module.BookingsOverviewPage }),
  ),
);
const BusesPage = lazy(() =>
  import('@/features/buses/routes/buses-page').then((module) => ({
    default: module.BusesPage,
  })),
);
const EmailTemplatesPage = lazy(() =>
  import('@/features/email-templates/routes/email-templates-page').then(
    (module) => ({ default: module.EmailTemplatesPage }),
  ),
);
const GuestsPage = lazy(() =>
  import('@/features/guests/routes/guests-page').then((module) => ({
    default: module.GuestsPage,
  })),
);
const LocationsPage = lazy(() =>
  import('@/features/locations/routes/locations-page').then((module) => ({
    default: module.LocationsPage,
  })),
);
const OfferDatesPage = lazy(() =>
  import('@/features/offer-dates/routes/offer-dates-page').then((module) => ({
    default: module.OfferDatesPage,
  })),
);
const OffersPage = lazy(() =>
  import('@/features/offers/routes/offers-page').then((module) => ({
    default: module.OffersPage,
  })),
);
const RegionsPage = lazy(() =>
  import('@/features/regions/routes/regions-page').then((module) => ({
    default: module.RegionsPage,
  })),
);
const HomepageOffersPage = lazy(() =>
  import('@/features/homepage-offers/routes/homepage-offers-page').then(
    (module) => ({ default: module.HomepageOffersPage }),
  ),
);
const PortfolioFilterChipsPage = lazy(() =>
  import('@/features/portfolio-filter-chips/routes/portfolio-filter-chips-page').then(
    (module) => ({ default: module.PortfolioFilterChipsPage }),
  ),
);
const BlogPage = lazy(() =>
  import('@/features/blog/routes/blog-page').then((module) => ({
    default: module.BlogPage,
  })),
);
const BlogCategoriesPage = lazy(() =>
  import('@/features/blog/routes/blog-categories-page').then((module) => ({
    default: module.BlogCategoriesPage,
  })),
);
const BlogTagsPage = lazy(() =>
  import('@/features/blog/routes/blog-tags-page').then((module) => ({
    default: module.BlogTagsPage,
  })),
);
const TourPartnerOffersPage = lazy(() =>
  import('@/features/tours/pages/TourPartnerOffersPage').then((module) => ({
    default: module.TourPartnerOffersPage,
  })),
);
const TourRegionGroupsPage = lazy(() =>
  import('@/features/tours/pages/TourRegionGroupsPage').then((module) => ({
    default: module.TourRegionGroupsPage,
  })),
);
const TourSeasonalGroupsPage = lazy(() =>
  import('@/features/tours/pages/TourSeasonalGroupsPage').then((module) => ({
    default: module.TourSeasonalGroupsPage,
  })),
);
const TourDeparturePlacesPage = lazy(() =>
  import('@/features/tours/pages/TourDeparturePlacesPage').then((module) => ({
    default: module.TourDeparturePlacesPage,
  })),
);

const basename =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
    ? '/admin'
    : '/';

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
        {
          path: 'buses',
          element: <BusesPage />,
          handle: { crumbKey: 'nav.buses' },
        },
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
            {
              index: true,
              element: <ToursPage />,
              handle: { crumbKey: 'nav.tours.offers' },
            },
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
            {
              index: true,
              element: <BlogPage />,
              handle: { crumbKey: 'nav.blog.articles' },
            },
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
        {
          path: 'guests',
          element: <GuestsPage />,
          handle: { crumbKey: 'nav.guests' },
        },
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
