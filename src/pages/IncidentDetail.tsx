
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<any>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select(`
            *,
            regions (name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setIncident(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Could not load incident: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncident();
  }, [id, toast]);

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/incidents')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Incidents
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Incident Details: {id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading incident data...</div>
          ) : incident ? (
            <div>Incident details will go here</div>
          ) : (
            <div>Incident not found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
