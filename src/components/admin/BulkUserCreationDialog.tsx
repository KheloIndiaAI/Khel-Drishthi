import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Loader2, Download, Users, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface BulkUserCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatedCredential {
  username: string;
  email: string;
  password: string;
  name: string;
  state?: string;
  type: 'stc' | 'region';
  success: boolean;
  error?: string;
}

const DOMAIN = '@kheldrishti.local';

function generateUsername(name: string, type: 'stc' | 'region'): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 30);
  const prefix = type === 'stc' ? 'stc' : 'rc';
  return `${prefix}${cleanName}`;
}

export function BulkUserCreationDialog({ open, onOpenChange }: BulkUserCreationDialogProps) {
  const [selectedSTCs, setSelectedSTCs] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [results, setResults] = useState<CreatedCredential[] | null>(null);
  const { toast } = useToast();

  // Fetch STCs
  const { data: stcs, isLoading: loadingSTCs } = useQuery({
    queryKey: ['stcs-for-bulk-create'],
    queryFn: async () => {
      const { data } = await supabase
        .from('centres')
        .select('centre_id, centre_name, state')
        .eq('centre_type', 'STC')
        .order('centre_name');
      return data || [];
    },
    enabled: open,
  });

  // Fetch Regions
  const { data: regions, isLoading: loadingRegions } = useQuery({
    queryKey: ['regions-for-bulk-create'],
    queryFn: async () => {
      const { data } = await supabase
        .from('regional_centres')
        .select('id, name, display_name')
        .order('sort_order');
      return data || [];
    },
    enabled: open,
  });

  const toggleSTC = (centreId: string) => {
    setSelectedSTCs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(centreId)) {
        newSet.delete(centreId);
      } else {
        newSet.add(centreId);
      }
      return newSet;
    });
  };

  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) {
        newSet.delete(regionId);
      } else {
        newSet.add(regionId);
      }
      return newSet;
    });
  };

  const selectAllSTCs = () => {
    if (stcs) {
      setSelectedSTCs(new Set(stcs.map(s => s.centre_id)));
    }
  };

  const deselectAllSTCs = () => {
    setSelectedSTCs(new Set());
  };

  const selectAllRegions = () => {
    if (regions) {
      setSelectedRegions(new Set(regions.map(r => r.id)));
    }
  };

  const deselectAllRegions = () => {
    setSelectedRegions(new Set());
  };

  const createUsers = async () => {
    const totalSelected = selectedSTCs.size + selectedRegions.size;
    if (totalSelected === 0) {
      toast({ title: "No Selection", description: "Please select at least one STC or Region", variant: "destructive" });
      return;
    }

    setCreating(true);
    setResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
        return;
      }

      const allResults: CreatedCredential[] = [];

      // Create STC users
      if (selectedSTCs.size > 0) {
        const stcItems = stcs?.filter(s => selectedSTCs.has(s.centre_id)).map(s => ({
          id: s.centre_id,
          name: s.centre_name,
          state: s.state || undefined,
        })) || [];

        const { data, error } = await supabase.functions.invoke('bulk-create-users', {
          body: { type: 'stc', items: stcItems },
        });

        if (error) {
          console.error('STC creation error:', error);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data?.credentials) {
          allResults.push(...data.credentials);
        }
      }

      // Create Region users
      if (selectedRegions.size > 0) {
        const regionItems = regions?.filter(r => selectedRegions.has(r.id)).map(r => ({
          id: r.id,
          name: r.display_name || r.name,
        })) || [];

        const { data, error } = await supabase.functions.invoke('bulk-create-users', {
          body: { type: 'region', items: regionItems },
        });

        if (error) {
          console.error('Region creation error:', error);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data?.credentials) {
          allResults.push(...data.credentials);
        }
      }

      setResults(allResults);
      
      const successCount = allResults.filter(r => r.success).length;
      const failCount = allResults.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast({ 
          title: "Users Created", 
          description: `${successCount} users created successfully${failCount > 0 ? `, ${failCount} failed` : ''}` 
        });
      } else if (failCount > 0) {
        toast({ title: "Creation Failed", description: `All ${failCount} users failed to create`, variant: "destructive" });
      }

    } catch (err) {
      console.error('Bulk creation error:', err);
      toast({ title: "Error", description: "Failed to create users", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const downloadCredentialsCSV = () => {
    if (!results) return;

    const headers = ['Username', 'Email', 'Password', 'Name', 'State', 'Type', 'Status', 'Error'];
    const rows = results.map(r => [
      r.username,
      r.email,
      r.password,
      r.name,
      r.state || '',
      r.type.toUpperCase(),
      r.success ? 'Success' : 'Failed',
      r.error || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getPreviewUsername = (name: string, type: 'stc' | 'region') => {
    return generateUsername(name, type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Create Users
          </DialogTitle>
          <DialogDescription>
            Create user accounts for STC In-Charges and Regional Officers with pre-defined credentials.
          </DialogDescription>
        </DialogHeader>

        {results ? (
          // Results view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {results.filter(r => r.success).length} Created
                </Badge>
                {results.some(r => !r.success) && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {results.filter(r => !r.success).length} Failed
                  </Badge>
                )}
              </div>
              <Button onClick={downloadCredentialsCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md border ${result.success ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'bg-red-50 border-red-200 dark:bg-red-950/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.type.toUpperCase()}
                        </Badge>
                      </div>
                      {result.state && (
                        <span className="text-xs text-muted-foreground">{result.state}</span>
                      )}
                    </div>
                    <div className="mt-1 ml-6 text-sm text-muted-foreground">
                      Username: <span className="font-mono">{result.username}</span>
                      {!result.success && result.error && (
                        <span className="text-red-600 ml-2">({result.error})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setResults(null); setSelectedSTCs(new Set()); setSelectedRegions(new Set()); }}>
                Create More
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Selection view
          <Tabs defaultValue="stcs" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stcs" className="gap-2">
                <Building2 className="h-4 w-4" />
                STC In-Charges ({selectedSTCs.size})
              </TabsTrigger>
              <TabsTrigger value="regions" className="gap-2">
                <MapPin className="h-4 w-4" />
                Regional Officers ({selectedRegions.size})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stcs" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAllSTCs}>Select All</Button>
                <Button size="sm" variant="outline" onClick={deselectAllSTCs}>Deselect All</Button>
              </div>

              {loadingSTCs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="p-4 space-y-2">
                    {stcs?.map(stc => {
                      const username = getPreviewUsername(stc.centre_name, 'stc');
                      return (
                        <div 
                          key={stc.centre_id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox
                            id={stc.centre_id}
                            checked={selectedSTCs.has(stc.centre_id)}
                            onCheckedChange={() => toggleSTC(stc.centre_id)}
                          />
                          <label htmlFor={stc.centre_id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{stc.centre_name}</span>
                                <span className="text-muted-foreground text-sm ml-2">({stc.state})</span>
                              </div>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{username}</code>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="regions" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAllRegions}>Select All</Button>
                <Button size="sm" variant="outline" onClick={deselectAllRegions}>Deselect All</Button>
              </div>

              {loadingRegions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="p-4 space-y-2">
                    {regions?.map(region => {
                      const username = getPreviewUsername(region.display_name || region.name, 'region');
                      return (
                        <div 
                          key={region.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox
                            id={region.id}
                            checked={selectedRegions.has(region.id)}
                            onCheckedChange={() => toggleRegion(region.id)}
                          />
                          <label htmlFor={region.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{region.display_name || region.name}</span>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{username}</code>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Credentials Info</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    All users will be created with password: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">india@2036</code>
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Users can login with their username (e.g., <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">stcagartala</code>)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button 
                onClick={createUsers} 
                disabled={creating || (selectedSTCs.size === 0 && selectedRegions.size === 0)}
                className="gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Create {selectedSTCs.size + selectedRegions.size} Users
              </Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
