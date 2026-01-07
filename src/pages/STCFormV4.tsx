import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageSEO } from "@/components/seo/PageSEO";
import { STCFormLayout } from "@/components/stc/form/STCFormLayout";
import { AccessRequestButton } from "@/components/access/AccessRequestButton";
import { Loader2, AlertCircle } from "lucide-react";
import { useCanEditCentre } from "@/hooks/useUserAccess";

export default function STCFormV4() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();

  // Check authentication
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Check if user can edit this specific centre
  const { data: canEditCentre, isLoading: accessLoading } = useCanEditCentre(
    session?.user?.id,
    centreId
  );

  // Fetch centre info for SEO and display
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

  const isLoading = sessionLoading || accessLoading || centreLoading;

  if (isLoading) {
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

  if (!canEditCentre) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 rounded-full">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">
              You don't have permission to edit data for <strong>{centreInfo?.centre_name || 'this centre'}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              If you are the centre in-charge, please request access below and an administrator will review your request.
            </p>
          </div>
          {session?.user?.id && (
            <AccessRequestButton userId={session.user.id} />
          )}
          <button 
            onClick={() => navigate('/infrastructure/stc')}
            className="text-sm text-primary hover:underline"
          >
            ← Back to STC List
          </button>
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
