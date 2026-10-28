import test from "node:test";
import assert from "node:assert/strict";

import { routeNamedIn, routeStops } from "./tripRoute.ts";

test("a route splits into its stops at hyphens and commas", () => {
  assert.deepEqual(routeStops("Firenze - Siena - Bologna"), ["Firenze", "Siena", "Bologna"]);
  assert.deepEqual(routeStops("Nápoly-Amalfi-Positano"), ["Nápoly", "Amalfi", "Positano"]);
  assert.deepEqual(routeStops("Herkulesfürdő - Bukarest"), ["Herkulesfürdő", "Bukarest"]);
  assert.deepEqual(routeStops(null), []);
});

test("a route the title already names is recognised, also with suffixes and without accents", () => {
  assert.equal(routeNamedIn(["Firenze", "Siena", "Bologna"], "Reneszánsz advent Toszkánában Firenze, Siena és Bologna fényei"), true);
  assert.equal(routeNamedIn(["Zakopane"], "Advent Zakopaneban 1 nap"), true);
  assert.equal(routeNamedIn(["Canterbury", "London"], "London a királyok városa"), false);
  assert.equal(routeNamedIn([], "London"), false);
});
