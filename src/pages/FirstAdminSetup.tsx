import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

const FirstAdminSetup = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && !loading) {
      checkAdminExists();
    }
  }, [session, loading]);

  const checkAdminExists = async () => {
    setChecking(true);
    try {
      // Check if current user is already admin
      const { data: isUserAdmin } = await supabase.rpc('has_role', {
        _user_id: session!.user.id,
        _role: 'admin'
      });

      if (isUserAdmin) {
        // User is already admin, redirect to admin panel
        navigate('/admin');
        return;
      }

      // Check if any admin exists by trying the setup function
      // We'll use a simple approach - count admin roles
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      setAdminExists(count !== null && count > 0);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminExists(true); // Assume admin exists on error for safety
    } finally {
      setChecking(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!session) return;

    setPromoting(true);
    try {
      const { data, error } = await supabase.rpc('setup_first_admin', {
        _user_id: session.user.id
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data === true) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: "You are now the first admin. Redirecting...",
        });
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setAdminExists(true);
        toast({
          title: "Cannot Proceed",
          description: "An admin already exists in the system.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set up admin. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in or create an account first to become the first admin.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (checking) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking system status...</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome, Admin!</h2>
            <p className="text-muted-foreground">Redirecting to admin panel...</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (adminExists) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <XCircle className="h-5 w-5" /> Admin Already Exists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              An administrator has already been set up for this system. Please contact the existing admin to get elevated permissions.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Go Home
              </Button>
              <Button onClick={() => navigate('/auth')} className="flex-1">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">First Admin Setup</CardTitle>
            <CardDescription>
              Welcome! No administrators have been configured yet. Would you like to become the first admin?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">As an admin, you will be able to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Manage all database tables and data</li>
                <li>Create and manage data collection forms</li>
                <li>Assign roles to other users</li>
                <li>Import and export data</li>
                <li>Access analytics dashboards</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm">
              <p className="text-blue-600 dark:text-blue-400">
                <strong>Logged in as:</strong> {session.user.email}
              </p>
            </div>

            <Button 
              onClick={promoteToAdmin} 
              className="w-full" 
              size="lg"
              disabled={promoting}
            >
              {promoting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Become First Admin
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This action is irreversible. You can add more admins later from the User Management page.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FirstAdminSetup;
