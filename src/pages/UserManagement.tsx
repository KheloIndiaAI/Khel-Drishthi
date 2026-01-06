import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Search, UserCog, Shield, Eye, Edit, Settings2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PendingAccessRequests } from "@/components/access/PendingAccessRequests";
import type { Session } from "@supabase/supabase-js";
import type { Database as SupabaseDB } from "@/integrations/supabase/types";

type AppRole = SupabaseDB['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  created_at: string;
  last_login: string | null;
}

interface TablePermission {
  table_name: string;
  label: string;
}

const EDITABLE_TABLES: TablePermission[] = [
  { table_name: 'sports', label: 'Sports' },
  { table_name: 'centres', label: 'Centres' },
  { table_name: 'events', label: 'Events' },
  { table_name: 'disciplines', label: 'Disciplines' },
  { table_name: 'ncoe_capacity', label: 'NCOE Capacity' },
  { table_name: 'stc_capacity', label: 'STC Capacity' },
  { table_name: 'olympic_medals', label: 'Olympic Medals' },
  { table_name: 'olympic_participation', label: 'Olympic Participation' },
  { table_name: 'centre_sport_links', label: 'Centre-Sport Links' },
  { table_name: 'eco_categories', label: 'Ecosystem Categories' },
  { table_name: 'event_overlap', label: 'Event Overlap' },
  { table_name: 'olympic_timeline', label: 'Olympic Timeline' },
];

const UserManagement = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        setTimeout(() => checkAdminRole(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      setIsAdmin(!error && data === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, created_at, last_login')
      .order('created_at', { ascending: false });

    if (profilesError || !profiles) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
      return;
    }

    const usersWithRoles: UserWithRole[] = profiles.map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      return {
        ...profile,
        role: (userRole?.role as AppRole) || 'viewer'
      };
    });

    setUsers(usersWithRoles);
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    if (userId === session?.user.id) {
      toast({ title: "Warning", description: "You cannot change your own role", variant: "destructive" });
      return;
    }

    setSaving(userId);

    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existingRole) {
      const result = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      error = result.error;
    } else {
      const result = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }]);
      error = result.error;
    }

    if (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User role updated" });
      fetchUsers();
    }

    setSaving(null);
  };

  const openPermissionDialog = async (user: UserWithRole) => {
    setSelectedUser(user);
    setPermissionDialogOpen(true);
    
    // Fetch existing permissions for this user
    const { data, error } = await supabase
      .from('user_table_permissions')
      .select('table_name')
      .eq('user_id', user.id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch permissions", variant: "destructive" });
      setUserPermissions([]);
    } else {
      setUserPermissions(data?.map(p => p.table_name) || []);
    }
  };

  const togglePermission = (tableName: string) => {
    setUserPermissions(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    
    setSavingPermissions(true);
    
    // Delete existing permissions
    const { error: deleteError } = await supabase
      .from('user_table_permissions')
      .delete()
      .eq('user_id', selectedUser.id);
    
    if (deleteError) {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
      setSavingPermissions(false);
      return;
    }
    
    // Insert new permissions
    if (userPermissions.length > 0) {
      const { error: insertError } = await supabase
        .from('user_table_permissions')
        .insert(
          userPermissions.map(table_name => ({
            user_id: selectedUser.id,
            table_name,
            created_by: session?.user.id
          }))
        );
      
      if (insertError) {
        toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
        setSavingPermissions(false);
        return;
      }
    }
    
    toast({ title: "Success", description: `Table permissions updated for ${selectedUser.name}` });
    setSavingPermissions(false);
    setPermissionDialogOpen(false);
  };

  const getRoleBadgeVariant = (role: AppRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'editor': return <Edit className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || !isAdmin) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Admin access required.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl flex items-center gap-3">
          <UserCog className="h-8 w-8" /> User Management
        </h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Pending Access Requests */}
      <PendingAccessRequests sessionUserId={session.user.id} />

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
                <TableHead>Table Access</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value as AppRole)}
                      disabled={saving === user.id || user.id === session?.user.id}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <span className="flex items-center gap-2"><Eye className="h-3 w-3" /> Viewer</span>
                        </SelectItem>
                        <SelectItem value="editor">
                          <span className="flex items-center gap-2"><Edit className="h-3 w-3" /> Editor</span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> Admin</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.role === 'editor' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPermissionDialog(user)}
                        className="gap-1"
                      >
                        <Settings2 className="h-3 w-3" />
                        Manage
                      </Button>
                    ) : user.role === 'admin' ? (
                      <span className="text-muted-foreground text-sm">All tables</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Role Permissions</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <Badge variant="outline" className="mb-2 gap-1"><Eye className="h-3 w-3" /> Viewer</Badge>
            <p className="text-muted-foreground">Can view all public data and dashboards</p>
          </div>
          <div>
            <Badge variant="secondary" className="mb-2 gap-1"><Edit className="h-3 w-3" /> Editor</Badge>
            <p className="text-muted-foreground">Can edit assigned tables and submit forms</p>
          </div>
          <div>
            <Badge variant="default" className="mb-2 gap-1"><Shield className="h-3 w-3" /> Admin</Badge>
            <p className="text-muted-foreground">Full access: manage all data, users, and settings</p>
          </div>
        </div>
      </div>

      {/* Table Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table Permissions for {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto py-4">
            {EDITABLE_TABLES.map(table => (
              <div 
                key={table.table_name} 
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
              >
                <Checkbox
                  id={table.table_name}
                  checked={userPermissions.includes(table.table_name)}
                  onCheckedChange={() => togglePermission(table.table_name)}
                />
                <label 
                  htmlFor={table.table_name}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {table.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePermissions} disabled={savingPermissions}>
              {savingPermissions ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
