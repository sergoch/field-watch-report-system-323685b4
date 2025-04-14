
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen bg-muted/30 items-center justify-center p-4 md:p-0">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-amradzi-blue">Access Denied</h1>
        <p className="mb-8 text-muted-foreground">You do not have permission to access this page.</p>
        <Button asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
