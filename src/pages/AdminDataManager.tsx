import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Search, Download, Save, X, Edit2, Archive, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import JSZip from "jszip";

type TableName = 'sports' | 'centres' | 'events' | 'disciplines' | 'ncoe_capacity' | 'stc_capacity' | 'olympic_medals' | 'olympic_participation';

// Tables included in the "Export All" zip bundle
const EXPORT_ALL_TABLES: string[] = [
  'sports', 'disciplines', 'events', 'event_overlap',
  'centres', 'centre_sport_links', 'regional_centres', 'region_state_mappings',
  'ncoe_capacity', 'stc_capacity',
  'stc_detailed_data', 'stc_discipline_strength', 'stc_competition_summary',
  'stc_equipment_gaps', 'stc_staff_roster',
  'olympic_medals', 'olympic_participation', 'olympic_timeline',
  'eco_categories', 'sport_notes',
];

const TABLES: { name: TableName; label: string; editable: string[] }[] = [
  { name: 'sports', label: 'Sports', editable: ['sport_name', 'sport_category', 'is_tops', 'is_tagg', 'is_teams'] },
  { name: 'centres', label: 'Centres', editable: ['centre_name', 'centre_type', 'state', 'district', 'is_active'] },
  { name: 'events', label: 'Events', editable: ['event_std', 'gender_std', 'event_type_std'] },
  { name: 'disciplines', label: 'Disciplines', editable: ['discipline_std', 'is_active'] },
  { name: 'ncoe_capacity', label: 'NCOE Capacity', editable: ['san_grand_total', 'ex_grand_total'] },
  { name: 'stc_capacity', label: 'STC Capacity', editable: ['san_grand_total', 'ex_grand_total'] },
  { name: 'olympic_medals', label: 'Olympic Medals', editable: ['athlete_or_team', 'medal', 'year'] },
  { name: 'olympic_participation', label: 'Olympic Participation', editable: ['athletes', 'year'] },
];

const AdminDataManager = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<TableName>('sports');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingCurrent, setExportingCurrent] = useState(false);
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
    if (isAdmin) {
      fetchTableData(activeTable);
    }
  }, [activeTable, isAdmin]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      if (error) setIsAdmin(false);
      else setIsAdmin(data === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: TableName) => {
    setTableLoading(true);
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(500);
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      toast({ title: "Error", description: `Failed to fetch ${tableName} data`, variant: "destructive" });
    } finally {
      setTableLoading(false);
    }
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const id = (row.id || row.sport_id || row.centre_id || row.event_id || row.discipline_id) as string;
    setEditingRow(id);
    setEditedData({ ...row });
  };

  const handleSave = async () => {
    if (!editingRow) return;
    
    const tableConfig = TABLES.find(t => t.name === activeTable);
    if (!tableConfig) return;

    const updateData: Record<string, unknown> = {};
    tableConfig.editable.forEach(field => {
      if (editedData[field] !== undefined) {
        updateData[field] = editedData[field];
      }
    });

    try {
      const idField = activeTable === 'sports' ? 'sport_id' : 
                      activeTable === 'centres' ? 'centre_id' :
                      activeTable === 'events' ? 'event_id' :
                      activeTable === 'disciplines' ? 'discipline_id' : 'id';
      
      const { error } = await supabase
        .from(activeTable)
        .update(updateData as never)
        .eq(idField as never, editingRow);

      if (error) throw error;

      toast({ title: "Saved", description: "Record updated successfully" });
      setEditingRow(null);
      setEditedData({});
      fetchTableData(activeTable);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  // Convert an array of rows to CSV text
  const rowsToCSV = (rows: Record<string, unknown>[]): string => {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return '';
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
    ].join('\n');
  };

  // Fetch every row from a table using 1000-row batching to bypass PostgREST limits
  const fetchAllRows = async (tableName: string): Promise<Record<string, unknown>[]> => {
    const batchSize = 1000;
    const all: Record<string, unknown>[] = [];
    let from = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: batch, error } = await supabase
        .from(tableName as never)
        .select('*')
        .range(from, from + batchSize - 1);
      if (error) throw error;
      if (!batch || batch.length === 0) break;
      all.push(...(batch as Record<string, unknown>[]));
      if (batch.length < batchSize) break;
      from += batchSize;
    }
    return all;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportCurrentTable = async () => {
    setExportingCurrent(true);
    try {
      const rows = await fetchAllRows(activeTable);
      if (rows.length === 0) {
        toast({ title: "No data", description: `${activeTable} is empty.` });
        return;
      }
      const csv = rowsToCSV(rows);
      downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
        `${activeTable}_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: "Exported", description: `${rows.length} rows from ${activeTable}` });
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    } finally {
      setExportingCurrent(false);
    }
  };

  const exportAllTables = async () => {
    setExportingAll(true);
    try {
      const zip = new JSZip();
      let totalRows = 0;
      for (const t of EXPORT_ALL_TABLES) {
        try {
          const rows = await fetchAllRows(t);
          totalRows += rows.length;
          zip.file(`${t}.csv`, rowsToCSV(rows));
        } catch (err) {
          zip.file(`${t}__ERROR.txt`, `Failed to export ${t}: ${String(err)}`);
        }
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      downloadBlob(blob, `khel-drishti-data_${new Date().toISOString().split('T')[0]}.zip`);
      toast({ title: "Exported", description: `${EXPORT_ALL_TABLES.length} tables · ${totalRows.toLocaleString()} rows` });
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    } finally {
      setExportingAll(false);
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getRowId = (row: Record<string, unknown>) => {
    return (row.id || row.sport_id || row.centre_id || row.event_id || row.discipline_id) as string;
  };

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
            <p className="text-muted-foreground mb-4">
              Admin access required to view this page.
            </p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const tableConfig = TABLES.find(t => t.name === activeTable);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-display text-3xl md:text-4xl">Data Manager</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportCurrentTable} variant="outline" className="gap-2" disabled={exportingCurrent}>
            {exportingCurrent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export current table
          </Button>
          <Button onClick={exportAllTables} className="gap-2" disabled={exportingAll}>
            {exportingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Export all data (ZIP)
          </Button>
        </div>
      </div>

      <Tabs value={activeTable} onValueChange={(v) => setActiveTable(v as TableName)}>
        <TabsList className="flex-wrap h-auto mb-4">
          {TABLES.map(table => (
            <TabsTrigger key={table.name} value={table.name}>{table.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {TABLES.map(table => (
          <TabsContent key={table.name} value={table.name}>
            <Card>
              <CardHeader>
                <CardTitle>{table.label} ({filteredData.length} records)</CardTitle>
              </CardHeader>
              <CardContent>
                {tableLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto max-w-full">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow>
                          {columns.map(col => (
                            <TableHead key={col} className="whitespace-nowrap min-w-[120px] max-w-[200px]">
                              {col.replace(/_/g, ' ')}
                              {tableConfig?.editable.includes(col) && <Edit2 className="inline ml-1 h-3 w-3 text-primary" />}
                            </TableHead>
                          ))}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.slice(0, 100).map((row) => {
                          const rowId = getRowId(row);
                          const isEditing = editingRow === rowId;
                          
                          return (
                            <TableRow key={rowId}>
                              {columns.map(col => (
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
                                    <Button size="sm" variant="ghost" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="ghost" onClick={handleCancel}><X className="h-4 w-4" /></Button>
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
                      <p className="text-sm text-muted-foreground mt-2">Showing first 100 of {filteredData.length} records</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDataManager;
