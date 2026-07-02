import test from "node:test";
import assert from "node:assert/strict";

import { isMetaPixelEnabled } from "./meta-pixel-config.js";

test("pixel config disabled does not enable pixel loading", () => {
  assert.equal(
    isMetaPixelEnabled({
      enabled: false,
      marketingConsent: true,
      pixelId: "123456789",
    }),
    false,
  );

  assert.equal(
    isMetaPixelEnabled({
      enabled: true,
      marketingConsent: false,
      pixelId: "123456789",
    }),
    false,
  );

  assert.equal(
    isMetaPixelEnabled({
      enabled: true,
      marketingConsent: true,
      pixelId: "",
    }),
    false,
  );
});
