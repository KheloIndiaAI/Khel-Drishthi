import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Plus, Trash2, Eye, Download, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface FormDefinition {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  is_active: boolean;
  created_at: string;
}

interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  submitted_at: string;
}

const FormBuilder = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '' });
  const [newFields, setNewFields] = useState<FormField[]>([]);
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
    if (isAdmin) fetchForms();
  }, [isAdmin]);

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

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from('form_definitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setForms(data.map(form => ({
        ...form,
        fields: (form.fields as unknown as FormField[]) || []
      })));
    }
  };

  const fetchSubmissions = async (formId: string) => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });
    
    if (!error && data) {
      setSubmissions(data.map(sub => ({
        ...sub,
        data: (sub.data as Record<string, unknown>) || {}
      })));
    }
    setShowSubmissions(true);
  };

  const addField = () => {
    setNewFields([
      ...newFields,
      { id: crypto.randomUUID(), label: '', type: 'text', required: false }
    ]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setNewFields(newFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setNewFields(newFields.filter(f => f.id !== id));
  };

  const createForm = async () => {
    if (!newForm.name || newFields.length === 0) {
      toast({ title: "Error", description: "Form name and at least one field are required", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('form_definitions')
      .insert({
        name: newForm.name,
        description: newForm.description,
        fields: newFields as unknown as Json,
        created_by: session?.user.id
      });

    if (error) {
      toast({ title: "Error", description: "Failed to create form", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Form created successfully" });
      setIsCreating(false);
      setNewForm({ name: '', description: '' });
      setNewFields([]);
      fetchForms();
    }
  };

  const toggleFormActive = async (formId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('form_definitions')
      .update({ is_active: isActive })
      .eq('id', formId);

    if (!error) fetchForms();
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form and all its submissions?')) return;

    const { error } = await supabase.from('form_definitions').delete().eq('id', formId);
    if (!error) {
      toast({ title: "Deleted", description: "Form deleted successfully" });
      fetchForms();
    }
  };

  const exportSubmissions = () => {
    if (submissions.length === 0 || !selectedForm) return;

    const fieldLabels = selectedForm.fields.map(f => f.label);
    const csvContent = [
      ['Submitted At', ...fieldLabels].join(','),
      ...submissions.map(sub => [
        new Date(sub.submitted_at).toLocaleString(),
        ...selectedForm.fields.map(f => {
          const value = sub.data[f.id];
          const stringValue = String(value ?? '');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedForm.name}_submissions.csv`;
    link.click();
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
        <h1 className="font-display text-3xl md:text-4xl">Form Builder</h1>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Form
        </Button>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Form Name</Label>
              <Input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Form Fields</Label>
                <Button size="sm" variant="outline" onClick={addField}><Plus className="h-4 w-4 mr-1" /> Add Field</Button>
              </div>
              
              {newFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start p-3 border rounded mb-2 bg-muted/50">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Field Label"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                    />
                    <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v as FormField['type'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.type === 'select' && (
                      <Input
                        className="col-span-2"
                        placeholder="Options (comma separated)"
                        value={field.options?.join(', ') || ''}
                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <Switch checked={field.required} onCheckedChange={(v) => updateField(field.id, { required: v })} />
                      <span className="text-sm">Required</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={createForm}>Create Form</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={showSubmissions} onOpenChange={setShowSubmissions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Submissions: {selectedForm?.name}</span>
              <Button size="sm" variant="outline" onClick={exportSubmissions}><Download className="h-4 w-4 mr-1" /> Export</Button>
            </DialogTitle>
          </DialogHeader>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {selectedForm?.fields.map(f => <TableHead key={f.id}>{f.label}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                    {selectedForm?.fields.map(f => (
                      <TableCell key={f.id}>{String(sub.data[f.id] ?? '-')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Forms List */}
      <div className="grid gap-4">
        {forms.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No forms created yet. Click "Create Form" to get started.
            </CardContent>
          </Card>
        ) : (
          forms.map(form => (
            <Card key={form.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active ?? true} onCheckedChange={(v) => toggleFormActive(form.id, v)} />
                  <span className="text-sm">{form.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{form.fields.length} fields • Created {new Date(form.created_at).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedForm(form); fetchSubmissions(form.id); }}>
                    <Eye className="h-4 w-4 mr-1" /> View Submissions
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteForm(form.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default FormBuilder;
