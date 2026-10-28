/** How a trip travels, in words: "Autóbusz" or "Repülő"; another stored value as it is. */
export function transportLabel(value?: string | null): string | null {
  const transport = value?.trim();

  if (!transport) {
    return null;
  }

  if (transport === "bus") {
    return "Autóbusz";
  }

  if (transport === "plane") {
    return "Repülő";
  }

  return transport;
}
