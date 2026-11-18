export type UrgencyMessage = { title: string; text: string };

/**
 * What the trip page's urgency toast says about the selected date: that its
 * seats are running low (at most 35% of them free), and the last seats
 * discount a booking now gets; null otherwise.
 */
export function urgencyMessage({
  seatsRunningLow,
  seatsLeft,
  discountPercent = null,
}: {
  seatsRunningLow: boolean;
  seatsLeft: number | null;
  discountPercent?: number | null;
}): UrgencyMessage | null {
  if (seatsRunningLow && seatsLeft !== null && seatsLeft > 0) {
    const seats = `Erre az időpontra már csak ${seatsLeft} szabad hely maradt.`;

    return {
      title: "Fogynak a helyek!",
      text: discountPercent ? `${seats} Ha most foglalsz, ${discountPercent}% kedvezményt adunk a részvételi díjból.` : seats,
    };
  }

  return null;
}
