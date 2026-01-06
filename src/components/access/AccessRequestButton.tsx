import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AccessRequestButtonProps {
  userId: string;
}

export function AccessRequestButton({ userId }: AccessRequestButtonProps) {
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for existing pending request
  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ['access-request', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          user_id: userId,
          requested_role: 'editor',
          reason: reason.trim() || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your access request has been sent to administrators." });
      queryClient.invalidateQueries({ queryKey: ['access-request', userId] });
      setShowForm(false);
      setReason("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message.includes('duplicate') 
          ? "You already have a pending request" 
          : "Failed to submit request", 
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Checking request status...</div>;
  }

  // Show status if request exists
  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      return (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Request Pending</p>
                <p className="text-sm text-muted-foreground">
                  Your access request is awaiting admin approval. Submitted {new Date(existingRequest.requested_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (existingRequest.status === 'rejected') {
      return (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Request Declined</p>
                <p className="text-sm text-muted-foreground">
                  {existingRequest.reviewer_notes || "Your request was not approved. Contact an administrator for more details."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (existingRequest.status === 'approved') {
      return (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Access Granted</p>
                <p className="text-sm text-muted-foreground">
                  Your editor access has been approved. Please refresh the page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Show request form
  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Editor Access</CardTitle>
          <CardDescription>
            Submit a request to gain access to STC data collection forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Why do you need editor access? (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => submitRequest.mutate()} 
              disabled={submitRequest.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {submitRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button onClick={() => setShowForm(true)} className="gap-2">
      <Send className="h-4 w-4" />
      Request Editor Access
    </Button>
  );
}
