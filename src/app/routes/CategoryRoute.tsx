import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import CategoryOffersPage from "../components/CategoryOffersPage";
import { useAnalytics } from "../analytics/useAnalytics";
import { fetchPortfolioHomepageOffers } from "../content/portfolio-homepage-offers-api";
import Seo from "../seo/Seo";

export default function CategoryRoute() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { trackEvent } = useAnalytics();
  const [portfolioCategory, setPortfolioCategory] = useState<{
    title: string;
    subtitle: string;
    heroImage: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioHomepageOffers()
      .then((response) => {
        if (cancelled) return;
        const card = response.items.find((item) => {
          const link = item.link || `/kategoriak/${item.seoName}`;
          return link.endsWith(`/${categorySlug}`) || item.seoName === categorySlug;
        });

        if (!card) {
          setPortfolioCategory(null);
          return;
        }

        setPortfolioCategory({
          title: card.name,
          subtitle:
            card.shortDescription ??
            "Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt.",
          heroImage: card.image?.url
            ? card.image.url
            : "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1600x900;",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setPortfolioCategory(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) {
      return;
    }

    trackEvent("category_view", {
      entity: {
        type: "category",
        slug: categorySlug,
      },
      metadata: {
        title: portfolioCategory?.title,
      },
    });
  }, [categorySlug, portfolioCategory?.title, trackEvent]);

  const seoCategory = portfolioCategory;
  const canonicalPath = categorySlug ? `/kategoriak/${categorySlug}` : "/utazasok";

  return (
    <>
      <Seo
        title={seoCategory?.title ?? "Utazások"}
        description={
          seoCategory?.subtitle ??
          "Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt."
        }
        canonicalPath={canonicalPath}
        ogImageUrl={seoCategory?.heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Főoldal",
              item: "https://adriaholiday.hu/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: seoCategory?.title ?? "Utazások",
              item: `https://adriaholiday.hu${canonicalPath}`,
            },
          ],
        }}
      />
      <CategoryOffersPage
        categorySlug={categorySlug ?? "korutazasok"}
        title={seoCategory?.title ?? "Utazások"}
        subtitle={
          seoCategory?.subtitle ??
          "Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt."
        }
        heroImage={seoCategory?.heroImage}
        onBack={() => {
          trackEvent("cta_click", {
            entity: {
              type: "category",
              slug: categorySlug ?? null,
            },
            metadata: {
              cta_name: "back_to_home",
              placement: "category_header",
            },
          });
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOfferSelect={(slug) => {
          trackEvent("cta_click", {
            entity: {
              type: "tour",
              slug,
            },
            metadata: {
              cta_name: "offer_select",
              placement: "category_listing",
              category_slug: categorySlug,
            },
          });
          navigate(`/ajanlat/${slug}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
