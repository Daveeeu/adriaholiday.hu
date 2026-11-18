/**
 * The days the Christmas easter egg is on: every year from 15 November to
 * Epiphany (6 January), in Hungarian time. The backend gives the gift box
 * coupon for the same days (backend/app/Support/Booking/ChristmasCoupon.php).
 */
const STARTS_ON = { month: 11, day: 15 };
const ENDS_ON = { month: 1, day: 6 };

const budapestMonthDay = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  timeZone: "Europe/Budapest",
});

export function isChristmasSeason(now: Date): boolean {
  const parts = budapestMonthDay.formatToParts(now);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const afterStart = month > STARTS_ON.month || (month === STARTS_ON.month && day >= STARTS_ON.day);
  const beforeEnd = month < ENDS_ON.month || (month === ENDS_ON.month && day <= ENDS_ON.day);

  return afterStart || beforeEnd;
}
