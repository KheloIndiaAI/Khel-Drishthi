import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

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
}

const PublicForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (formId) fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    const { data, error } = await supabase
      .from('form_definitions')
      .select('*')
      .eq('id', formId)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      setForm({
        ...data,
        fields: (data.fields as unknown as FormField[]) || []
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !formData[field.id]) {
        toast({ title: "Error", description: `${field.label} is required`, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    const { error } = await supabase.from('form_submissions').insert([{
      form_id: form.id,
      data: formData as Json
    }]);

    if (error) {
      toast({ title: "Error", description: "Failed to submit form", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const updateField = (fieldId: string, value: unknown) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!form) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Form not found or is no longer active.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your submission has been received.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {field.type === 'text' && (
                  <Input
                    value={String(formData[field.id] ?? '')}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={String(formData[field.id] ?? '')}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'email' && (
                  <Input
                    type="email"
                    value={String(formData[field.id] ?? '')}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    value={String(formData[field.id] ?? '')}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!formData[field.id]}
                      onCheckedChange={(checked) => updateField(field.id, checked)}
                    />
                    <span className="text-sm">Yes</span>
                  </div>
                )}
                
                {field.type === 'select' && field.options && (
                  <Select
                    value={String(formData[field.id] ?? '')}
                    onValueChange={(v) => updateField(field.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
            
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PublicForm;
