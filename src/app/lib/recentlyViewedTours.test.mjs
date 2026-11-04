import test from "node:test";
import assert from "node:assert/strict";

import { withViewedTour } from "./recentlyViewedTours.ts";

test("the latest view comes first, without repeating a tour", () => {
  assert.deepEqual(withViewedTour(["london", "zakopane"], "zakopane"), ["zakopane", "london"]);
  assert.deepEqual(withViewedTour([], "albania"), ["albania"]);
});

test("only the most recent views are kept", () => {
  assert.deepEqual(withViewedTour(["b", "c", "d"], "a", 3), ["a", "b", "c"]);
});
