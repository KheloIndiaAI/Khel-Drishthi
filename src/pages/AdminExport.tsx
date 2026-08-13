import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Download, Archive, FileText, Loader2, Database, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import JSZip from "jszip";
import {
  ALL_EXPORT_TABLES,
  buildDataExport,
  downloadBlob,
  todayStamp,
} from "@/lib/exportAllData";
import { buildPortalDocumentation, DOC_FILENAME } from "@/lib/portalDocumentation";

type Job = "data" | "docs" | "bundle" | null;

const AdminExport = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job>(null);
  const [progress, setProgress] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        setTimeout(() => checkAdminRole(s.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) checkAdminRole(s.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      setIsAdmin(!error && data === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const onProgress = (p: { table: string; index: number; total: number }) =>
    setProgress(`${p.index} of ${p.total} · ${p.table}`);

  const handleDataExport = async () => {
    setJob("data");
    setProgress("");
    try {
      const { zip, totalRows, errors } = await buildDataExport(ALL_EXPORT_TABLES, onProgress);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      downloadBlob(blob, `khel-drishti-data_${todayStamp()}.zip`);
      toast({
        title: "Data exported",
        description: `${ALL_EXPORT_TABLES.length} tables · ${totalRows.toLocaleString()} rows${errors.length ? ` · ${errors.length} skipped` : ''}`,
      });
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    } finally {
      setJob(null);
      setProgress("");
    }
  };

  const handleDocsExport = () => {
    setJob("docs");
    try {
      const md = buildPortalDocumentation({ generatedBy: session?.user.email ?? undefined });
      downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), DOC_FILENAME);
      toast({ title: "Documentation downloaded", description: DOC_FILENAME });
    } catch (e) {
      toast({ title: "Download failed", description: String(e), variant: "destructive" });
    } finally {
      setJob(null);
    }
  };

  const handleBundleExport = async () => {
    setJob("bundle");
    setProgress("");
    try {
      const zip = new JSZip();
      const { counts, totalRows, errors } = await buildDataExport(ALL_EXPORT_TABLES, onProgress, zip);
      setProgress("Writing documentation...");
      zip.file(DOC_FILENAME, buildPortalDocumentation({ counts, generatedBy: session?.user.email ?? undefined }));
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      downloadBlob(blob, `khel-drishti-bundle_${todayStamp()}.zip`);
      toast({
        title: "Bundle downloaded",
        description: `${ALL_EXPORT_TABLES.length} tables · ${totalRows.toLocaleString()} rows + documentation${errors.length ? ` · ${errors.length} skipped` : ''}`,
      });
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    } finally {
      setJob(null);
      setProgress("");
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

  if (!session || !isAdmin) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Admin access required to view this page.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const busy = job !== null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl">Export &amp; Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Download everything the portal holds — all database tables as CSV, and a complete written
          reference covering the schema, design system, navigation and features.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" /> All portal data
            </CardTitle>
            <CardDescription>
              {ALL_EXPORT_TABLES.length} tables exported as CSV with every row, plus a README listing row counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button className="w-full gap-2" onClick={handleDataExport} disabled={busy}>
              {job === 'data' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Download data (ZIP)
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-accent" /> Portal documentation
            </CardTitle>
            <CardDescription>
              Markdown reference: database schema, relationships, security model, routes, UI/UX design
              system, feature guides and data conventions.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button variant="outline" className="w-full gap-2" onClick={handleDocsExport} disabled={busy}>
              {job === 'docs' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Download .md file
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" /> Complete bundle
            </CardTitle>
            <CardDescription>
              Everything in one archive: all CSVs plus the documentation, with live row counts embedded
              in the document.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button className="w-full gap-2" onClick={handleBundleExport} disabled={busy}>
              {job === 'bundle' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download everything
            </Button>
          </CardContent>
        </Card>
      </div>

      {busy && progress && (
        <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Exporting {progress}
        </p>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">What is included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1">Tables exported</p>
            <p className="text-muted-foreground font-mono text-xs leading-relaxed">
              {ALL_EXPORT_TABLES.join(' · ')}
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Documentation sections</p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Overview and technology stack</li>
              <li>Full database schema by domain, with columns, keys and row counts</li>
              <li>Relationship table and entity diagram</li>
              <li>Roles, RLS patterns, security-definer functions, storage and edge functions</li>
              <li>Complete route map and navigation hierarchy</li>
              <li>UI/UX design system: colour tokens, typography, layout, motion, charts, accessibility</li>
              <li>Feature guides for search, dashboards, the STC assessment form and admin tools</li>
              <li>Data conventions and known gotchas</li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            Exports run in your browser using your admin session, so access rules still apply. Large
            exports can take a minute — keep this tab open until the download starts.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminExport;
