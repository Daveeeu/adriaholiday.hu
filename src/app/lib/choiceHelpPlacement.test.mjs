import test from "node:test";
import assert from "node:assert/strict";

import { choiceHelpBannerIndex } from "./choiceHelpPlacement.ts";

test("the banner follows the first batch when a full row comes after it", () => {
  assert.equal(choiceHelpBannerIndex(12, 15), 11);
  assert.equal(choiceHelpBannerIndex(12, 40), 11);
});

test("a short list keeps its last cards above the banner", () => {
  assert.equal(choiceHelpBannerIndex(12, 13), 12);
  assert.equal(choiceHelpBannerIndex(12, 14), 13);
  assert.equal(choiceHelpBannerIndex(12, 12), 11);
  assert.equal(choiceHelpBannerIndex(12, 5), 4);
});

test("no results hide the banner", () => {
  assert.equal(choiceHelpBannerIndex(12, 0), -1);
});
