
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Minus, UserPlus, Truck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function NewReportPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<{id: string, fuelAmount: number}[]>([]);
  const [regions, setRegions] = useState<{ id: string, name: string }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [materialsReceived, setMaterialsReceived] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // States for available workers and equipment
  const [availableWorkers, setAvailableWorkers] = useState<{ id: string, fullName: string, dailySalary: number }[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<{ id: string, type: string, licensePlate: string }[]>([]);

  // Fetch regions, workers, and equipment on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regions
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('id, name')
          .order('name');
          
        if (regionError) {
          console.error('Error fetching regions:', regionError);
          toast({
            title: "Error",
            description: "Could not load regions. Please try again later.",
            variant: "destructive",
          });
        } else if (regionData) {
          setRegions(regionData);
          // If user has an assigned region, pre-select it
          if (user?.regionId) {
            setSelectedRegion(user.regionId);
          } else if (regionData.length > 0) {
            setSelectedRegion(regionData[0].id);
          }
        }
        
        // Fetch workers
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('id, full_name, daily_salary')
          .order('full_name');
          
        if (workerError) {
          console.error('Error fetching workers:', workerError);
        } else if (workerData) {
          setAvailableWorkers(workerData.map(worker => ({
            id: worker.id,
            fullName: worker.full_name,
            dailySalary: worker.daily_salary
          })));
        }
        
        // Fetch equipment
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, type, license_plate')
          .order('type');
          
        if (equipmentError) {
          console.error('Error fetching equipment:', equipmentError);
        } else if (equipmentData) {
          setAvailableEquipment(equipmentData.map(equip => ({
            id: equip.id,
            type: equip.type,
            licensePlate: equip.license_plate
          })));
        }
      } catch (err) {
        console.error('Exception when fetching data:', err);
      }
    };

    fetchData();
  }, [user, toast]);

  const addWorker = (workerId: string) => {
    if (!selectedWorkers.includes(workerId)) {
      setSelectedWorkers([...selectedWorkers, workerId]);
    }
  };

  const removeWorker = (workerId: string) => {
    setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
  };

  const addEquipment = (equipmentId: string) => {
    if (!selectedEquipment.some(item => item.id === equipmentId)) {
      setSelectedEquipment([...selectedEquipment, { id: equipmentId, fuelAmount: 0 }]);
    }
  };

  const removeEquipment = (equipmentId: string) => {
    setSelectedEquipment(selectedEquipment.filter(item => item.id !== equipmentId));
  };

  const updateFuelAmount = (equipmentId: string, amount: number) => {
    setSelectedEquipment(selectedEquipment.map(item => 
      item.id === equipmentId ? { ...item, fuelAmount: amount } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRegion) {
      toast({
        title: "Region Required",
        description: "Please select a region for this report.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate totals
      const totalFuel = selectedEquipment.reduce((sum, item) => sum + item.fuelAmount, 0);
      const totalWorkerSalary = selectedWorkers.reduce((sum, workerId) => {
        const worker = availableWorkers.find(w => w.id === workerId);
        return sum + (worker?.dailySalary || 0);
      }, 0);
      
      // Format date for Supabase
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // 1. Insert the report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          date: formattedDate,
          region_id: selectedRegion,
          engineer_id: user.id,
          description,
          materials_used: materialsUsed,
          materials_received: materialsReceived,
          total_fuel: totalFuel,
          total_worker_salary: totalWorkerSalary
        })
        .select('id');
      
      if (reportError) {
        throw reportError;
      }
      
      const reportId = reportData[0].id;
      
      // 2. Insert worker relationships
      if (selectedWorkers.length > 0) {
        const workerRelations = selectedWorkers.map(workerId => ({
          report_id: reportId,
          worker_id: workerId
        }));
        
        const { error: workersError } = await supabase
          .from('report_workers')
          .insert(workerRelations);
          
        if (workersError) {
          console.error('Error inserting worker relations:', workersError);
        }
      }
      
      // 3. Insert equipment relationships
      if (selectedEquipment.length > 0) {
        const equipmentRelations = selectedEquipment.map(equip => ({
          report_id: reportId,
          equipment_id: equip.id,
          fuel_amount: equip.fuelAmount
        }));
        
        const { error: equipmentError } = await supabase
          .from('report_equipment')
          .insert(equipmentRelations);
          
        if (equipmentError) {
          console.error('Error inserting equipment relations:', equipmentError);
        }
      }
      
      toast({
        title: "Report Created",
        description: `Daily report for ${format(date, "PPP")} has been created.`,
      });
      
      navigate("/reports");
    } catch (error: any) {
      console.error("Error creating report:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to create the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const totalWorkers = selectedWorkers.length;
  const totalEquipment = selectedEquipment.length;
  const totalFuel = selectedEquipment.reduce((sum, item) => sum + item.fuelAmount, 0);
  const totalWorkerSalary = selectedWorkers.reduce((sum, workerId) => {
    const worker = availableWorkers.find(w => w.id === workerId);
    return sum + (worker?.dailySalary || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Daily Report</h1>
        <p className="text-muted-foreground">Record daily activities and resources</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={selectedRegion || ""}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {regions.map(region => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe the work done today"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materialsUsed">Materials Used</Label>
                <Textarea 
                  id="materialsUsed"
                  placeholder="List materials used"
                  rows={2}
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materialsReceived">Materials Received</Label>
                <Textarea 
                  id="materialsReceived"
                  placeholder="List materials received"
                  rows={2}
                  value={materialsReceived}
                  onChange={(e) => setMaterialsReceived(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select onValueChange={addWorker}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableWorkers
                          .filter(worker => !selectedWorkers.includes(worker.id))
                          .map(worker => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.fullName} (${worker.dailySalary}/day)
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {selectedWorkers.length > 0 ? (
                    selectedWorkers.map(workerId => {
                      const worker = availableWorkers.find(w => w.id === workerId);
                      return (
                        <div key={workerId} className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <span>{worker?.fullName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ${worker?.dailySalary}/day
                            </span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeWorker(workerId)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No workers selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select onValueChange={addEquipment}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableEquipment
                          .filter(equip => !selectedEquipment.some(item => item.id === equip.id))
                          .map(equip => (
                            <SelectItem key={equip.id} value={equip.id}>
                              {equip.type} ({equip.licensePlate})
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {selectedEquipment.length > 0 ? (
                    selectedEquipment.map(item => {
                      const equipment = availableEquipment.find(e => e.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{equipment?.type} ({equipment?.licensePlate})</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Label htmlFor={`fuel-${item.id}`} className="text-xs">Fuel (L):</Label>
                              <Input
                                id={`fuel-${item.id}`}
                                type="number"
                                value={item.fuelAmount}
                                onChange={(e) => updateFuelAmount(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 h-8"
                              />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEquipment(item.id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No equipment selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Workers:</span>
                    <span className="font-medium">{totalWorkers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Equipment:</span>
                    <span className="font-medium">{totalEquipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Fuel:</span>
                    <span className="font-medium">{totalFuel} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Worker Salary:</span>
                    <span className="font-medium">${totalWorkerSalary}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate("/reports")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Report"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
