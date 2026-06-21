import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';

import { RouteErrorFallback } from '@/components/common/route-error-fallback';
import { AppShell } from '@/components/layout/app-shell';
import { ApartmentsPage } from '@/features/apartments/routes/apartments-page';
import { BookingsOverviewPage } from '@/features/bookings/routes/bookings-overview-page';
import { BusesPage } from '@/features/buses/routes/buses-page';
import { DashboardPage } from '@/features/dashboard/routes/dashboard-page';
import { EmailTemplatesPage } from '@/features/email-templates/routes/email-templates-page';
import { GalleriesPage } from '@/features/galleries/routes/galleries-page';
import { GuestsPage } from '@/features/guests/routes/guests-page';
import { HomepageOffersPage } from '@/features/homepage-offers/routes/homepage-offers-page';
import { LocationsPage } from '@/features/locations/routes/locations-page';
import { OfferDatesPage } from '@/features/offer-dates/routes/offer-dates-page';
import { OffersPage } from '@/features/offers/routes/offers-page';
import { RegionsPage } from '@/features/regions/routes/regions-page';
import { SettingsPage } from '@/features/settings/routes/settings-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    handle: { crumbKey: 'nav.dashboard' },
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <DashboardPage /> },
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
      {
        path: 'apartments',
        element: <ApartmentsPage />,
        handle: { crumbKey: 'nav.apartments' },
      },
      {
        path: 'homepage-offers',
        element: <HomepageOffersPage />,
        handle: { crumbKey: 'nav.homepageOffers' },
      },
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
        element: <BookingsOverviewPage />,
        handle: { crumbKey: 'nav.bookings' },
      },
      { path: 'buses', element: <BusesPage />, handle: { crumbKey: 'nav.buses' } },
      {
        path: 'galleries',
        element: <GalleriesPage />,
        handle: { crumbKey: 'nav.galleries' },
      },
      {
        path: 'homepage-offers',
        element: <HomepageOffersPage />,
        handle: { crumbKey: 'nav.homepageOffers' },
      },
      {
        path: 'email-templates',
        element: <EmailTemplatesPage />,
        handle: { crumbKey: 'nav.emailTemplates' },
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
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
