import test from "node:test";
import assert from "node:assert/strict";

import { describeClick, reachedScrollThresholds } from "./interaction-events.js";

const origin = "https://adriaholiday.hu";

test("internal links are reported by label, section and path without the query", () => {
  assert.deepEqual(
    describeClick({ tagName: "A", text: "  Részletek \n megtekintése ", href: "/ajanlat/velence?utm_source=x", origin, section: "ajanlatok" }),
    { click_text: "Részletek megtekintése", click_element: "link", click_section: "ajanlatok", link_path: "/ajanlat/velence" },
  );
});

test("external links are reported by domain as outbound", () => {
  assert.deepEqual(describeClick({ tagName: "A", text: "Barion", href: "https://www.barion.com/hu/", origin, section: null }), {
    click_text: "Barion",
    click_element: "link",
    link_domain: "www.barion.com",
    outbound: true,
  });
});

test("buttons carry no link target and long labels are cut", () => {
  const click = describeClick({ tagName: "BUTTON", text: "x".repeat(200), href: null, origin, section: null });

  assert.equal(click.click_element, "button");
  assert.equal(click.click_text.length, 80);
  assert.equal(click.link_path, undefined);
});

test("contact links and unlabeled elements are not reported as ui clicks", () => {
  assert.equal(describeClick({ tagName: "A", text: "+36 1 234 5678", href: "tel:+3612345678", origin, section: null }), null);
  assert.equal(describeClick({ tagName: "A", text: "Írj nekünk", href: "mailto:info@adriaholiday.hu", origin, section: null }), null);
  assert.equal(describeClick({ tagName: "A", text: "WhatsApp", href: "https://wa.me/36301234567", origin, section: null }), null);
  assert.equal(describeClick({ tagName: "BUTTON", text: "   ", href: null, origin, section: null }), null);
});

test("scroll milestones follow the share of the page seen", () => {
  assert.deepEqual(reachedScrollThresholds(0, 1000, 4000), [25]);
  assert.deepEqual(reachedScrollThresholds(1000, 1000, 4000), [25, 50]);
  assert.deepEqual(reachedScrollThresholds(2600, 1000, 4000), [25, 50, 75, 90]);
});

test("short pages report no scroll milestones", () => {
  assert.deepEqual(reachedScrollThresholds(0, 1000, 1200), []);
});
