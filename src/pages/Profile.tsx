
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Name</p>
              <p>{user?.name || "Not set"}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{user?.email || "Not set"}</p>
            </div>
            <div>
              <p className="font-semibold">Role</p>
              <p className="capitalize">{user?.role || "User"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
