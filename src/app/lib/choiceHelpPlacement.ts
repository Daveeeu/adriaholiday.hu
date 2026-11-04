/** Fewer cards than this after the banner would sit cut off from the list, under it. */
const MIN_CARDS_BELOW_BANNER = 3;

/**
 * Index of the result card the choice help banner follows: the end of the first
 * batch, or the last card of the whole list when only a few cards would follow it.
 * Counted against the total, not the loaded cards, so a later batch never lands
 * a lone card under the banner. -1 hides the banner.
 */
export function choiceHelpBannerIndex(afterCardCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return -1;
  }

  const cardsBelow = totalCount - afterCardCount;

  return cardsBelow >= MIN_CARDS_BELOW_BANNER ? afterCardCount - 1 : totalCount - 1;
}
