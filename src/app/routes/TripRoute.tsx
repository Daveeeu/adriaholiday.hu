import { useNavigate, useParams } from "react-router";
import TripDetailPage from "../components/TripDetailPage";
import { getOfferBySlug } from "../data/offers";
import StaticPage from "./StaticPage";

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
    <TripDetailPage
      trip={offer}
      onBack={() => {
        navigate(-1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

