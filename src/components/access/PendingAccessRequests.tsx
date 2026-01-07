import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, UserPlus, Building2, MapPin } from "lucide-react";
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
  assignment_type?: string | null;
  requested_centre_id?: string | null;
  requested_centre_name?: string | null;
  requested_region_id?: string | null;
  requested_region_name?: string | null;
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

      // Get user profiles for the requests (including assignment info)
      const userIds = requests.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name, assignment_type, requested_centre_id, requested_region_id')
        .in('id', userIds);

      // Get centre names for requested centres
      const centreIds = profiles?.filter(p => p.requested_centre_id).map(p => p.requested_centre_id) || [];
      const { data: centres } = centreIds.length > 0 
        ? await supabase
            .from('stc_capacity')
            .select('centre_id, centre_name')
            .in('centre_id', centreIds)
        : { data: [] };

      // Get region names for requested regions
      const regionIds = profiles?.filter(p => p.requested_region_id).map(p => p.requested_region_id) || [];
      const { data: regions } = regionIds.length > 0
        ? await supabase
            .from('regional_centres')
            .select('id, display_name')
            .in('id', regionIds)
        : { data: [] };

      // Merge profile data with requests
      return requests.map(request => {
        const profile = profiles?.find(p => p.id === request.user_id);
        const centre = centres?.find(c => c.centre_id === profile?.requested_centre_id);
        const region = regions?.find(r => r.id === profile?.requested_region_id);
        
        return {
          ...request,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.name || 'Unknown',
          assignment_type: profile?.assignment_type,
          requested_centre_id: profile?.requested_centre_id,
          requested_centre_name: centre?.centre_name,
          requested_region_id: profile?.requested_region_id,
          requested_region_name: region?.display_name,
        };
      }) as AccessRequest[];
    },
  });

  const processRequest = useMutation({
    mutationFn: async ({ requestId, userId, action, notes, request }: { 
      requestId: string; 
      userId: string; 
      action: 'approve' | 'reject'; 
      notes: string;
      request: AccessRequest;
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

      // If approved, update user role and create assignment
      if (action === 'approve') {
        // Update user role to editor
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

        // Create assignment based on type
        if (request.assignment_type === 'centre_incharge' && request.requested_centre_id) {
          const { error: assignError } = await supabase
            .from('user_centre_assignments')
            .insert({
              user_id: userId,
              centre_id: request.requested_centre_id,
              assigned_by: sessionUserId,
            });
          if (assignError && !assignError.message.includes('duplicate')) throw assignError;
        } else if (request.assignment_type === 'regional_officer' && request.requested_region_id) {
          const { error: assignError } = await supabase
            .from('user_region_assignments')
            .insert({
              user_id: userId,
              region_id: request.requested_region_id,
              access_level: 'view_edit_approve',
              assigned_by: sessionUserId,
            });
          if (assignError && !assignError.message.includes('duplicate')) throw assignError;
        }
      }
    },
    onSuccess: (_, variables) => {
      const assignmentInfo = variables.request.assignment_type === 'centre_incharge'
        ? `for ${variables.request.requested_centre_name}`
        : variables.request.assignment_type === 'regional_officer'
        ? `for ${variables.request.requested_region_name} region`
        : '';

      toast({ 
        title: variables.action === 'approve' ? "Access Granted" : "Request Declined",
        description: variables.action === 'approve' 
          ? `User has been granted editor access ${assignmentInfo}`
          : "The access request has been declined"
      });
      queryClient.invalidateQueries({ queryKey: ['pending-access-requests'] });
      setSelectedRequest(null);
      setDialogAction(null);
      setReviewNotes("");
    },
    onError: (error) => {
      console.error('Error processing request:', error);
      toast({ title: "Error", description: "Failed to process request", variant: "destructive" });
    },
  });

  const openDialog = (request: AccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogAction(action);
    setReviewNotes("");
  };

  const getAssignmentBadge = (request: AccessRequest) => {
    if (request.assignment_type === 'centre_incharge' && request.requested_centre_name) {
      return (
        <Badge variant="outline" className="gap-1 text-xs">
          <Building2 className="h-3 w-3" />
          {request.requested_centre_name}
        </Badge>
      );
    }
    if (request.assignment_type === 'regional_officer' && request.requested_region_name) {
      return (
        <Badge variant="outline" className="gap-1 text-xs">
          <MapPin className="h-3 w-3" />
          {request.requested_region_name}
        </Badge>
      );
    }
    return <span className="text-muted-foreground text-xs italic">No assignment</span>;
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
                <TableHead>Assignment</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user_name}</TableCell>
                  <TableCell className="text-muted-foreground">{request.user_email}</TableCell>
                  <TableCell>{getAssignmentBadge(request)}</TableCell>
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
                ? `Grant editor access to ${selectedRequest?.user_name}?`
                : `Decline the access request from ${selectedRequest?.user_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          {/* Assignment Info */}
          {dialogAction === 'approve' && selectedRequest && (
            <div className="py-2 px-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Assignment:</p>
              <div className="mt-1">
                {selectedRequest.assignment_type === 'centre_incharge' ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedRequest.requested_centre_name}</span>
                  </div>
                ) : selectedRequest.assignment_type === 'regional_officer' ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedRequest.requested_region_name} Region</span>
                    <Badge variant="secondary" className="text-xs">Full Access</Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">General editor access (no specific assignment)</span>
                )}
              </div>
            </div>
          )}

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
                request: selectedRequest,
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
