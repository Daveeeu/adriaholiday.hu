// Must match ResizedImageService::WIDTHS and its source extensions on the backend.
const WIDTHS = [400, 800, 1200, 1920] as const;
const RESIZABLE_PATH = /^\/storage\/(.+\.(?:jpe?g|png|webp))$/i;

export type ResponsiveImageProps = {
  src: string;
  srcSet?: string;
};

/**
 * Turns an image URL into src/srcSet props, so the browser downloads a
 * web-sized copy that fits the rendered size instead of the original upload.
 * Media library uploads are served as WebP by /img; Unsplash sizes via its URL.
 */
export function responsiveImage(url: string | null | undefined): ResponsiveImageProps {
  const src = url ?? "";
  const parsed = parse(src);

  if (!parsed) {
    return { src };
  }

  const storagePath = parsed.origin === window.location.origin ? RESIZABLE_PATH.exec(parsed.pathname)?.[1] : undefined;

  if (storagePath) {
    return {
      src,
      srcSet: WIDTHS.map((width) => `/img/${width}/${storagePath}.webp ${width}w`).join(", "),
    };
  }

  if (parsed.hostname === "images.unsplash.com") {
    return {
      src,
      srcSet: WIDTHS.map((width) => `${unsplashAtWidth(parsed, width)} ${width}w`).join(", "),
    };
  }

  return { src };
}

function parse(url: string): URL | null {
  if (url === "" || url.startsWith("data:") || url.startsWith("blob:")) {
    return null;
  }

  try {
    return new URL(url, window.location.origin);
  } catch {
    return null;
  }
}

function unsplashAtWidth(url: URL, width: number): string {
  const sized = new URL(url.toString());
  sized.searchParams.set("w", String(width));
  sized.searchParams.set("auto", "format");
  sized.searchParams.set("q", "75");
  sized.searchParams.delete("fm");

  return sized.toString();
}
