
import { DateRange } from "react-day-picker";
import { TimeFrame } from "@/utils/dashboard/types";
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardFiltersProps {
  timeFrame: TimeFrame;
  dateRange: DateRange | undefined;
  onTimeFrameChange: (value: TimeFrame) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DashboardFilters({
  timeFrame,
  dateRange,
  onTimeFrameChange,
  onDateRangeChange
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Tabs 
        defaultValue={timeFrame} 
        onValueChange={(v) => onTimeFrameChange(v as TimeFrame)} 
        className="w-[240px]"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
      <DatePickerWithRange 
        dateRange={dateRange} 
        setDateRange={onDateRangeChange}
      />
    </div>
  );
}
