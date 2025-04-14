
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  // Initialize with last 30 days date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Mock data for charts
  const workerData = [
    { name: 'North', value: 28 },
    { name: 'South', value: 35 },
    { name: 'East', value: 22 },
    { name: 'West', value: 15 },
    { name: 'Central', value: 30 },
  ];

  const equipmentData = [
    { name: 'Excavator', value: 8 },
    { name: 'Bulldozer', value: 6 },
    { name: 'Crane', value: 4 },
    { name: 'Truck', value: 12 },
    { name: 'Loader', value: 5 },
    { name: 'Other', value: 10 },
  ];

  const fuelData = [
    { name: 'North', diesel: 850, gasoline: 200 },
    { name: 'South', diesel: 740, gasoline: 180 },
    { name: 'East', diesel: 620, gasoline: 150 },
    { name: 'West', diesel: 540, gasoline: 120 },
    { name: 'Central', diesel: 780, gasoline: 210 },
  ];

  const salaryData = [
    { name: 'North', workers: 8500, operators: 3500 },
    { name: 'South', workers: 7400, operators: 3200 },
    { name: 'East', workers: 6200, operators: 2800 },
    { name: 'West', workers: 5400, operators: 2300 },
    { name: 'Central', workers: 7800, operators: 3600 },
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Get date range text
  const getDateRangeText = () => {
    if (!dateRange?.from) {
      return "Select a date range";
    }
    
    if (!dateRange.to) {
      return `From ${format(dateRange.from, "PPP")}`;
    }
    
    return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Visualize and analyze field operations data
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Analytics Dashboard</CardTitle>
            <DatePickerWithRange 
              dateRange={dateRange} 
              setDateRange={setDateRange}
            />
          </div>
          <CardDescription>
            {getDateRangeText()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workers" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="fuel">Fuel Usage</TabsTrigger>
              <TabsTrigger value="salary">Salaries</TabsTrigger>
            </TabsList>
            
            {/* Workers Chart */}
            <TabsContent value="workers" className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workerData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {workerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Equipment Chart */}
            <TabsContent value="equipment" className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {equipmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Fuel Usage Chart */}
            <TabsContent value="fuel" className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fuelData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Liters', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="diesel" name="Diesel" fill="#0088FE" />
                    <Bar dataKey="gasoline" name="Gasoline" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Salary Chart */}
            <TabsContent value="salary" className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salaryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'GEL', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value} GEL`} />
                    <Legend />
                    <Bar dataKey="workers" name="Workers Salary" fill="#8884d8" />
                    <Bar dataKey="operators" name="Operators Salary" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
