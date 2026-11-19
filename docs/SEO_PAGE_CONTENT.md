# Crawlable page content

The public site is a single-page app: without JavaScript its HTML holds only the head Laravel writes (`SeoHeadRenderer`). Google renders JavaScript, but most AI assistants' crawlers (ChatGPT, Perplexity, Claude) and many link preview tools do not, so they found no text on any page.

## What is served

`PortfolioSpaController` also writes each page's text and links into `<div id="root">` (`SeoBodyRenderer`):

- an `<h1>` and the page's own text: a trip's route, description, starting price and program; a region's, location's, apartment's, post's or CMS page's text;
- the links the page lists: a category's or region's trips (with route, next date and starting price), a location's apartments, the latest blog posts, the home page's categories, featured trips and apartment locations, a trip's dates and categories;
- on every page, the main menu and the office's contact details (address, phones, email, opening hours).

`PortfolioSeoResolver` builds it with `PortfolioSeoBodies`, from the same queries the app's pages use (`PortfolioOfferQuery`), so it lists what visitors see. Listings stop at 100 links. 404 pages and redirects carry none.

The home page also answers its frequently asked questions: the published `home.faq.items` content block (`PortfolioFaq`), as text and as `FAQPage` structured data.

## Structured data for maps and assistants

- **Home page (`TravelAgency`):** the office address as a `PostalAddress`, its coordinates (`CompanyContact::OFFICE_COORDINATES`, update them when the office moves), the opening hours setting read into `openingHoursSpecification` (`OpeningHoursSpecification`: "Hétfő–Péntek: 08:00–17:00" lines; closed days are left out), and Hungary as the area served.
- **Trip page (`TouristTrip`):** one `Offer` per upcoming, not cancelled date with its own price (the trip's starting price when the date has none), `SoldOut` once it is full, valid until departure. A trip without dates keeps a single offer at its starting price.

## /llms.txt

`/llms.txt` (`LlmsTxtController`, `LlmsTxtRenderer`) is the home page's crawlable content as Markdown, following llmstxt.org: the office's description, categories, featured trips, apartment locations, questions, menu and contact details, with absolute links. Only the canonical host serves it.

## Visitors never see it

An inline script in the head marks the document as scripted (`html.js`) before the body renders, and `.js [data-seo-content]` is hidden. The app replaces the root's content when it starts (`createRoot().render`). The served text is the same content the app shows, so it is not cloaking.

## Changing it

When a page in the app gets new content that matters for search (a new section, a new listing), add it to the page's builder in `PortfolioSeoBodies` and to `PortfolioCrawlableContentTest`.
