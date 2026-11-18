import test from "node:test";
import assert from "node:assert/strict";

import { buildFeaturedOfferFilters } from "./featured-offer-filters.ts";

const tour = (id, transport, categories) => ({ id, transport, categories });

test("the school trip category gets no chip, other categories do", () => {
  const tours = [
    tour(1, "bus", [{ id: "1", label: "Körutazások" }, { id: "21", label: "Osztálykirándulások" }]),
    tour(2, "bus", [{ id: "3", label: "Tengerpartok" }]),
    tour(3, "plane", []),
  ];

  const labels = buildFeaturedOfferFilters(tours).map((filter) => filter.label);

  assert.ok(!labels.includes("Osztálykirándulások"));
  assert.ok(labels.includes("Tengerpartok"));
});

test("a chip that selects the same tours as an earlier one is left out", () => {
  const tours = [
    tour(1, "bus", [{ id: "1", label: "Körutazások" }]),
    tour(2, "plane", [{ id: "3", label: "Tengerpartok" }]),
  ];

  const labels = buildFeaturedOfferFilters(tours).map((filter) => filter.label);

  assert.deepEqual(labels, ["Összes ajánlat", "Autóbuszos utak", "Repülős utak"]);
});
