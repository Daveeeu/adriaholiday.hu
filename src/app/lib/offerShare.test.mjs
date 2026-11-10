import test from "node:test";
import assert from "node:assert/strict";

import { shareLinks } from "./offerShare.ts";

const target = { url: "https://adriaholiday.hu/ajanlat/albania-csillagtura", title: "Albánia & Montenegró" };

test("facebook shares the offer url", () => {
  assert.equal(
    shareLinks(target).facebook,
    "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fadriaholiday.hu%2Fajanlat%2Falbania-csillagtura",
  );
});

test("whatsapp and e-mail carry the title and the url, encoded", () => {
  const links = shareLinks(target);
  const whatsappText = new URL(links.whatsapp).searchParams.get("text");

  assert.equal(whatsappText, `${target.title}\n${target.url}`);
  const email = new URLSearchParams(links.email.replace(/^mailto:\?/, ""));

  assert.match(links.email, /^mailto:\?subject=/);
  assert.equal(email.get("subject"), "Ajánlat: Albánia & Montenegró");
  assert.ok(email.get("body").includes(`${target.title}\n${target.url}`));
});
