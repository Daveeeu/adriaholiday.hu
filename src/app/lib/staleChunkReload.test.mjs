import test from "node:test";
import assert from "node:assert/strict";

import { shouldReloadForStaleChunk } from "./staleChunkReload.ts";

test("a stale tab reloads once", () => {
  assert.equal(shouldReloadForStaleChunk(null, 1_000_000), true);
  assert.equal(shouldReloadForStaleChunk(1_000_000, 1_000_000 + 60_000), true);
});

test("a failure right after the reload is not reloaded again", () => {
  assert.equal(shouldReloadForStaleChunk(1_000_000, 1_000_000 + 5_000), false);
});
