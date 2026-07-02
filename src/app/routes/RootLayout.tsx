import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import { AnalyticsProvider } from "../analytics/analytics-provider";
import { PortfolioContentProvider } from "../content/PortfolioContentProvider";

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
        <PortfolioContentProvider>
          <div className="hidden md:block">
            <Header />
          </div>
          <MobileNav />
          <div className={isHome ? "pt-0" : "pt-0 md:pt-[76px]"}>
            <Outlet />
          </div>
          <Footer />
        </PortfolioContentProvider>
      </AnalyticsProvider>
    </>
  );
}
