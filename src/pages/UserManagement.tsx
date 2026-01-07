import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Search, UserCog, Shield, Eye, Edit, Settings2, Database, MapPin, Building2, Plus, Trash2, Zap, AlertCircle, Download } from "lucide-react";
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
  requested_centre_id: string | null;
  requested_region_id: string | null;
  assignment_type: string | null;
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
  
  // Assignment state
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [userCentreAssignments, setUserCentreAssignments] = useState<{centre_id: string; is_active: boolean}[]>([]);
  const [userRegionAssignments, setUserRegionAssignments] = useState<{region_id: string; access_level: string; is_active: boolean}[]>([]);
  const [selectedCentreToAdd, setSelectedCentreToAdd] = useState("");
  const [selectedRegionToAdd, setSelectedRegionToAdd] = useState("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("view_edit");
  const [savingAssignments, setSavingAssignments] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch all centres for assignment dropdown - from centres table (unique)
  const { data: allCentres } = useQuery({
    queryKey: ['all-centres-unique'],
    queryFn: async () => {
      const { data } = await supabase
        .from('centres')
        .select('centre_id, centre_name, state, region_unit')
        .eq('centre_type', 'STC')
        .order('centre_name');
      return data?.map(c => ({ ...c, region: c.region_unit })) || [];
    },
    enabled: isAdmin,
  });
  
  // Fetch user assignments to check pending status
  const { data: allCentreAssignments } = useQuery({
    queryKey: ['all-centre-assignments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_centre_assignments')
        .select('user_id, centre_id, is_active');
      return data || [];
    },
    enabled: isAdmin,
  });
  
  const { data: allRegionAssignments } = useQuery({
    queryKey: ['all-region-assignments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_region_assignments')
        .select('user_id, region_id, is_active');
      return data || [];
    },
    enabled: isAdmin,
  });
  
  // Fetch all regions for assignment dropdown
  const { data: allRegions } = useQuery({
    queryKey: ['all-regions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('regional_centres')
        .select('id, name, display_name')
        .order('sort_order');
      return data || [];
    },
    enabled: isAdmin,
  });

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
      .select('id, email, name, created_at, last_login, requested_centre_id, requested_region_id, assignment_type')
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

  const openAssignmentDialog = async (user: UserWithRole) => {
    setSelectedUser(user);
    setAssignmentDialogOpen(true);
    setSelectedCentreToAdd("");
    setSelectedRegionToAdd("");
    
    // Fetch existing centre assignments
    const { data: centreData } = await supabase
      .from('user_centre_assignments')
      .select('centre_id, is_active')
      .eq('user_id', user.id);
    setUserCentreAssignments(centreData || []);
    
    // Fetch existing region assignments
    const { data: regionData } = await supabase
      .from('user_region_assignments')
      .select('region_id, access_level, is_active')
      .eq('user_id', user.id);
    setUserRegionAssignments(regionData || []);
  };

  const addCentreAssignment = async () => {
    if (!selectedUser || !selectedCentreToAdd) return;
    
    setSavingAssignments(true);
    const { error } = await supabase
      .from('user_centre_assignments')
      .insert({
        user_id: selectedUser.id,
        centre_id: selectedCentreToAdd,
        assigned_by: session?.user.id,
        is_active: true,
      });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Centre assigned" });
      setUserCentreAssignments(prev => [...prev, { centre_id: selectedCentreToAdd, is_active: true }]);
      setSelectedCentreToAdd("");
    }
    setSavingAssignments(false);
  };

  const removeCentreAssignment = async (centreId: string) => {
    if (!selectedUser) return;
    
    setSavingAssignments(true);
    const { error } = await supabase
      .from('user_centre_assignments')
      .delete()
      .eq('user_id', selectedUser.id)
      .eq('centre_id', centreId);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Centre assignment removed" });
      setUserCentreAssignments(prev => prev.filter(a => a.centre_id !== centreId));
    }
    setSavingAssignments(false);
  };

  const addRegionAssignment = async () => {
    if (!selectedUser || !selectedRegionToAdd) return;
    
    setSavingAssignments(true);
    const { error } = await supabase
      .from('user_region_assignments')
      .insert({
        user_id: selectedUser.id,
        region_id: selectedRegionToAdd,
        access_level: selectedAccessLevel,
        assigned_by: session?.user.id,
        is_active: true,
      });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Region assigned" });
      setUserRegionAssignments(prev => [...prev, { region_id: selectedRegionToAdd, access_level: selectedAccessLevel, is_active: true }]);
      setSelectedRegionToAdd("");
    }
    setSavingAssignments(false);
  };

  // Quick assign - auto-assign user to their requested centre/region
  const quickAssign = async (user: UserWithRole) => {
    if (!user.assignment_type) {
      toast({ title: "No Request", description: "User hasn't requested a centre or region", variant: "destructive" });
      return;
    }
    
    setSaving(user.id);
    
    if (user.assignment_type === 'centre' && user.requested_centre_id) {
      const { error } = await supabase
        .from('user_centre_assignments')
        .insert({
          user_id: user.id,
          centre_id: user.requested_centre_id,
          assigned_by: session?.user.id,
          is_active: true,
        });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Assigned ${user.name} to their requested centre` });
      }
    } else if (user.assignment_type === 'region' && user.requested_region_id) {
      const { error } = await supabase
        .from('user_region_assignments')
        .insert({
          user_id: user.id,
          region_id: user.requested_region_id,
          access_level: 'view_edit',
          assigned_by: session?.user.id,
          is_active: true,
        });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Assigned ${user.name} to their requested region` });
      }
    }
    
    setSaving(null);
  };

  // Check if user has pending request but no assignment
  const hasPendingRequest = (user: UserWithRole) => {
    if (!user.assignment_type) return false;
    
    if (user.assignment_type === 'centre' && user.requested_centre_id) {
      return !allCentreAssignments?.some(a => a.user_id === user.id && a.is_active);
    }
    if (user.assignment_type === 'region' && user.requested_region_id) {
      return !allRegionAssignments?.some(a => a.user_id === user.id && a.is_active);
    }
    return false;
  };

  // Download Excel template for user registration
  const downloadExcelTemplate = () => {
    const headers = [
      'Full Name',
      'Email',
      'Contact Number',
      'Organization/Institution',
      'Assignment Type (centre/region)',
      'STC Centre Name',
      'Regional Centre',
      'Designation',
      'State',
      'District',
      'Reason for Access Request'
    ];
    
    const csvContent = headers.join(',') + '\n' + 
      'John Doe,john@example.com,9876543210,Sports Authority,centre,Agartala,,"Centre Head",Tripura,West Tripura,Need access to manage STC data\n' +
      'Jane Smith,jane@example.com,9876543211,SAI Regional,region,,NRC Bangalore,"Regional Coordinator",Karnataka,Bangalore Urban,Regional data management';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_registration_template.csv';
    link.click();
    
    toast({ title: "Template Downloaded", description: "Open with Excel and fill in user details" });
  };

  const removeRegionAssignment = async (regionId: string) => {
    if (!selectedUser) return;
    
    setSavingAssignments(true);
    const { error } = await supabase
      .from('user_region_assignments')
      .delete()
      .eq('user_id', selectedUser.id)
      .eq('region_id', regionId);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Region assignment removed" });
      setUserRegionAssignments(prev => prev.filter(a => a.region_id !== regionId));
    }
    setSavingAssignments(false);
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
        <Button variant="outline" onClick={downloadExcelTemplate} className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {filteredUsers.filter(u => hasPendingRequest(u)).length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {filteredUsers.filter(u => hasPendingRequest(u)).length} pending assignment{filteredUsers.filter(u => hasPendingRequest(u)).length > 1 ? 's' : ''}
          </Badge>
        )}
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
                <TableHead>Requested</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
                <TableHead>Table Access</TableHead>
                <TableHead>Centre/Region</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const isPending = hasPendingRequest(user);
                return (
                <TableRow key={user.id} className={isPending ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.name}
                      {isPending && (
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.assignment_type === 'centre' && user.requested_centre_id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{allCentres?.find(c => c.centre_id === user.requested_centre_id)?.centre_name || user.requested_centre_id}</span>
                        </div>
                        {isPending && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => quickAssign(user)}
                            disabled={saving === user.id}
                            className="h-6 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Zap className="h-3 w-3" />
                            Assign
                          </Button>
                        )}
                      </div>
                    ) : user.assignment_type === 'region' && user.requested_region_id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="text-xs">{allRegions?.find(r => r.id === user.requested_region_id)?.display_name || 'Region'}</span>
                        </div>
                        {isPending && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => quickAssign(user)}
                            disabled={saving === user.id}
                            className="h-6 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Zap className="h-3 w-3" />
                            Assign
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
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
                        Tables
                      </Button>
                    ) : user.role === 'admin' ? (
                      <span className="text-muted-foreground text-sm">All tables</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === 'editor' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAssignmentDialog(user)}
                        className="gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        Assign
                      </Button>
                    ) : user.role === 'admin' ? (
                      <span className="text-muted-foreground text-sm">All centres</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                );
              })}
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

      {/* Centre/Region Assignments Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Assignments for {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="centres" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="centres" className="gap-2">
                <Building2 className="h-4 w-4" /> Centres
              </TabsTrigger>
              <TabsTrigger value="regions" className="gap-2">
                <MapPin className="h-4 w-4" /> Regions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="centres" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Select value={selectedCentreToAdd} onValueChange={setSelectedCentreToAdd}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select centre to assign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCentres?.filter(c => !userCentreAssignments.some(a => a.centre_id === c.centre_id)).map(centre => (
                      <SelectItem key={centre.centre_id} value={centre.centre_id}>
                        {centre.centre_name} ({centre.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addCentreAssignment} disabled={!selectedCentreToAdd || savingAssignments} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                {userCentreAssignments.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No centres assigned</p>
                ) : (
                  userCentreAssignments.map(assignment => {
                    const centre = allCentres?.find(c => c.centre_id === assignment.centre_id);
                    return (
                      <div key={assignment.centre_id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{centre?.centre_name || assignment.centre_id}</p>
                          <p className="text-xs text-muted-foreground">{centre?.state} • {centre?.region}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeCentreAssignment(assignment.centre_id)}
                          disabled={savingAssignments}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="regions" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Select value={selectedRegionToAdd} onValueChange={setSelectedRegionToAdd}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allRegions?.filter(r => !userRegionAssignments.some(a => a.region_id === r.id)).map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.display_name || region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view_only">View Only</SelectItem>
                    <SelectItem value="view_edit">View & Edit</SelectItem>
                    <SelectItem value="view_edit_approve">Full Access</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addRegionAssignment} disabled={!selectedRegionToAdd || savingAssignments} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                {userRegionAssignments.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No regions assigned</p>
                ) : (
                  userRegionAssignments.map(assignment => {
                    const region = allRegions?.find(r => r.id === assignment.region_id);
                    return (
                      <div key={assignment.region_id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{region?.display_name || region?.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {assignment.access_level.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeRegionAssignment(assignment.region_id)}
                          disabled={savingAssignments}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
