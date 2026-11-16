import test from "node:test";
import assert from "node:assert/strict";

import { SCROLL_POSITIONS_STORAGE_KEY, forgetPageLoadScrollPosition } from "./scrollRestoration.ts";

function storageWith(value) {
  const items = new Map(value === undefined ? [] : [[SCROLL_POSITIONS_STORAGE_KEY, value]]);

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, next) => items.set(key, next),
    removeItem: (key) => items.delete(key),
    saved: () => items.get(SCROLL_POSITIONS_STORAGE_KEY),
  };
}

test("a page load forgets the previous page load's position", () => {
  const storage = storageWith(JSON.stringify({ default: 8859, hx9gqv2y: 412 }));

  forgetPageLoadScrollPosition(() => storage);

  assert.deepEqual(JSON.parse(storage.saved()), { hx9gqv2y: 412 });
});

test("positions of entries visited within the site are kept", () => {
  const storage = storageWith(JSON.stringify({ hx9gqv2y: 412 }));

  forgetPageLoadScrollPosition(() => storage);

  assert.deepEqual(JSON.parse(storage.saved()), { hx9gqv2y: 412 });
});

test("nothing saved yet stays empty", () => {
  const storage = storageWith(undefined);

  forgetPageLoadScrollPosition(() => storage);

  assert.equal(storage.saved(), undefined);
});

test("blocked storage is left alone", () => {
  assert.doesNotThrow(() =>
    forgetPageLoadScrollPosition(() => {
      throw new Error("SecurityError");
    }),
  );
});

test("unreadable positions are dropped", () => {
  const storage = storageWith("{not json");

  forgetPageLoadScrollPosition(() => storage);

  assert.equal(storage.saved(), undefined);
});
