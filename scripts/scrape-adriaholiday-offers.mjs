import * as cheerio from "cheerio";
import fs from "node:fs/promises";

const BASE_URL = "https://adriaholiday.hu/";

const COUNTRY_LIST_URLS = [
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/albania",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/ausztria",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/bosznia-hercegovina",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/csehorszag",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/erdely",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/franciaorszag",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/gruzia",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/hollandia",
  "https://adriaholiday.hu/korutazasok/csoport/korutazas/horvatorszag",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function absolutizeUrl(possiblyRelativeUrl) {
  if (!possiblyRelativeUrl) return null;
  try {
    return new URL(possiblyRelativeUrl, BASE_URL).toString();
  } catch {
    return null;
  }
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; adriaholiday.hu-scraper/1.0; +https://adriaholiday.hu/)",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return await res.text();
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function parsePriceToNumber(priceText) {
  const digits = priceText.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function parseListingPage(html, sourceUrl) {
  const $ = cheerio.load(html);
  const items = [];

  const $cards = $("section.tours1 .item");
  $cards.each((_, el) => {
    const $el = $(el);
    const $firstLink = $el.find('a[href^="korutazasok/"]').first();
    const detailPath = $firstLink.attr("href") || null;

    const title = cleanText(
      $el.find("h5 a").first().clone().children().remove().end().text()
    );

    const image = absolutizeUrl($el.find("img").first().attr("src"));
    const priceText = cleanText($el.find("span.category span").first().text());

    const dateText = cleanText(
      $el
        .find(".facilities ul li")
        .filter((_, li) => $(li).text().includes("202"))
        .first()
        .text()
    );

    const transport = cleanText(
      $el.find(".facilities .fa-bus, .facilities .fa-plane")
        .first()
        .closest("li")
        .text()
    );

    const hotel = cleanText(
      $el.find(".facilities .ti-home").first().closest("li").text()
    );

    const meals = cleanText(
      $el.find(".facilities .fa-cutlery").first().closest("li").text()
    );

    if (!detailPath || !title) return;

    items.push({
      sourceUrl,
      detailUrl: absolutizeUrl(detailPath),
      detailPath,
      title,
      image,
      priceText: priceText || null,
      priceNumber: priceText ? parsePriceToNumber(priceText) : null,
      dateText: dateText || null,
      transport: transport || null,
      hotel: hotel || null,
      meals: meals || null,
    });
  });

  return items;
}

function parseDetailPage(html, detailUrl) {
  const $ = cheerio.load(html);

  const title =
    cleanText($("h1").first().text()) || cleanText($("title").text()) || null;

  const metaDescription = $("meta[name='description']").attr("content")?.trim();
  const headerSubtitle = cleanText(
    $(".header-content-inner p").first().text() || ""
  );
  const firstProgramText = cleanText(
    $(".program-content")
      .find("p")
      .first()
      .text()
      .slice(0, 300) || ""
  );

  const description =
    metaDescription ||
    (headerSubtitle ? headerSubtitle : null) ||
    (firstProgramText ? firstProgramText : null);

  const canonical = $("link[rel='canonical']").attr("href") || null;

  const ogImage =
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='og:image']").attr("content") ||
    null;

  const firstGalleryImage =
    $("#sync1 img").first().attr("src") ||
    $(".popup-gallery img").first().attr("src") ||
    null;

  const heroImage = absolutizeUrl(ogImage || firstGalleryImage);

  return {
    detailUrl,
    title,
    description,
    canonical,
    heroImage,
  };
}

async function main() {
  const allListingItems = [];

  for (const url of COUNTRY_LIST_URLS) {
    console.log(`LIST: ${url}`);
    const html = await fetchHtml(url);
    const items = parseListingPage(html, url);
    allListingItems.push(...items);
    await sleep(500);
  }

  const byDetailUrl = new Map();
  for (const item of allListingItems) {
    if (!byDetailUrl.has(item.detailUrl)) {
      byDetailUrl.set(item.detailUrl, item);
    }
  }

  const unique = [...byDetailUrl.values()];
  console.log(`Unique offers: ${unique.length}`);

  const results = [];

  for (const item of unique) {
    console.log(`DETAIL: ${item.detailUrl}`);
    let detail = null;
    try {
      const html = await fetchHtml(item.detailUrl);
      detail = parseDetailPage(html, item.detailUrl);
    } catch (error) {
      detail = { detailUrl: item.detailUrl, error: String(error) };
    }

    results.push({
      ...item,
      detail,
    });

    await sleep(500);
  }

  results.sort((a, b) => a.title.localeCompare(b.title, "hu"));

  const outPath = new URL("../src/app/data/offers.scraped.json", import.meta.url);
  await fs.mkdir(new URL("../src/app/data", import.meta.url), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify({ scrapedAt: new Date().toISOString(), results }, null, 2), "utf8");

  console.log(`Wrote: ${outPath.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
