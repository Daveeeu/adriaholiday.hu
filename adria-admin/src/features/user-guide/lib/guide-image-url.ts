/** Screenshots ship as static files next to the admin build (public/user-guide). */
export function guideImageUrl(file: string) {
  return `${import.meta.env.BASE_URL}guide-images/${file}.webp`;
}
