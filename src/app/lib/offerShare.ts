/** How a visitor shared an offer; sent as the `method` of the share event. */
export type ShareMethod = "native" | "facebook" | "whatsapp" | "email" | "copy_link";

export type ShareTarget = {
  url: string;
  title: string;
};

/** Link-based share destinations that open in a new window or the mail app. */
export function shareLinks({ url, title }: ShareTarget): Record<"facebook" | "whatsapp" | "email", string> {
  const encodedUrl = encodeURIComponent(url);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(`Ajánlat: ${title}`)}&body=${encodeURIComponent(
      `Szia!\n\nEzt az utat találtam az Adria Holiday oldalán, szerintem tetszeni fog:\n\n${title}\n${url}`,
    )}`,
  };
}
