
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles/index.css";
import RootLayout from "./app/routes/RootLayout";
import HomeRoute from "./app/routes/HomeRoute";
import StaticPage from "./app/routes/StaticPage";
import CategoryRoute from "./app/routes/CategoryRoute";
import TripRoute from "./app/routes/TripRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: "utazasok", element: <HomeRoute /> },
      { path: "kategoriak/:categorySlug", element: <CategoryRoute /> },
      { path: "ajanlat/:offerSlug", element: <TripRoute /> },
      { path: "rolunk", element: <StaticPage title="Rólunk" /> },
      { path: "kapcsolat", element: <StaticPage title="Kapcsolat" /> },
      { path: "aszf", element: <StaticPage title="ÁSZF" /> },
      { path: "adatvedelem", element: <StaticPage title="Adatvédelem" /> },
      { path: "impresszum", element: <StaticPage title="Impresszum" /> },
      { path: "sutik", element: <StaticPage title="Süti kezelés" /> },
      { path: "*", element: <StaticPage title="Az oldal nem található" /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
  
