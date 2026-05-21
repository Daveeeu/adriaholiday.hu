import { useNavigate, useParams } from "react-router";
import TripDetailPage from "../components/TripDetailPage";
import { getOfferBySlug } from "../data/offers";
import StaticPage from "./StaticPage";
import Seo from "../seo/Seo";

export default function TripRoute() {
  const navigate = useNavigate();
  const { offerSlug } = useParams();
  const offer = getOfferBySlug(offerSlug);

  if (!offer) {
    return (
      <StaticPage title="Az ajánlat nem található">
        <p>A keresett ajánlat nem létezik vagy már nem elérhető.</p>
      </StaticPage>
    );
  }

  return (
    <>
      <Seo
        title={offer.title}
        description={
          offer.shortDescription ??
          `${offer.country} | ${offer.duration ?? "Utazás"} | ${offer.price}`
        }
        canonicalPath={`/ajanlat/${offer.slug}`}
        ogImageUrl={offer.image}
        ogType="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: offer.title,
          image: [offer.image],
          description:
            offer.shortDescription ??
            `${offer.country} | ${offer.duration ?? "Utazás"} | ${offer.price}`,
          brand: { "@type": "Brand", name: "Adria Holiday" },
          offers: {
            "@type": "Offer",
            priceCurrency: "HUF",
            price: offer.priceNumber,
            availability: "https://schema.org/InStock",
            url: `https://adriaholiday.hu/ajanlat/${offer.slug}`,
          },
        }}
      />
      <TripDetailPage
        trip={offer}
        onBack={() => {
          navigate(-1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
