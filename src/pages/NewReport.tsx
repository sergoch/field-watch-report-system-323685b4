
import { useState } from "react";
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

export default function NewReportPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<{id: string, fuelAmount: number}[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for workers and equipment
  const mockWorkers = [
    { id: "1", name: "Giorgi Beridze" },
    { id: "2", name: "Nino Khelaia" },
    { id: "3", name: "Davit Kapanadze" },
    { id: "4", name: "Tamar Lomidze" },
    { id: "5", name: "Levan Maisuradze" },
  ];
  
  const mockEquipment = [
    { id: "1", name: "Excavator (AA-001-AA)" },
    { id: "2", name: "Bulldozer (BB-002-BB)" },
    { id: "3", name: "Crane (CC-003-CC)" },
    { id: "4", name: "Truck (DD-004-DD)" },
    { id: "5", name: "Loader (EE-005-EE)" },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, call API to save the report
    
    toast({
      title: "Report Created",
      description: `Daily report for ${format(date, "PPP")} has been created.`,
    });
    
    navigate("/reports");
  };

  // Calculate totals
  const totalWorkers = selectedWorkers.length;
  const totalEquipment = selectedEquipment.length;
  const totalFuel = selectedEquipment.reduce((sum, item) => sum + item.fuelAmount, 0);

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
                <Select defaultValue="north">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materialsUsed">Materials Used</Label>
                <Textarea 
                  id="materialsUsed"
                  placeholder="List materials used"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materialsReceived">Materials Received</Label>
                <Textarea 
                  id="materialsReceived"
                  placeholder="List materials received"
                  rows={2}
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
                        {mockWorkers.filter(worker => !selectedWorkers.includes(worker.id)).map(worker => (
                          <SelectItem key={worker.id} value={worker.id}>{worker.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => selectedWorkers.length > 0 && addWorker(selectedWorkers[selectedWorkers.length - 1])}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {selectedWorkers.length > 0 ? (
                    selectedWorkers.map(workerId => {
                      const worker = mockWorkers.find(w => w.id === workerId);
                      return (
                        <div key={workerId} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{worker?.name}</span>
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
                        {mockEquipment.filter(equip => !selectedEquipment.some(item => item.id === equip.id)).map(equip => (
                          <SelectItem key={equip.id} value={equip.id}>{equip.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon">
                    <Truck className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {selectedEquipment.length > 0 ? (
                    selectedEquipment.map(item => {
                      const equipment = mockEquipment.find(e => e.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{equipment?.name}</span>
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate("/reports")}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
