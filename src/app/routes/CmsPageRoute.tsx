import { useEffect, useState } from "react";
import { useParams } from "react-router";

import LoadingScreen from "../components/LoadingScreen";
import { fetchPortfolioPage, type PortfolioPage } from "../content/portfolio-pages-api";
import NotFoundRoute from "./NotFoundRoute";
import StaticPage from "./StaticPage";

type PageState = { status: "loading" } | { status: "missing" } | { status: "ready"; page: PortfolioPage };

/**
 * A text page the office publishes at its own address; any other single
 * segment address is not found.
 */
export default function CmsPageRoute() {
  const { pageSlug = "" } = useParams();
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchPortfolioPage(pageSlug)
      .then((page) => {
        if (!cancelled) setState(page ? { status: "ready", page } : { status: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });

    return () => {
      cancelled = true;
    };
  }, [pageSlug]);

  if (state.status === "loading") return <LoadingScreen />;
  if (state.status === "missing") return <NotFoundRoute />;

  return (
    <StaticPage
      title={state.page.title}
      canonicalPath={`/${state.page.slug}`}
      html={state.page.content ?? ""}
      description={state.page.seoDescription ?? undefined}
      seoTitle={state.page.seoTitle ?? undefined}
    />
  );
}
