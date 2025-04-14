
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { TimeFrame } from "./types";

export const getDateRangeFromTimeFrame = (timeFrame: TimeFrame, customDateRange?: DateRange): DateRange => {
  const today = new Date();
  
  switch (timeFrame) {
    case "day":
      return {
        from: startOfDay(today),
        to: endOfDay(today)
      };
    case "week":
      return {
        from: startOfWeek(today),
        to: endOfWeek(today)
      };
    case "month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case "custom":
      return customDateRange || { from: undefined, to: undefined };
    default:
      return { from: undefined, to: undefined };
  }
};

export const formatDateForQuery = (date: Date | undefined): string | null => {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
};
