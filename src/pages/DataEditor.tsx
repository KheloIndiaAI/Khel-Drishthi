import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, Search, Download, Save, X, Edit2, Database, History, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session, User } from "@supabase/supabase-js";

interface TableConfig {
  name: string;
  label: string;
  editable: string[];
  idField: string;
}

const ALL_TABLES: TableConfig[] = [
  { name: 'sports', label: 'Sports', editable: ['sport_name', 'sport_category', 'is_tops', 'is_tagg', 'is_teams'], idField: 'sport_id' },
  { name: 'centres', label: 'Centres', editable: ['centre_name', 'centre_type', 'state', 'district', 'is_active'], idField: 'centre_id' },
  { name: 'events', label: 'Events', editable: ['event_std', 'gender_std', 'event_type_std'], idField: 'event_id' },
  { name: 'disciplines', label: 'Disciplines', editable: ['discipline_std', 'is_active'], idField: 'discipline_id' },
  { name: 'ncoe_capacity', label: 'NCOE Capacity', editable: ['san_grand_total', 'ex_grand_total'], idField: 'id' },
  { name: 'stc_capacity', label: 'STC Capacity', editable: ['san_grand_total', 'ex_grand_total'], idField: 'id' },
  { name: 'olympic_medals', label: 'Olympic Medals', editable: ['athlete_or_team', 'medal', 'year'], idField: 'id' },
  { name: 'olympic_participation', label: 'Olympic Participation', editable: ['athletes', 'year'], idField: 'id' },
  { name: 'centre_sport_links', label: 'Centre-Sport Links', editable: ['sport_name', 'discipline_name', 'operational_status'], idField: 'id' },
  { name: 'eco_categories', label: 'Ecosystem Categories', editable: ['eco_category_name', 'notes'], idField: 'eco_category_id' },
  { name: 'event_overlap', label: 'Event Overlap', editable: ['ag_events', 'la28_events', 'both_events'], idField: 'id' },
  { name: 'olympic_timeline', label: 'Olympic Timeline', editable: ['milestone_title', 'milestone_description', 'year_start'], idField: 'id' },
];

