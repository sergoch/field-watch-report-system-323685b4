
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RegionsManager } from "@/components/settings/RegionsManager";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);

  // App configuration
  const [appName, setAppName] = useState("Amradzi Construction");
  const [companyName, setCompanyName] = useState("Amradzi Construction Management");
  
  // Labels for tabs
  const [tabLabels, setTabLabels] = useState({
    workers: "Workers",
    equipment: "Equipment",
    reports: "Reports",
    incidents: "Incidents",
    analytics: "Analytics"
  });
  
  const handleSaveGeneral = () => {
    // In a real implementation, this would save to Supabase
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully."
    });
  };
  
  const handleSaveLabels = () => {
    // In a real implementation, this would save to Supabase
    toast({
      title: "Labels Updated",
      description: "UI labels have been updated successfully."
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          {userIsAdmin && <TabsTrigger value="regions">Regions</TabsTrigger>}
          <TabsTrigger value="labels">UI Labels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure application general settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {userIsAdmin && (
          <TabsContent value="regions" className="space-y-4">
            <RegionsManager />
          </TabsContent>
        )}
        
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Labels</CardTitle>
              <CardDescription>
                Customize the labels shown in the navigation and tabs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workersLabel">Workers Label</Label>
                <Input
                  id="workersLabel"
                  value={tabLabels.workers}
                  onChange={(e) => setTabLabels(prev => ({ ...prev, workers: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentLabel">Equipment Label</Label>
                <Input
                  id="equipmentLabel"
                  value={tabLabels.equipment}
                  onChange={(e) => setTabLabels(prev => ({ ...prev, equipment: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportsLabel">Reports Label</Label>
                <Input
                  id="reportsLabel"
                  value={tabLabels.reports}
                  onChange={(e) => setTabLabels(prev => ({ ...prev, reports: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentsLabel">Incidents Label</Label>
                <Input
                  id="incidentsLabel"
                  value={tabLabels.incidents}
                  onChange={(e) => setTabLabels(prev => ({ ...prev, incidents: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analyticsLabel">Analytics Label</Label>
                <Input
                  id="analyticsLabel"
                  value={tabLabels.analytics}
                  onChange={(e) => setTabLabels(prev => ({ ...prev, analytics: e.target.value }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveLabels}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
