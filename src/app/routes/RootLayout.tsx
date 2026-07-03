import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import { AnalyticsProvider } from "../analytics/analytics-provider";
import { PortfolioContentProvider } from "../content/PortfolioContentProvider";
import { SiteSettingsProvider } from "../site-settings/SiteSettingsProvider";
import LoadingScreen from "../components/LoadingScreen";

export default function RootLayout() {
  const location = useLocation();
  const isHome =
    location.pathname === "/" ||
    location.pathname === "/utazasok" ||
    location.pathname === "/portfolio";

  return (
    <>
      <ScrollRestoration />
      <AnalyticsProvider>
        <SiteSettingsProvider>
          <PortfolioContentProvider>
            <div className="hidden md:block">
              <Header />
            </div>
            <MobileNav />
            <div className={isHome ? "pt-0" : "pt-0 md:pt-[76px]"}>
              <Suspense fallback={<LoadingScreen />}>
                <Outlet />
              </Suspense>
            </div>
            <Footer />
          </PortfolioContentProvider>
        </SiteSettingsProvider>
      </AnalyticsProvider>
    </>
  );
}