const DataEditor = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessibleTables, setAccessibleTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      } else {
        setTimeout(() => fetchUserAccess(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchUserAccess(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAccess = async (userId: string) => {
    try {
      // Check if admin
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      
      if (isAdmin) {
        setUserRole('admin');
        setAccessibleTables(ALL_TABLES.map(t => t.name));
        setActiveTable(ALL_TABLES[0].name);
        setLoading(false);
        return;
      }

      // Check if editor
      const { data: isEditor } = await supabase.rpc('has_role', { _user_id: userId, _role: 'editor' });
      
      if (isEditor) {
        setUserRole('editor');
        // Fetch table permissions
        const { data: permissions } = await supabase
          .from('user_table_permissions')
          .select('table_name')
          .eq('user_id', userId);
        
        const tables = permissions?.map(p => p.table_name) || [];
        setAccessibleTables(tables);
        if (tables.length > 0) setActiveTable(tables[0]);
      } else {
        setUserRole('viewer');
        setAccessibleTables([]);
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTable && accessibleTables.includes(activeTable)) {
      fetchTableData(activeTable);
    }
  }, [activeTable]);

  const fetchTableData = async (tableName: string) => {
    setTableLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName as never)
        .select('*')
        .limit(500);
      if (error) throw error;
      setData((data as Record<string, unknown>[]) || []);
    } catch (error) {
      toast({ title: "Error", description: `Failed to fetch ${tableName} data`, variant: "destructive" });
    } finally {
      setTableLoading(false);
    }
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const tableConfig = ALL_TABLES.find(t => t.name === activeTable);
    if (!tableConfig) return;
    
    const id = row[tableConfig.idField] as string;
    setEditingRow(id);
    setEditedData({ ...row });
    setOriginalData({ ...row });
  };

  const handleSave = async () => {
    if (!editingRow || !activeTable || !user) return;
    
    const tableConfig = ALL_TABLES.find(t => t.name === activeTable);
    if (!tableConfig) return;

    const updateData: Record<string, unknown> = {};
    const changedFields: string[] = [];
    
    tableConfig.editable.forEach(field => {
      if (editedData[field] !== undefined) {
        updateData[field] = editedData[field];
        if (editedData[field] !== originalData[field]) {
          changedFields.push(field);
        }
      }
    });

    if (changedFields.length === 0) {
      toast({ title: "No changes", description: "No fields were modified" });
      setEditingRow(null);
      return;
    }

    try {
      const { data: updatedRows, error } = await supabase
        .from(activeTable as never)
        .update(updateData as never)
        .eq(tableConfig.idField as never, editingRow)
        .select(tableConfig.idField as never);

      if (error) throw error;
      // RLS silently filters unauthorised UPDATEs to 0 rows; don't log or report success for those.
      if (!(updatedRows as unknown[] | null)?.length) {
        throw new Error('You do not have permission to edit this table. No changes were saved.');
      }

      // Get user profile for audit log
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();

      // Create audit log entry
      await supabase.from('audit_logs').insert([{
        user_id: user.id,
        user_email: profile?.email || user.email,
        user_name: profile?.name || 'Unknown',
        table_name: activeTable,
        record_id: editingRow,
        action: 'UPDATE',
        old_data: JSON.parse(JSON.stringify(originalData)),
        new_data: JSON.parse(JSON.stringify(editedData)),
        changed_fields: changedFields,
      }]);

      toast({ title: "Saved", description: "Record updated successfully" });
      setEditingRow(null);
      setEditedData({});
      setOriginalData({});
      fetchTableData(activeTable);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
    setOriginalData({});
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          return stringValue.includes(',') || stringValue.includes('"') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeTable}_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTableConfig = () => ALL_TABLES.find(t => t.name === activeTable);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" /> Login Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please login to access the Data Editor.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (accessibleTables.length === 0) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-5 w-5" /> No Table Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have edit access to any tables yet. Contact an administrator to get access.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const tableConfig = getTableConfig();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl flex items-center gap-3">
            <Database className="h-8 w-8" /> Data Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            {userRole === 'admin' ? 'Full access to all tables' : `Access to ${accessibleTables.length} table(s)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/audit-logs')} variant="outline" className="gap-2">
            <History className="h-4 w-4" /> Audit Logs
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {accessibleTables.map(tableName => {
          const config = ALL_TABLES.find(t => t.name === tableName);
          return (
            <Button
              key={tableName}
              variant={activeTable === tableName ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTable(tableName)}
              className="gap-2"
            >
              {activeTable === tableName && <CheckCircle className="h-3 w-3" />}
              {config?.label || tableName}
            </Button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {tableConfig?.label}
            <Badge variant="secondary">{filteredData.length} records</Badge>
          </CardTitle>
          <CardDescription>
            Editable fields: {tableConfig?.editable.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto max-w-full">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    {columns.slice(0, 8).map(col => (
                      <TableHead key={col} className="whitespace-nowrap min-w-[120px] max-w-[200px]">
                        {col.replace(/_/g, ' ')}
                        {tableConfig?.editable.includes(col) && (
                          <Edit2 className="inline ml-1 h-3 w-3 text-primary" />
                        )}
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 100).map((row) => {
                    const rowId = tableConfig ? row[tableConfig.idField] as string : '';
                    const isEditing = editingRow === rowId;
                    
                    return (
                      <TableRow key={rowId}>
                        {columns.slice(0, 8).map(col => (
                          <TableCell key={col} className="min-w-[120px] max-w-[250px]">
                            {isEditing && tableConfig?.editable.includes(col) ? (
                              <Input
                                value={String(editedData[col] ?? '')}
                                onChange={(e) => setEditedData({ ...editedData, [col]: e.target.value })}
                                className="h-8 w-full"
                              />
                            ) : (
                              <span className="block truncate" title={String(row[col] ?? '-')}>
                                {String(row[col] ?? '-')}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={handleSave}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredData.length > 100 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 100 of {filteredData.length} records
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DataEditor;
