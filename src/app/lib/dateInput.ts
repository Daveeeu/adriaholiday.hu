/**
 * Upper bound for <input type="date">: without it browsers accept six-digit
 * years, with it the year segment takes at most four digits.
 */
export const DATE_INPUT_MAX = "9999-12-31";
