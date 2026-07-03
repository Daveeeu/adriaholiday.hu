
import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles/index.css";
import RootLayout from "./app/routes/RootLayout";
import { HelmetProvider } from "react-helmet-async";
import LoadingScreen from "./app/components/LoadingScreen";

const HomeRoute = lazy(() => import("./app/routes/HomeRoute"));
const StaticPage = lazy(() => import("./app/routes/StaticPage"));
const CategoryRoute = lazy(() => import("./app/routes/CategoryRoute"));
const TripRoute = lazy(() => import("./app/routes/TripRoute"));
const BlogRoute = lazy(() => import("./app/routes/BlogRoute"));
const BlogArticleRoute = lazy(() => import("./app/routes/BlogArticleRoute"));
const RegionRoute = lazy(() => import("./app/routes/RegionRoute"));
const NotFoundRoute = lazy(() => import("./app/routes/NotFoundRoute"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute canonicalPath="/" /> },
      {
        path: "utazasok",
        element: (
          <HomeRoute
            canonicalPath="/utazasok"
            title="Utazások"
            description="Kiemelt ajánlatok, kategóriák és inspiráció a következő utazásodhoz."
          />
        ),
      },
      {
        path: "portfolio",
        element: (
          <HomeRoute
            canonicalPath="/portfolio"
            title="Portfólió"
            description="Prémium buszos és repülős utazások Európa legszebb úti céljaihoz."
          />
        ),
      },
      { path: "kategoriak/:categorySlug", element: <CategoryRoute /> },
      { path: "regiok/:regionSlug", element: <RegionRoute /> },
      { path: "ajanlat/:offerSlug", element: <TripRoute /> },
      { path: "blog", element: <BlogRoute /> },
      { path: "blog/:slug", element: <BlogArticleRoute /> },
      { path: "rolunk", element: <StaticPage title="Rólunk" canonicalPath="/rolunk" /> },
      {
        path: "kapcsolat",
        element: <StaticPage title="Kapcsolat" canonicalPath="/kapcsolat" />,
      },
      { path: "aszf", element: <StaticPage title="ÁSZF" canonicalPath="/aszf" /> },
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
        element: <StaticPage title="Süti kezelés" canonicalPath="/sutik" />,
      },
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
  
