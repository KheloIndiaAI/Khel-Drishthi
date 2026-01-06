import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface AccessRequest {
  id: string;
  user_id: string;
  requested_role: AppRole;
  status: string;
  reason: string | null;
  requested_at: string;
  user_email?: string;
  user_name?: string;
}

interface PendingAccessRequestsProps {
  sessionUserId: string;
}

export function PendingAccessRequests({ sessionUserId }: PendingAccessRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pending-access-requests'],
    queryFn: async () => {
      // Get pending requests
      const { data: requests, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });
      
      if (error) throw error;
      if (!requests?.length) return [];

      // Get user profiles for the requests
      const userIds = requests.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      // Merge profile data with requests
      return requests.map(request => {
        const profile = profiles?.find(p => p.id === request.user_id);
        return {
          ...request,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.name || 'Unknown',
        };
      }) as AccessRequest[];
    },
  });

  const processRequest = useMutation({
    mutationFn: async ({ requestId, userId, action, notes }: { 
      requestId: string; 
      userId: string; 
      action: 'approve' | 'reject'; 
      notes: string;
    }) => {
      // Update the request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: sessionUserId,
          reviewer_notes: notes || null,
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;

      // If approved, update user role to editor
      if (action === 'approve') {
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: 'editor' })
            .eq('user_id', userId);
          if (roleError) throw roleError;
        } else {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'editor' });
          if (roleError) throw roleError;
        }
      }
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.action === 'approve' ? "Access Granted" : "Request Declined",
        description: variables.action === 'approve' 
          ? "User has been granted editor access"
          : "The access request has been declined"
      });
      queryClient.invalidateQueries({ queryKey: ['pending-access-requests'] });
      setSelectedRequest(null);
      setDialogAction(null);
      setReviewNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process request", variant: "destructive" });
    },
  });

  const openDialog = (request: AccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogAction(action);
    setReviewNotes("");
  };

  if (isLoading) {
    return null;
  }

  if (!pendingRequests?.length) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <UserPlus className="h-5 w-5" />
            Pending Access Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>
            Users requesting editor access to fill STC data forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user_name}</TableCell>
                  <TableCell>{request.user_email}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {request.reason || <span className="italic">No reason provided</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openDialog(request, 'approve')}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openDialog(request, 'reject')}
                      >
                        <XCircle className="h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!dialogAction} onOpenChange={() => { setDialogAction(null); setSelectedRequest(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve Access Request' : 'Decline Access Request'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve' 
                ? `Grant editor access to ${selectedRequest?.user_name}? They will be able to fill STC data collection forms.`
                : `Decline the access request from ${selectedRequest?.user_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={dialogAction === 'approve' ? "Add a note (optional)" : "Reason for declining (optional)"}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); setSelectedRequest(null); }}>
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'approve' ? 'default' : 'destructive'}
              onClick={() => selectedRequest && processRequest.mutate({
                requestId: selectedRequest.id,
                userId: selectedRequest.user_id,
                action: dialogAction!,
                notes: reviewNotes,
              })}
              disabled={processRequest.isPending}
            >
              {processRequest.isPending 
                ? "Processing..." 
                : dialogAction === 'approve' ? "Approve" : "Decline"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
