import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { STCFormContainer } from '@/components/stc/STCFormContainer';
import { PageSEO } from '@/components/seo/PageSEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

const STCForm: React.FC = () => {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();

  // Check if user is admin or editor
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      const { data: isEditor } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'editor'
      });

      return { isAdmin, isEditor };
    },
    enabled: !!session?.user?.id,
  });

  // Get centre name for SEO
  const { data: centreInfo } = useQuery({
    queryKey: ['stc-info', centreId],
    queryFn: async () => {
      const { data } = await supabase
        .from('stc_capacity')
        .select('centre_name, state')
        .eq('centre_id', centreId)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!centreId,
  });

  const canEdit = userRole?.isAdmin || userRole?.isEditor;

  if (!centreId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid centre ID</p>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Authentication Required
          </h2>
          <p className="text-muted-foreground max-w-md">
            Please log in to fill the STC data collection form.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/infrastructure/stc')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to STC List
          </Button>
          <Button onClick={() => navigate('/auth')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Access Restricted
          </h2>
          <p className="text-muted-foreground max-w-md">
            Only administrators and editors can fill the STC data collection forms.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/infrastructure/stc')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to STC List
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title={`${centreInfo?.centre_name || 'STC'} Data Collection | SAI Sports`}
        description={`Comprehensive data collection form for ${centreInfo?.centre_name}, ${centreInfo?.state}`}
      />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50"
        onClick={() => navigate('/infrastructure/stc')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Exit Form
      </Button>

      <STCFormContainer centreId={centreId} />
    </>
  );
};

export default STCForm;
