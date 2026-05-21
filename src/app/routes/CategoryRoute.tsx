import { useNavigate, useParams } from "react-router";
import CategoryOffersPage from "../components/CategoryOffersPage";
import { offers } from "../data/offers";

export default function CategoryRoute() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  return (
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
  );
}
