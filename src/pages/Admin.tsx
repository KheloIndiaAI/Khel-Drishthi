import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Users, Shield } from "lucide-react";

const Admin = () => {
  return (
    <DashboardLayout>
      <h1 className="font-display text-4xl md:text-5xl mb-6">Admin Panel</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Data Import</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Import CSV data into the database</p>
            <Link to="/import"><Button className="w-full">Go to Import</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Management</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage users and roles</p>
            <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
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
