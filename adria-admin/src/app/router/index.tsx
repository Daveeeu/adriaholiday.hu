import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';

import { RouteErrorFallback } from '@/components/common/route-error-fallback';
import { RequirePermission } from '@/components/common/require-permission';
import { AppShell } from '@/components/layout/app-shell';
import { getRoutePermission } from '@/config/navigation-permissions';

function withPermission(path: string, element: ReactNode) {
  return (
    <RequirePermission permission={getRoutePermission(path)}>
      {element}
    </RequirePermission>
  );
}

const AcceptInvitationPage = lazy(() =>
  import('@/features/auth/routes/accept-invitation-page').then((module) => ({
    default: module.AcceptInvitationPage,
  })),
);
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
const TourEditorPage = lazy(() =>
  import('@/features/tours/pages/TourEditorPage').then((module) => ({
    default: module.TourEditorPage,
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
const PromotionsPage = lazy(() =>
  import('@/features/bookings/routes/promotions-page').then((module) => ({
    default: module.PromotionsPage,
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
const BookingFormTemplatesPage = lazy(() =>
  import('@/features/booking-form-templates/pages/BookingFormTemplatesPage').then(
    (module) => ({ default: module.BookingFormTemplatesPage }),
  ),
);
const BusesPage = lazy(() =>
  import('@/features/buses/routes/buses-page').then((module) => ({
    default: module.BusesPage,
  })),
);
const TestimonialsPage = lazy(() =>
  import('@/features/testimonials/routes/testimonials-page').then((module) => ({
    default: module.TestimonialsPage,
  })),
);
const SitePagesPage = lazy(() =>
  import('@/features/pages/routes/site-pages-page').then((module) => ({
    default: module.SitePagesPage,
  })),
);
const SeoRedirectsPage = lazy(() =>
  import('@/features/seo-redirects/routes/seo-redirects-page').then(
    (module) => ({
      default: module.SeoRedirectsPage,
    }),
  ),
);
const CustomersPage = lazy(() =>
  import('@/features/customers/routes/customers-page').then((module) => ({
    default: module.CustomersPage,
  })),
);
const LocationsPage = lazy(() =>
  import('@/features/locations/routes/locations-page').then((module) => ({
    default: module.LocationsPage,
  })),
);
const RegionsPage = lazy(() =>
  import('@/features/regions/routes/regions-page').then((module) => ({
    default: module.RegionsPage,
  })),
);
const ApartmentTypesPage = lazy(() =>
  import('@/features/apartments/routes/apartment-types-page').then(
    (module) => ({
      default: module.ApartmentTypesPage,
    }),
  ),
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
const TourListOrderPage = lazy(() =>
  import('@/features/tours/pages/TourListOrderPage').then((module) => ({
    default: module.TourListOrderPage,
  })),
);
const TourDeparturePlacesPage = lazy(() =>
  import('@/features/tours/pages/TourDeparturePlacesPage').then((module) => ({
    default: module.TourDeparturePlacesPage,
  })),
);
const UsersPage = lazy(() =>
  import('@/features/users/routes/users-page').then((module) => ({
    default: module.UsersPage,
  })),
);
const RolesPage = lazy(() =>
  import('@/features/roles/routes/roles-page').then((module) => ({
    default: module.RolesPage,
  })),
);
const ActivityLogPage = lazy(() =>
  import('@/features/activity-log/routes/activity-log-page').then((module) => ({
    default: module.ActivityLogPage,
  })),
);
const PermissionsPage = lazy(() =>
  import('@/features/permissions/routes/permissions-page').then((module) => ({
    default: module.PermissionsPage,
  })),
);

const UserGuidePage = lazy(() =>
  import('@/features/user-guide/routes/user-guide-page').then((module) => ({
    default: module.UserGuidePage,
  })),
);

const basename =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
    ? '/admin'
    : '/';

function apartmentsPage() {
  return withPermission('/apartments', <ApartmentsPage />);
}

const apartmentModuleRoutes = [
  {
    path: 'apartments',
    handle: { crumbKey: 'nav.apartments' },
    children: [
      {
        index: true,
        element: apartmentsPage(),
      },
      {
        path: 'new',
        element: apartmentsPage(),
        handle: { crumbKey: 'nav.apartments.create' },
      },
      {
        path: 'detail/:apartmentId',
        element: apartmentsPage(),
        handle: { crumbKey: 'nav.apartments.detail' },
      },
      {
        path: 'detail/:apartmentId/edit',
        element: apartmentsPage(),
        handle: { crumbKey: 'nav.apartments.edit' },
      },
      {
        path: 'regions',
        element: withPermission('/apartments/regions', <RegionsPage />),
        handle: { crumbKey: 'nav.apartments.regions' },
      },
      {
        path: 'places',
        element: withPermission('/apartments/places', <LocationsPage />),
        handle: { crumbKey: 'nav.apartments.places' },
      },
      {
        path: 'types',
        element: withPermission('/apartments/types', <ApartmentTypesPage />),
        handle: { crumbKey: 'nav.apartments.types' },
      },
      {
        path: ':typeSlug',
        element: <Outlet />,
        handle: { crumbKey: 'nav.apartments.type' },
        children: [
          {
            index: true,
            element: apartmentsPage(),
          },
          {
            path: 'new',
            element: apartmentsPage(),
            handle: { crumbKey: 'nav.apartments.create' },
          },
          {
            path: 'detail/:apartmentId',
            element: apartmentsPage(),
            handle: { crumbKey: 'nav.apartments.detail' },
          },
          {
            path: 'detail/:apartmentId/edit',
            element: apartmentsPage(),
            handle: { crumbKey: 'nav.apartments.edit' },
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(
  [
    {
      // Opened from the invitation email, before the user has a password.
      path: '/jelszo-beallitas',
      element: (
        <Suspense fallback={null}>
          <AcceptInvitationPage />
        </Suspense>
      ),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/',
      element: <AppShell />,
      handle: { crumbKey: 'nav.dashboard' },
      errorElement: <RouteErrorFallback />,
      children: [
        { index: true, element: <DashboardPage /> },
        {
          path: 'analytics',
          element: withPermission('/analytics', <AnalyticsPage />),
          handle: { crumbKey: 'nav.analytics' },
        },
        {
          path: 'regions',
          element: withPermission('/apartments/regions', <RegionsPage />),
          handle: { crumbKey: 'nav.regions' },
        },
        {
          path: 'locations',
          element: withPermission('/apartments/places', <LocationsPage />),
          handle: { crumbKey: 'nav.locations' },
        },
        ...apartmentModuleRoutes,
        {
          path: 'bookings',
          handle: { crumbKey: 'nav.bookings' },
          children: [
            {
              index: true,
              element: withPermission('/bookings', <BookingsOverviewPage />),
            },
            {
              path: 'tour-bookings',
              element: withPermission(
                '/bookings/tour-bookings',
                <TourBookingsPage />,
              ),
              handle: { crumbKey: 'nav.bookings.tourBookings' },
            },
            {
              path: 'tour-inquiries',
              element: withPermission(
                '/bookings/tour-inquiries',
                <TourInquiriesPage />,
              ),
              handle: { crumbKey: 'nav.bookings.tourInquiries' },
            },
            {
              path: 'apartment-bookings',
              element: withPermission(
                '/bookings/apartment-bookings',
                <ApartmentBookingsPage />,
              ),
              handle: { crumbKey: 'nav.bookings.apartmentBookings' },
            },
            {
              path: 'partner-finances',
              element: withPermission(
                '/bookings/partner-finances',
                <PartnerFinancesPage />,
              ),
              handle: { crumbKey: 'nav.bookings.partnerFinances' },
            },
            {
              path: 'banner-generator',
              element: withPermission(
                '/bookings/banner-generator',
                <BannerGeneratorPage />,
              ),
              handle: { crumbKey: 'nav.bookings.bannerGenerator' },
            },
            {
              path: 'messages',
              element: withPermission('/bookings/messages', <MessagesPage />),
              handle: { crumbKey: 'nav.bookings.messages' },
            },
            {
              path: 'customers',
              element: withPermission('/bookings/customers', <CustomersPage />),
              handle: { crumbKey: 'nav.bookings.customers' },
            },
            {
              path: 'coupons',
              element: withPermission('/bookings/coupons', <CouponsPage />),
              handle: { crumbKey: 'nav.bookings.coupons' },
            },
            {
              path: 'promotions',
              element: withPermission(
                '/bookings/promotions',
                <PromotionsPage />,
              ),
              handle: { crumbKey: 'nav.bookings.promotions' },
            },
            {
              path: 'email-csv-export',
              element: withPermission(
                '/bookings/email-csv-export',
                <EmailCsvExportPage />,
              ),
              handle: { crumbKey: 'nav.bookings.emailCsvExport' },
            },
            {
              path: 'booking-form-templates',
              element: withPermission(
                '/bookings/booking-form-templates',
                <BookingFormTemplatesPage />,
              ),
              handle: { crumbKey: 'nav.bookings.bookingFormTemplates' },
            },
          ],
        },
        {
          path: 'buses',
          element: withPermission('/buses', <BusesPage />),
          handle: { crumbKey: 'nav.buses' },
        },
        {
          path: 'testimonials',
          element: withPermission('/testimonials', <TestimonialsPage />),
          handle: { crumbKey: 'nav.testimonials' },
        },
        {
          path: 'pages',
          element: withPermission('/pages', <SitePagesPage />),
          handle: { crumbKey: 'nav.pages' },
        },
        {
          path: 'seo-redirects',
          element: withPermission('/seo-redirects', <SeoRedirectsPage />),
          handle: { crumbKey: 'nav.seoRedirects' },
        },
        {
          path: 'media',
          element: withPermission('/media', <GalleriesPage />),
          handle: { crumbKey: 'nav.galleries' },
        },
        {
          path: 'gallery',
          element: withPermission('/media', <GalleriesPage />),
          handle: { crumbKey: 'nav.galleries' },
        },
        {
          path: 'galleries',
          element: <Navigate replace to="/media" />,
        },
        {
          path: 'tours',
          handle: { crumbKey: 'nav.tours' },
          children: [
            {
              index: true,
              element: withPermission('/tours', <ToursPage />),
              handle: { crumbKey: 'nav.tours.offers' },
            },
            {
              path: 'new',
              element: withPermission(
                '/tours',
                <RequirePermission permission="tours.create">
                  <TourEditorPage />
                </RequirePermission>,
              ),
              handle: { crumbKey: 'nav.tours.create' },
            },
            {
              path: ':tourId/edit',
              element: withPermission(
                '/tours',
                <RequirePermission permission="tours.update">
                  <TourEditorPage />
                </RequirePermission>,
              ),
              handle: { crumbKey: 'nav.tours.edit' },
            },
            {
              path: 'departure-places',
              element: withPermission(
                '/tours/departure-places',
                <TourDeparturePlacesPage />,
              ),
              handle: { crumbKey: 'nav.tours.departurePlaces' },
            },
            {
              path: 'list-order',
              element: withPermission(
                '/tours/list-order',
                <TourListOrderPage />,
              ),
              handle: { crumbKey: 'nav.tours.listOrder' },
            },
          ],
        },
        {
          path: 'homepage-offers',
          element: withPermission('/homepage-offers', <HomepageOffersPage />),
          handle: { crumbKey: 'nav.homepageOffers' },
        },
        {
          path: 'portfolio-filter-chips',
          element: withPermission(
            '/portfolio-filter-chips',
            <PortfolioFilterChipsPage />,
          ),
          handle: { crumbKey: 'nav.portfolioFilterChips' },
        },
        {
          path: 'portfolio-editor',
          element: withPermission('/portfolio-editor', <PortfolioEditorPage />),
          handle: { crumbKey: 'nav.portfolioContent' },
        },
        {
          path: 'blog',
          handle: { crumbKey: 'nav.blog' },
          children: [
            {
              index: true,
              element: withPermission('/blog', <BlogPage />),
              handle: { crumbKey: 'nav.blog.articles' },
            },
            {
              path: 'categories',
              element: withPermission(
                '/blog/categories',
                <BlogCategoriesPage />,
              ),
              handle: { crumbKey: 'nav.blog.categories' },
            },
            {
              path: 'tags',
              element: withPermission('/blog/tags', <BlogTagsPage />),
              handle: { crumbKey: 'nav.blog.tags' },
            },
          ],
        },
        {
          path: 'settings',
          element: withPermission('/settings', <SettingsPage />),
          handle: { crumbKey: 'nav.settings' },
        },
        {
          path: 'users',
          element: withPermission('/users', <UsersPage />),
          handle: { crumbKey: 'nav.administration.users' },
        },
        {
          path: 'roles',
          element: withPermission('/roles', <RolesPage />),
          handle: { crumbKey: 'nav.administration.roles' },
        },
        {
          path: 'permissions',
          element: withPermission('/permissions', <PermissionsPage />),
          handle: { crumbKey: 'nav.administration.permissions' },
        },
        {
          path: 'activity-log',
          element: withPermission('/activity-log', <ActivityLogPage />),
          handle: { crumbKey: 'nav.administration.activityLog' },
        },
        {
          path: 'user-guide',
          handle: { crumbKey: 'nav.userGuide' },
          children: [
            { index: true, element: <UserGuidePage /> },
            { path: ':chapterId', element: <UserGuidePage /> },
          ],
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
