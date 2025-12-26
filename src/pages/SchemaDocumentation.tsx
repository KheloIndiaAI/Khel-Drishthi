import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Database, Link2, Users, Trophy, Building2, FileText } from "lucide-react";
import PageSEO, { schemaBreadcrumbs } from "@/components/seo/PageSEO";

const schemaPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "name": "Khel Drishti Database Schema Documentation",
  "description": "Technical documentation of the Khel Drishti database schema including tables for sports, training centers, medals, capacity, and user management.",
  "url": "https://kheldrishti.com/schema",
  "author": {
    "@type": "Organization",
    "name": "Khel Drishti"
  },
  "about": {
    "@type": "SoftwareSourceCode",
    "name": "Khel Drishti Database",
    "programmingLanguage": "SQL",
    "runtimePlatform": "PostgreSQL"
  }
};

const SchemaDocumentation = () => {
  const handleExportPDF = () => {
    window.print();
  };

  const coreTablesData = [
    { table: "sports", pk: "sport_id", description: "Master sports registry with LA28/AG2026 flags, event counts, and infrastructure metrics" },
    { table: "disciplines", pk: "discipline_id", description: "Sport subdivisions (e.g., Swimming → Freestyle, Butterfly)" },
    { table: "events", pk: "event_id", description: "Competition events with gender, participant type, and games presence" },
    { table: "eco_categories", pk: "eco_category_id", description: "Ecosystem categories for sports classification" },
  ];

  const infrastructureData = [
    { table: "centres", pk: "centre_id", description: "Training centres with location, type (NCOE/STC/KIC/KISCE), and operational status" },
    { table: "centre_sport_links", pk: "id (uuid)", description: "Many-to-many bridge linking centres to sports/disciplines" },
    { table: "ncoe_capacity", pk: "id (uuid)", description: "National Centre of Excellence capacity (sanctioned vs existing, residential/non-residential)" },
    { table: "stc_capacity", pk: "id (uuid)", description: "State Training Centre capacity metrics" },
  ];

  const performanceData = [
    { table: "olympic_medals", pk: "id (uuid)", description: "Historical medal records with athlete/team, year, and games" },
    { table: "olympic_participation", pk: "id (uuid)", description: "Athlete participation counts by year and sport" },
    { table: "olympic_timeline", pk: "id (uuid)", description: "Milestone events in India's Olympic history" },
    { table: "event_overlap", pk: "id (uuid)", description: "Analysis of events present in LA28, AG2026, or both" },
  ];

  const authData = [
    { table: "profiles", pk: "id (uuid)", description: "User profile data (name, email, organization) linked to auth.users" },
    { table: "user_roles", pk: "id (uuid)", description: "Role assignments (admin/editor/viewer) per user" },
    { table: "sport_notes", pk: "id (uuid)", description: "Collaborative notes on sports with pinning and attachments" },
    { table: "form_definitions", pk: "id (uuid)", description: "Dynamic form schemas created by admins" },
    { table: "form_submissions", pk: "id (uuid)", description: "Submitted form data with timestamps" },
  ];

  const relationships = [
    { parent: "sports", child: "disciplines", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "events", joinKey: "sport_id", type: "1:Many" },
    { parent: "disciplines", child: "events", joinKey: "discipline_id", type: "1:Many" },
    { parent: "sports", child: "centre_sport_links", joinKey: "sport_id", type: "Many:Many" },
    { parent: "centres", child: "centre_sport_links", joinKey: "centre_id", type: "Many:Many" },
    { parent: "sports", child: "ncoe_capacity", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "stc_capacity", joinKey: "sport_id", type: "1:Many" },
    { parent: "centres", child: "ncoe_capacity", joinKey: "centre_id", type: "1:Many" },
    { parent: "centres", child: "stc_capacity", joinKey: "centre_id", type: "1:Many" },
    { parent: "sports", child: "olympic_medals", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "olympic_participation", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "olympic_timeline", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "event_overlap", joinKey: "sport_id", type: "1:Many" },
    { parent: "sports", child: "sport_notes", joinKey: "sport_id", type: "1:Many" },
    { parent: "auth.users", child: "profiles", joinKey: "id", type: "1:1" },
    { parent: "auth.users", child: "user_roles", joinKey: "user_id", type: "1:Many" },
    { parent: "auth.users", child: "sport_notes", joinKey: "created_by", type: "1:Many" },
    { parent: "form_definitions", child: "form_submissions", joinKey: "form_id", type: "1:Many" },
  ];

  const routes = [
    { path: "/", name: "Home", description: "Dashboard with sports grid, countdown, and stats" },
    { path: "/infrastructure", name: "Infrastructure", description: "Training centres with filters by type, state, region" },
    { path: "/medals", name: "Medals", description: "Olympic medal history with charts and timeline" },
    { path: "/capacity", name: "Capacity", description: "NCOE/STC capacity analysis" },
    { path: "/sport/:sportId", name: "Sport Detail", description: "Individual sport view with events, notes, timeline" },
    { path: "/auth", name: "Authentication", description: "Login/signup page" },
    { path: "/admin", name: "Admin Dashboard", description: "Admin overview and navigation" },
    { path: "/admin/users", name: "User Management", description: "Manage user roles and permissions" },
    { path: "/admin/data", name: "Data Manager", description: "View and manage all database tables" },
    { path: "/admin/forms", name: "Form Builder", description: "Create dynamic public forms" },
    { path: "/admin/import", name: "Import Data", description: "Bulk CSV data import" },
    { path: "/form/:formId", name: "Public Form", description: "Public form submission page" },
  ];

  return (
    <div className="min-h-screen bg-background p-8 print:p-4 print:bg-white">
      <PageSEO
        title="Schema Documentation - Database Structure"
        description="Technical documentation of the Khel Drishti database schema including tables for sports, training centers, medals, capacity, and user management."
        canonicalPath="/schema"
        keywords={["Database Schema", "API Documentation", "Data Structure", "Sports Database"]}
        jsonLd={schemaPageJsonLd}
        breadcrumbs={schemaBreadcrumbs}
      />
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .card { break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground print:text-black">Khel Drishti</h1>
            <p className="text-xl text-muted-foreground mt-2">Database Schema Documentation</p>
            <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <Button onClick={handleExportPDF} className="no-print gap-2">
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Khel Drishti is India's comprehensive sports analytics dashboard tracking the ecosystem for 
              LA 2028 Olympics and Asian Games 2026. The system manages sports data, training infrastructure, 
              athlete capacity, historical performance, and collaborative notes.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 not-prose">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">17</div>
                <div className="text-sm text-muted-foreground">Tables</div>
              </div>
              <div className="bg-chart-2/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-chart-2">18</div>
                <div className="text-sm text-muted-foreground">Relationships</div>
              </div>
              <div className="bg-chart-3/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-chart-3">12</div>
                <div className="text-sm text-muted-foreground">Routes</div>
              </div>
              <div className="bg-chart-4/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-chart-4">3</div>
                <div className="text-sm text-muted-foreground">User Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Sports Tables */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Core Sports Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Table</TableHead>
                  <TableHead className="w-[150px]">Primary Key</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coreTablesData.map((row) => (
                  <TableRow key={row.table}>
                    <TableCell className="font-mono font-medium">{row.table}</TableCell>
                    <TableCell className="font-mono text-sm">{row.pk}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Infrastructure Tables */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Infrastructure Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Table</TableHead>
                  <TableHead className="w-[150px]">Primary Key</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {infrastructureData.map((row) => (
                  <TableRow key={row.table}>
                    <TableCell className="font-mono font-medium">{row.table}</TableCell>
                    <TableCell className="font-mono text-sm">{row.pk}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Performance Tables */}
        <Card className="mb-6 page-break">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              Performance & History Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Table</TableHead>
                  <TableHead className="w-[150px]">Primary Key</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((row) => (
                  <TableRow key={row.table}>
                    <TableCell className="font-mono font-medium">{row.table}</TableCell>
                    <TableCell className="font-mono text-sm">{row.pk}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Auth & Collaboration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Authentication & Collaboration Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Table</TableHead>
                  <TableHead className="w-[150px]">Primary Key</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authData.map((row) => (
                  <TableRow key={row.table}>
                    <TableCell className="font-mono font-medium">{row.table}</TableCell>
                    <TableCell className="font-mono text-sm">{row.pk}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-orange-500" />
              Table Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent Table</TableHead>
                  <TableHead>Child Table</TableHead>
                  <TableHead>Join Key</TableHead>
                  <TableHead>Relationship</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationships.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.parent}</TableCell>
                    <TableCell className="font-mono">{row.child}</TableCell>
                    <TableCell className="font-mono text-sm">{row.joinKey}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.type === '1:1' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        row.type === '1:Many' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {row.type}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Routes */}
        <Card className="mb-6 page-break">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Application Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Path</TableHead>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((row) => (
                  <TableRow key={row.path}>
                    <TableCell className="font-mono text-sm">{row.path}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Admin</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Full CRUD on all tables</li>
                  <li>• Manage user roles</li>
                  <li>• Import/export data</li>
                  <li>• Create forms</li>
                  <li>• Delete any notes</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Editor</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Read all data</li>
                  <li>• Create notes</li>
                  <li>• Edit own notes</li>
                  <li>• Submit forms</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Viewer</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Read all public data</li>
                  <li>• View notes</li>
                  <li>• Submit forms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RLS Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Row-Level Security Summary</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">
              All tables have RLS enabled. Public read access is granted for sports, disciplines, events, 
              centres, capacity tables, and medals data. Write operations require authentication with 
              appropriate role (admin for most tables, editor for notes). The <code>has_role()</code> 
              security definer function prevents recursive RLS checks.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 print:mt-4">
          <p>Khel Drishti - India Sports Analytics Dashboard</p>
          <p>Documentation Version 1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SchemaDocumentation;
