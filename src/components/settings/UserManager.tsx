import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Engineer {
  id: string;
  username: string;
  full_name: string;
  email: string;
  active: boolean;
  phone?: string;
}

export function UserManager() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    region_id: "",
  });
  const [editUser, setEditUser] = useState<Engineer | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState<Engineer | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEngineers();
    fetchRegions();

    // Set up realtime subscription
    const channel = supabase
      .channel('engineers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'engineers'
      }, () => {
        fetchEngineers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEngineers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select(`
          id, 
          username, 
          full_name, 
          email, 
          active,
          phone,
          engineer_regions(region_id)
        `)
        .order('username');

      if (error) throw error;

      if (data) {
        const engineersList = data.map(engineer => ({
          id: engineer.id,
          username: engineer.username,
          full_name: engineer.full_name || "",
          email: engineer.email || "",
          active: engineer.active || true,
          phone: engineer.phone || ""
        }));
        setEngineers(engineersList);
      }
    } catch (error: any) {
      console.error('Error fetching engineers:', error);
      toast({
        title: "Error",
        description: "Failed to load engineers. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      console.error('Error fetching regions:', error);
      toast({
        title: "Error",
        description: "Failed to load regions.",
        variant: "destructive"
      });
    }
  };

  const fetchUserRegions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('engineer_regions')
        .select('region_id')
        .eq('engineer_id', userId);

      if (error) throw error;
      return data?.map(item => item.region_id) || [];
    } catch (error) {
      console.error('Error fetching user regions:', error);
      return [];
    }
  };

  const handleAddUser = async () => {
    if (!formData.username.trim() || !formData.full_name.trim() || !formData.email.trim() || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Username, full name, email, and password are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('engineers')
        .insert({
          username: formData.username.trim(),
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password_hash: formData.password,
          active: true
        })
        .select();

      if (error) throw error;

      if (selectedRegions.length > 0 && data && data[0]) {
        const engineerId = data[0].id;
        
        const regionAssignments = selectedRegions.map(regionId => ({
          engineer_id: engineerId,
          region_id: regionId
        }));
        
        const { error: regionError } = await supabase
          .from('engineer_regions')
          .insert(regionAssignments);
          
        if (regionError) {
          console.error('Error assigning regions:', regionError);
          // Continue anyway as the user was created
        }
      }

      try {
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              username: formData.username.trim(),
              full_name: formData.full_name.trim()
            }
          }
        });
        
        if (authError) {
          console.warn('Error creating auth account, but engineer record was created:', authError);
          // Not failing here as the engineer record was successfully created
        }
      } catch (authError) {
        console.warn('Exception creating auth account, but engineer record was created:', authError);
      }

      toast({
        title: "User Added",
        description: `${formData.username} has been added successfully.`
      });
      
      setFormData({
        username: "",
        full_name: "",
        email: "",
        phone: "",
        password: "",
        region_id: "",
      });
      setSelectedRegions([]);
      setIsAddingUser(false);
      
      await fetchEngineers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!editUser || !formData.username.trim() || !formData.full_name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Username, full name, and email are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData: Record<string, any> = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };
      
      if (formData.password) {
        updateData.password_hash = formData.password;
      }
      
      const { error } = await supabase
        .from('engineers')
        .update(updateData)
        .eq('id', editUser.id);

      if (error) throw error;

      await supabase
        .from('engineer_regions')
        .delete()
        .eq('engineer_id', editUser.id);
        
      if (selectedRegions.length > 0) {
        const regionAssignments = selectedRegions.map(regionId => ({
          engineer_id: editUser.id,
          region_id: regionId
        }));
        
        const { error: regionError } = await supabase
          .from('engineer_regions')
          .insert(regionAssignments);
          
        if (regionError) {
          console.error('Error updating region assignments:', regionError);
          // Continue anyway as the user was updated
        }
      }

      toast({
        title: "User Updated",
        description: `${formData.username} has been updated successfully.`
      });
      
      setIsEditingUser(false);
      setEditUser(null);
      
      await fetchEngineers();
    } catch (error: any) {
      console.error('Error editing user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      const { error } = await supabase
        .from('engineers')
        .delete()
        .eq('id', deleteUser.id);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: `${deleteUser.username} has been removed.`
      });
      
      setIsDeletingUser(false);
      setDeleteUser(null);
      
      await fetchEngineers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenEditDialog = async (user: Engineer) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      region_id: "",
    });
    
    const userRegions = await fetchUserRegions(user.id);
    setSelectedRegions(userRegions);
    
    setIsEditingUser(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Users</CardTitle>
        <Button onClick={() => setIsAddingUser(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : engineers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No users found. Add your first user.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engineers.map((engineer) => (
                <TableRow key={engineer.id}>
                  <TableCell>{engineer.username}</TableCell>
                  <TableCell>{engineer.full_name}</TableCell>
                  <TableCell>{engineer.email}</TableCell>
                  <TableCell>{engineer.active ? "Active" : "Inactive"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditDialog(engineer)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteUser(engineer);
                        setIsDeletingUser(true);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone (Optional)</label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Regions</label>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <Button
                      key={region.id}
                      variant={selectedRegions.includes(region.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedRegions.includes(region.id)) {
                          setSelectedRegions(prev => prev.filter(id => id !== region.id));
                        } else {
                          setSelectedRegions(prev => [...prev, region.id]);
                        }
                      }}
                    >
                      {region.name}
                    </Button>
                  ))}
                </div>
                {regions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No regions available. Add regions first.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-username" className="text-sm font-medium">Username</label>
                  <Input
                    id="edit-username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-full_name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="edit-full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-phone" className="text-sm font-medium">Phone (Optional)</label>
                  <Input
                    id="edit-phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-password" className="text-sm font-medium">Password (Leave blank to keep current)</label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Regions</label>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <Button
                      key={region.id}
                      variant={selectedRegions.includes(region.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedRegions.includes(region.id)) {
                          setSelectedRegions(prev => prev.filter(id => id !== region.id));
                        } else {
                          setSelectedRegions(prev => [...prev, region.id]);
                        }
                      }}
                    >
                      {region.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingUser(false)}>Cancel</Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeletingUser} onOpenChange={setIsDeletingUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete user "{deleteUser?.username}"?</p>
              <p className="text-destructive mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeletingUser(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
