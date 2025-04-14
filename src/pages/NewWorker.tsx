
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function NewWorkerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    personalId: "",
    dailySalary: 0
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "dailySalary" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.fullName.trim()) {
      toast({
        title: "Required Field Missing",
        description: "Please enter the worker's full name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.personalId.trim()) {
      toast({
        title: "Required Field Missing",
        description: "Please enter the worker's personal ID.",
        variant: "destructive"
      });
      return;
    }

    if (formData.dailySalary <= 0) {
      toast({
        title: "Invalid Salary",
        description: "Daily salary must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('workers')
        .insert({
          full_name: formData.fullName,
          personal_id: formData.personalId,
          daily_salary: formData.dailySalary
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Worker Added",
        description: `${formData.fullName} has been added to the registry.`
      });
      
      // Navigate back to the workers list
      navigate("/workers");
    } catch (error) {
      console.error("Error adding worker:", error);
      toast({
        title: "Failed to Add Worker",
        description: "There was an error adding the worker to the registry.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Worker</h1>
        <p className="text-muted-foreground">Register a new worker in the system</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Worker Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name*</Label>
                <Input
                  id="fullName"
                  placeholder="Enter worker's full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="personalId">Personal ID*</Label>
                <Input
                  id="personalId"
                  placeholder="Enter worker's personal ID"
                  value={formData.personalId}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dailySalary">Daily Salary (GEL)*</Label>
                <Input
                  id="dailySalary"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter worker's daily salary"
                  value={formData.dailySalary}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/workers")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Worker"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
