import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'engineer'>('engineer');
  const { login, error } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loginIdentifier = activeTab === 'admin' ? email : username;
    
    if (!loginIdentifier || !password) {
      toast({
        title: "Error",
        description: activeTab === 'admin' 
          ? "Please enter both email and password" 
          : "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login(loginIdentifier, password);
      
      // If login successful, navigation is handled by the protected route
    } catch (error) {
      console.error('Login error:', error);
      // Error is now handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-amradzi-blue">Amradzi V2.0</CardTitle>
        <CardDescription className="text-center">Field Control & Incident Reporting System</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'admin' | 'engineer')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="engineer">Engineer</TabsTrigger>
            <TabsTrigger value="admin">Administrator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engineer">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineer-password">Password</Label>
                <Input
                  id="engineer-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amradzi-blue hover:bg-amradzi-lightBlue"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="admin">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amradzi-blue hover:bg-amradzi-lightBlue"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <div className="text-muted-foreground w-full space-y-2">
          <p>Default credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border rounded p-2">
              <p className="font-bold">Admin</p>
              <p>Email: rasanidze@gmail.com</p>
              <p>Password: admin12345</p>
            </div>
            <div className="border rounded p-2">
              <p className="font-bold">Engineer</p>
              <p>Username: keda</p>
              <p>Password: engineer12345</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
