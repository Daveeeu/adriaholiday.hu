import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";

export default function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/utazasok";

  return (
    <>
      <ScrollRestoration />
      <div className="hidden md:block">
        <Header />
      </div>
      <MobileNav />
      <div className={isHome ? "pt-0" : "pt-0 md:pt-[76px]"}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
