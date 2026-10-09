/** A dialable link for a phone number as written on the site ("+36 46 508 688"). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

/** Every office number, one per line in the admin; the main number while the list is empty. */
export function parsePhoneNumbers(phones: string, mainPhone: string): string[] {
  const numbers = [...new Set(phones.split(/\r?\n/).map((number) => number.trim()).filter(Boolean))];

  if (numbers.length > 0) {
    return numbers;
  }

  return mainPhone.trim() !== "" ? [mainPhone.trim()] : [];
}
