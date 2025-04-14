
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Region } from '@/types';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { UserViewDialog } from '@/components/users/UserViewDialog';
import { UserEditDialog } from '@/components/users/UserEditDialog';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';

interface UserMetadata {
  name: string;
  role: string;
  region_id?: string;
}

interface UserData {
  id: string;
  email: string | undefined;
  user_metadata: UserMetadata;
  created_at?: string;
}

type UserProfile = {
  id: string;
  email: string;
  name: string;
  region_id?: string;
  regionName?: string;
  role: 'engineer' | 'admin';
  created_at?: string;
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [viewUser, setViewUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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

    if (!usersData || !usersData.users) {
      toast({
        title: "No users data",
        description: "Could not retrieve users from Supabase",
        variant: "destructive"
      });
      return;
    }

    const engineerUsers = usersData.users
      .filter(user => {
        const userData = user as unknown as UserData;
        const metadata = userData.user_metadata;
        return metadata?.role === 'engineer';
      })
      .map(user => {
        const userData = user as unknown as UserData;
        const metadata = userData.user_metadata;
        const regionId = metadata?.region_id;
        const regionName = regions.find(r => r.id === regionId)?.name;
        
        return {
          id: user.id,
          email: user.email || '',
          name: metadata?.name || '',
          region_id: regionId,
          regionName,
          role: metadata?.role as 'engineer',
          created_at: user.created_at
        };
      });

    setUsers(engineerUsers);
  };

  const handleEditUser = async (data: { name: string; region_id: string }) => {
    if (!editUser) return;
    
    setIsEditing(true);
    
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        editUser.id,
        {
          user_metadata: {
            name: data.name,
            role: 'engineer',
            region_id: data.region_id || null
          }
        }
      );

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `${data.name} has been updated successfully`
      });
      
      fetchUsers();
      setEditUser(null);
      
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
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
                      variant="ghost" 
                      size="sm"
                      onClick={() => setViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditUser(user)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
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

      <CreateUserDialog 
        isOpen={isCreating} 
        onClose={() => setIsCreating(false)}
        regions={regions}
      />

      <UserViewDialog
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
        user={viewUser}
      />

      <UserEditDialog
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleEditUser}
        user={editUser}
        regions={regions}
        isSaving={isEditing}
      />

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
