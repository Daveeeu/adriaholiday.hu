import { useNavigate, useParams } from "react-router";
import CategoryOffersPage from "../components/CategoryOffersPage";
import { offers } from "../data/offers";
import { getCategoryBySlug } from "../data/categories";
import Seo from "../seo/Seo";

export default function CategoryRoute() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);
  const canonicalPath = categorySlug ? `/kategoriak/${categorySlug}` : "/utazasok";

  return (
    <>
      <Seo
        title={category?.title ?? "Utazások"}
        description={
          category?.subtitle ??
          "Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt."
        }
        canonicalPath={canonicalPath}
        ogImageUrl={category?.heroImage}
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
              name: category?.title ?? "Utazások",
              item: `https://adriaholiday.hu${canonicalPath}`,
            },
          ],
        }}
      />
      <CategoryOffersPage
        categorySlug={categorySlug ?? "korutazasok"}
        offers={offers}
        onBack={() => {
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOfferSelect={(offer) => {
          if (offer.slug) {
            navigate(`/ajanlat/${offer.slug}`);
          } else {
            navigate("/utazasok");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
