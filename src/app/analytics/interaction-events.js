// Pure helpers behind useInteractionTracking (unit-tested in Node).

const SCROLL_THRESHOLDS = [25, 50, 75, 90];

// Contact links already have their own events (phone_click, email_click, whatsapp_click).
const CONTACT_LINK = /^(tel:|mailto:|https?:\/\/(wa\.me|api\.whatsapp\.com)\/)/i;

const MAX_TEXT_LENGTH = 80;

/**
 * The ui_click parameters for a clicked link or button, or null for clicks
 * that are reported elsewhere or carry no label. Internal links are reported
 * by path, external ones by domain; query strings (which may hold personal
 * data) are dropped.
 */
export function describeClick({ tagName, text, href, origin, section }) {
  if (href && CONTACT_LINK.test(href.trim())) {
    return null;
  }

  const label = (text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);

  if (label === "") {
    return null;
  }

  const click = { click_text: label, click_element: tagName.toLowerCase() === "a" ? "link" : "button" };

  if (section) {
    click.click_section = section;
  }

  if (href && !href.startsWith("#") && !/^javascript:/i.test(href)) {
    try {
      const url = new URL(href, origin);

      if (url.origin === origin) {
        click.link_path = url.pathname;
      } else {
        click.link_domain = url.hostname;
        click.outbound = true;
      }
    } catch {
      // An unparsable href is reported without its target.
    }
  }

  return click;
}

/**
 * The scroll milestones reached at a scroll position; pages that hardly need
 * scrolling report none, so short pages do not count as fully read.
 */
export function reachedScrollThresholds(scrollY, viewportHeight, pageHeight) {
  if (pageHeight <= viewportHeight * 1.25) {
    return [];
  }

  const percent = ((scrollY + viewportHeight) / pageHeight) * 100;

  return SCROLL_THRESHOLDS.filter((threshold) => percent >= threshold);
}
