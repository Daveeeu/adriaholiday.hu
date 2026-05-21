import { Outlet, ScrollRestoration } from "react-router";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";

export default function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <MobileNav />
      <Outlet />
      <Footer />
    </>
  );
}

