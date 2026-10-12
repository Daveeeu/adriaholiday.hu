
import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles/index.css";
import RootLayout from "./app/routes/RootLayout";
import { HelmetProvider } from "react-helmet-async";
import LoadingScreen from "./app/components/LoadingScreen";
import { CLUB_TERMS_PATH, TRAVEL_CLUB_PATH } from "./app/newsletter/travel-club";

const HomeRoute = lazy(() => import("./app/routes/HomeRoute"));
const StaticPage = lazy(() => import("./app/routes/StaticPage"));
const AboutRoute = lazy(() => import("./app/routes/AboutRoute"));
const TestimonialsRoute = lazy(() => import("./app/routes/TestimonialsRoute"));
const ContactRoute = lazy(() => import("./app/routes/ContactRoute"));
const CategoryRoute = lazy(() => import("./app/routes/CategoryRoute"));
const TripRoute = lazy(() => import("./app/routes/TripRoute"));
const BlogRoute = lazy(() => import("./app/routes/BlogRoute"));
const BlogArticleRoute = lazy(() => import("./app/routes/BlogArticleRoute"));
const RegionRoute = lazy(() => import("./app/routes/RegionRoute"));
const TravelsRoute = lazy(() => import("./app/routes/TravelsRoute"));
const NotFoundRoute = lazy(() => import("./app/routes/NotFoundRoute"));
const TravelClubRoute = lazy(() => import("./app/routes/TravelClubRoute"));
const PaymentResultRoute = lazy(() => import("./app/routes/PaymentResultRoute"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute canonicalPath="/" /> },
      { path: "utazasok", element: <TravelsRoute /> },
      { path: "kategoriak/:categorySlug", element: <CategoryRoute /> },
      { path: "regiok/:regionSlug", element: <RegionRoute /> },
      { path: "ajanlat/:offerSlug", element: <TripRoute /> },
      { path: "blog", element: <BlogRoute /> },
      { path: "blog/:slug", element: <BlogArticleRoute /> },
      { path: "rolunk", element: <AboutRoute /> },
      { path: "rolunk-irtak", element: <TestimonialsRoute /> },
      { path: "kapcsolat", element: <ContactRoute /> },
      { path: "aszf", element: <StaticPage title="Általános szerződési feltételek" canonicalPath="/aszf" /> },
      {
        path: "adatvedelem",
        element: <StaticPage title="Adatvédelem" canonicalPath="/adatvedelem" />,
      },
      {
        path: "impresszum",
        element: <StaticPage title="Impresszum" canonicalPath="/impresszum" />,
      },
      {
        path: "sutik",
        element: <StaticPage title="Sütikezelés" canonicalPath="/sutik" />,
      },
      { path: TRAVEL_CLUB_PATH.slice(1), element: <TravelClubRoute /> },
      {
        path: CLUB_TERMS_PATH.slice(1),
        element: <StaticPage title="Az Utazási Klub felhasználási feltételei" canonicalPath={CLUB_TERMS_PATH} />,
      },
      { path: "fizetes/eredmeny", element: <PaymentResultRoute /> },
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  </HelmetProvider>
);
  
