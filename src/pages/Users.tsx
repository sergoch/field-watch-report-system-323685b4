
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
import { Users, PlusCircle, Pencil, Trash2 } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  region_id?: string;
  role: 'engineer' | 'admin';
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [regions, setRegions] = useState<{id: string, name: string}[]>([]);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    region_id: '',
    role: 'engineer' as const
  });

  useEffect(() => {
    fetchUsers();
    fetchRegions();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('raw_user_meta_data->role', 'engineer');
    
    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setUsers(data.map(user => ({
        id: user.id,
        email: user.email,
        region_id: user.raw_user_meta_data?.region_id,
        role: 'engineer'
      })));
    }
  };

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');
    
    if (error) {
      toast({
        title: "Error fetching regions",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setRegions(data);
    }
  };

  const handleCreateUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          role: 'engineer',
          region_id: newUser.region_id
        }
      }
    });

    if (error) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "User Created",
        description: `Engineer ${newUser.email} added successfully`
      });
      fetchUsers();
      setNewUser({ email: '', password: '', region_id: '', role: 'engineer' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "User Deleted",
        description: "The engineer has been removed"
      });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Engineer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Engineer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
              <select
                value={newUser.region_id}
                onChange={(e) => setNewUser(prev => ({ ...prev, region_id: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleCreateUser}>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Engineers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map(user => (
              <div 
                key={user.id} 
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <div>{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Region: {regions.find(r => r.id === user.region_id)?.name || 'Unassigned'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
