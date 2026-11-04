import test from "node:test";
import assert from "node:assert/strict";

import { homepageCardRoute } from "./portfolio-offer-routing.ts";

test("a card linking to a category opens that category's page", () => {
  assert.equal(homepageCardRoute("/kategoriak/havas-kalandok"), "/kategoriak/havas-kalandok");
  assert.equal(homepageCardRoute("/kategoriak/korutazasok/?ref=home"), "/kategoriak/korutazasok");
  assert.equal(homepageCardRoute("adventi-barangolasok"), "/kategoriak/adventi-barangolasok");
});

test("a card linking to another page of the site keeps its path", () => {
  assert.equal(homepageCardRoute("/apartmanok/veneto/bibione"), "/apartmanok/veneto/bibione");
  assert.equal(homepageCardRoute(" /kapcsolat "), "/kapcsolat");
});
