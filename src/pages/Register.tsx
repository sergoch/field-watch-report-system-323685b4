
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-muted/30 items-center justify-center p-4 md:p-0">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <p className="mb-8 text-muted-foreground">Registration is currently disabled.</p>
        <Button asChild>
          <Link to="/login">Return to Login</Link>
        </Button>
      </div>
    </div>
  );
}
