import AboutDifference from "../components/about/AboutDifference";
import AboutGroups from "../components/about/AboutGroups";
import AboutHero from "../components/about/AboutHero";
import AboutIntro from "../components/about/AboutIntro";
import AboutLetters from "../components/about/AboutLetters";
import AboutTeam from "../components/about/AboutTeam";
import AboutTimeline from "../components/about/AboutTimeline";
import AboutValues from "../components/about/AboutValues";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";

const PATH = "/rolunk";
const TITLE = "Rólunk";
const DESCRIPTION =
  "Az Adria Holiday 2003 óta szervez európai kulturális körutazásokat és tengerparti nyaralásokat: gondosan kiválasztott szállások, felkészült idegenvezetők és újszerű autóbuszok.";

export default function AboutRoute() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonicalPath={PATH}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: TITLE, item: absoluteUrl(PATH) },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
          },
        ]}
      />
      <AboutHero />
      <AboutIntro />
      <AboutTimeline />
      <AboutDifference />
      <AboutTeam />
      <AboutLetters />
      <AboutGroups />
      <AboutValues />
    </div>
  );
}
