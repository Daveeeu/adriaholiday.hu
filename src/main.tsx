
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles/index.css";
import RootLayout from "./app/routes/RootLayout";
import HomeRoute from "./app/routes/HomeRoute";
import StaticPage from "./app/routes/StaticPage";
import CategoryRoute from "./app/routes/CategoryRoute";
import TripRoute from "./app/routes/TripRoute";
import BlogRoute from "./app/routes/BlogRoute";
import BlogArticleRoute from "./app/routes/BlogArticleRoute";
import { HelmetProvider } from "react-helmet-async";
import RegionRoute from "./app/routes/RegionRoute";
import NotFoundRoute from "./app/routes/NotFoundRoute";

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
    <RouterProvider router={router} />
  </HelmetProvider>
);
  
