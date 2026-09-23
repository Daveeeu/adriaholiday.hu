import { useEffect } from "react";
import { useNavigate } from "react-router";

import CategoryOffersPage from "../components/CategoryOffersPage";
import { useAnalytics } from "../analytics/useAnalytics";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";

const TITLE = "Utazások";
const SUBTITLE = "Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt.";
const HERO_IMAGE = "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1600x900;";
const CANONICAL_PATH = "/utazasok";

export default function TravelsRoute() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent("category_view", {
      entity: {
        type: "offer_list",
        slug: null,
      },
      metadata: {
        title: TITLE,
      },
    });
  }, [trackEvent]);

  return (
    <>
      <Seo
        title={TITLE}
        description={SUBTITLE}
        canonicalPath={CANONICAL_PATH}
        ogImageUrl={HERO_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: SUBTITLE,
            url: absoluteUrl(CANONICAL_PATH),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Főoldal",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: TITLE,
                item: absoluteUrl(CANONICAL_PATH),
              },
            ],
          },
        ]}
      />
      <CategoryOffersPage
        title={TITLE}
        subtitle={SUBTITLE}
        heroImage={HERO_IMAGE}
        onBack={() => {
          trackEvent("cta_click", {
            entity: {
              type: "offer_list",
              slug: null,
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
            },
          });
          navigate(`/ajanlat/${slug}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
