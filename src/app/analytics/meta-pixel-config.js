export function isMetaPixelEnabled(config) {
  return Boolean(
    config &&
      config.enabled === true &&
      config.marketingConsent === true &&
      typeof config.pixelId === "string" &&
      config.pixelId.trim() !== "",
  );
}
