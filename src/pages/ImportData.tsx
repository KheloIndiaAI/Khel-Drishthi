import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Upload, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

const ImportData = () => {
  const [importing, setImporting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
        } else {
          // Check admin role after setting session
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
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

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const importTable = async (tableName: string, fileName: string) => {
    if (!session?.access_token) {
      toast({ title: "Not Authenticated", description: "Please log in to import data.", variant: "destructive" });
      return;
    }

    if (!isAdmin) {
      toast({ title: "Access Denied", description: "Admin role required to import data.", variant: "destructive" });
      return;
    }

    setImporting(tableName);
    setProgress(10);

    try {
      const response = await fetch(`/data/${fileName}`);
      const csvText = await response.text();
      setProgress(30);

      const data = parseCSV(csvText);
      setProgress(50);

      const { data: result, error } = await supabase.functions.invoke('import-data', {
        body: { table: tableName, data }
      });

      setProgress(100);

      if (error) throw new Error(error.message);

      if (result.success) {
        setResults(prev => ({
          ...prev,
          [tableName]: { success: true, message: `Imported ${result.inserted} of ${result.total} records` }
        }));
        toast({ title: "Import Complete", description: `${result.inserted} ${tableName} imported.` });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResults(prev => ({ ...prev, [tableName]: { success: false, message } }));
      toast({ title: "Import Failed", description: message, variant: "destructive" });
    } finally {
      setImporting(null);
      setProgress(0);
    }
  };

  const tables = [
    { name: "disciplines", file: "disciplines.csv", desc: "85 sport disciplines" },
    { name: "events", file: "events.csv", desc: "648 medal events" },
    { name: "centre_sport_links", file: "centre_sport_links.csv", desc: "1,459 centre-sport mappings" },
    { name: "ncoe_capacity", file: "ncoe_capacity.csv", desc: "109 NCOE capacity records" },
    { name: "stc_capacity", file: "stc_capacity.csv", desc: "198 STC capacity records" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-2xl">
          <Link to="/" className="text-primary hover:underline mb-6 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="font-display text-3xl flex items-center gap-2">
                <Lock className="h-6 w-6" /> Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You must be logged in as an admin to import data.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-2xl">
          <Link to="/" className="text-primary hover:underline mb-6 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="font-display text-3xl flex items-center gap-2 text-destructive">
                <Lock className="h-6 w-6" /> Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Admin role is required to access this page. Contact an administrator if you need access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="text-primary hover:underline mb-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Import CSV Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Import data from CSV files into the database. (Admin only)
            </p>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">Importing {importing}...</p>
              </div>
            )}

            <div className="space-y-3">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-muted-foreground">{table.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {results[table.name] && (
                      <div className={`flex items-center gap-1 text-sm ${results[table.name].success ? 'text-accent' : 'text-destructive'}`}>
                        {results[table.name].success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <span>{results[table.name].message}</span>
                      </div>
                    )}
                    <Button
                      onClick={() => importTable(table.name, table.file)}
                      disabled={importing !== null}
                      variant={results[table.name]?.success ? "outline" : "default"}
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {results[table.name]?.success ? "Re-import" : "Import"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;
