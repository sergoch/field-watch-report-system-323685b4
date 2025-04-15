
import { DateRange } from "react-day-picker";
import { TimeFrame } from ".";
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export function formatDateForQuery(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
}

export function getDateRangeFromTimeFrame(
  timeFrame: TimeFrame,
  customRange?: DateRange
): { from: Date; to: Date } {
  const today = new Date();
  
  if (timeFrame === "custom" && customRange?.from && customRange?.to) {
    return {
      from: customRange.from,
      to: customRange.to
    };
  }
  
  switch (timeFrame) {
    case "day":
      return {
        from: today,
        to: today
      };
    case "week":
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 })
      };
    case "month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case "year":
      return {
        from: startOfYear(today),
        to: endOfYear(today)
      };
    case "7days":
      return {
        from: subDays(today, 6),
        to: today
      };
    case "30days":
      return {
        from: subDays(today, 29),
        to: today
      };
    case "90days":
      return {
        from: subDays(today, 89),
        to: today
      };
    default:
      return {
        from: subDays(today, 29),
        to: today
      };
  }
}
