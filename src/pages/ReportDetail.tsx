
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const isNewReport = id === "new";

  useEffect(() => {
    if (!isNewReport) {
      const fetchReport = async () => {
        try {
          const { data, error } = await supabase
            .from('reports')
            .select(`
              *,
              regions (name)
            `)
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          setReport(data);
        } catch (error: any) {
          toast({
            title: "Error",
            description: `Could not load report: ${error.message}`,
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [id, isNewReport, toast]);

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/reports')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Reports
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isNewReport ? "Create New Report" : `Report Details: ${id}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading report data...</div>
          ) : isNewReport ? (
            <div>New report form will go here</div>
          ) : report ? (
            <div>Report details will go here</div>
          ) : (
            <div>Report not found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
