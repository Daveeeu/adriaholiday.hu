
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles/index.css";
import RootLayout from "./app/routes/RootLayout";
import HomeRoute from "./app/routes/HomeRoute";
import StaticPage from "./app/routes/StaticPage";
import CategoryRoute from "./app/routes/CategoryRoute";
import TripRoute from "./app/routes/TripRoute";
import { HelmetProvider } from "react-helmet-async";

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
      { path: "kategoriak/:categorySlug", element: <CategoryRoute /> },
      { path: "ajanlat/:offerSlug", element: <TripRoute /> },
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
      {
        path: "*",
        element: (
          <StaticPage
            title="Az oldal nem található"
            canonicalPath="/"
            noIndex
          />
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);
  
