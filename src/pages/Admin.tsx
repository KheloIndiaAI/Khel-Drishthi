import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Users, Shield, Lock, Database, FileText, BarChart3, LogOut, MapPin } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
        } else {
          // Check admin role after setting session
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
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

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
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

  if (!session) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You must be logged in as an admin to access this page.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Admin role is required to access this page. Contact an administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl md:text-5xl">Admin Panel</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Analytics Dashboard</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View key metrics and charts</p>
            <Link to="/admin/dashboard"><Button className="w-full">View Dashboard</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Data Import</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Import CSV data into the database</p>
            <Link to="/import"><Button className="w-full">Go to Import</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Data Manager</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View, search, edit, and export all database tables</p>
            <Link to="/admin/data"><Button className="w-full">Manage Data</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export &amp; Documentation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Download all portal data (CSV) and the full schema, design and navigation reference</p>
            <Link to="/admin/export"><Button className="w-full">Open Exports</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Form Builder</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Create custom forms for data collection</p>
            <Link to="/admin/forms"><Button className="w-full">Manage Forms</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Management</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage users and assign roles</p>
            <Link to="/admin/users"><Button className="w-full">Manage Users</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Region Mapping</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Map states/UTs to regional centres</p>
            <Link to="/admin/region-mapping"><Button className="w-full">Manage Mapping</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Settings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">System configuration</p>
            <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
