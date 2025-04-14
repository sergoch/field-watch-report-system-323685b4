
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Region } from '@/types';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  region_id?: string;
  regionName?: string;
  role: 'engineer' | 'admin';
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    region_id: '',
    role: 'engineer' as const
  });

  const { data: regions } = useSupabaseRealtime<Region>({ 
    tableName: 'regions' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: usersData, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Filter and map users
    const engineerUsers = usersData.users
      .filter(user => user.user_metadata?.role === 'engineer')
      .map(user => {
        const regionId = user.user_metadata?.region_id as string;
        const regionName = regions.find(r => r.id === regionId)?.name;
        
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          region_id: regionId,
          regionName,
          role: user.user_metadata?.role as 'engineer'
        };
      });

    setUsers(engineerUsers);
  };

  const handleCreateUser = async () => {
    // Form validation
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Email, name and password are required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    
    try {
      // Create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          name: newUser.name,
          role: newUser.role,
          region_id: newUser.region_id || null
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "User Created",
        description: `${newUser.name} (${newUser.email}) has been added successfully`
      });
      
      // Refresh user list
      fetchUsers();
      
      // Reset form and close dialog
      setNewUser({ email: '', name: '', password: '', region_id: '', role: 'engineer' });
      setIsCreating(false);
      
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(deleteUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: "User Deleted",
        description: `${deleteUser.name} (${deleteUser.email}) has been removed`
      });
      
      fetchUsers();
      setDeleteUser(null);
      
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCleanTestData = async () => {
    try {
      const { error } = await supabase.rpc('clean_test_data');
      
      if (error) throw error;
      
      toast({
        title: "Test Data Cleaned",
        description: "All test data has been successfully removed"
      });
    } catch (error: any) {
      toast({
        title: "Error Cleaning Data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage system users and engineers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Engineer
          </Button>
          <Button 
            variant="outline" 
            className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
            onClick={handleCleanTestData}
          >
            Clean Test Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Engineers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map(user => (
                <div 
                  key={user.id} 
                  className="flex justify-between items-center p-3 border-b"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Region: {user.regionName || 'Unassigned'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setDeleteUser(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No engineers found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Engineer Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Engineer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="region">Region</Label>
              <Select
                value={newUser.region_id}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, region_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCreateUser}
              disabled={isCreatingUser}
            >
              {isCreatingUser ? "Creating..." : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteUser?.name} (${deleteUser?.email})? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
