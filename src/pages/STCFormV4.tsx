import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageSEO } from "@/components/seo/PageSEO";
import { STCFormLayout } from "@/components/stc/form/STCFormLayout";
import { AccessRequestButton } from "@/components/access/AccessRequestButton";
import { Loader2 } from "lucide-react";
export default function STCFormV4() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();

  // Check authentication and roles
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { isAdmin: false, isEditor: false };
      const [adminResult, editorResult] = await Promise.all([
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'editor' }),
      ]);
      return {
        isAdmin: adminResult.data || false,
        isEditor: editorResult.data || false,
      };
    },
    enabled: !!session?.user?.id,
  });

  // Fetch centre info for SEO
  const { data: centreInfo, isLoading: centreLoading } = useQuery({
    queryKey: ['centre-info', centreId],
    queryFn: async () => {
      const { data } = await supabase
        .from('stc_capacity')
        .select('centre_name, state, region')
        .eq('centre_id', centreId)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!centreId,
  });

  const canEdit = userRoles?.isAdmin || userRoles?.isEditor;

  if (rolesLoading || centreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!centreId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Centre Not Found</h1>
          <p className="text-muted-foreground">Please select a valid centre.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to access this form.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">
              You need editor access to fill STC data collection forms. 
              Request access below and an administrator will review your request.
            </p>
          </div>
          {session?.user?.id && (
            <AccessRequestButton userId={session.user.id} />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title={`Data Collection - ${centreInfo?.centre_name || 'STC'}`}
        description={`Comprehensive data collection form for ${centreInfo?.centre_name || 'Sports Training Centre'}`}
      />
      <STCFormLayout 
        centreId={centreId} 
        centreName={centreInfo?.centre_name || ''} 
        state={centreInfo?.state || ''}
        region={centreInfo?.region || ''}
      />
    </>
  );
}
