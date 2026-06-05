import {
  endOfMonth,
  format,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";

export function parseMonthParam(month?: string | null): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return parse(month, "yyyy-MM", new Date());
  }
  return new Date();
}

export function getMonthRange(reference: Date) {
  return {
    start: startOfMonth(reference),
    end: endOfMonth(reference),
    label: format(reference, "MMMM yyyy"),
    key: format(reference, "yyyy-MM"),
  };
}

export function getPreviousMonth(reference: Date) {
  return subMonths(reference, 1);
}
