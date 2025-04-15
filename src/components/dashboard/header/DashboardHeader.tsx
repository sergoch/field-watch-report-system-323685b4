
import { User } from "@/types";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-sky-900">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">
        Administrator Dashboard
      </p>
    </div>
  );
}
