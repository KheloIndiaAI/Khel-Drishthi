import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import PageLoader from "@/components/ui/PageLoader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Critical path - load immediately
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Lazy load public routes
const SportDetail = lazy(() => import("./pages/SportDetail"));
const Infrastructure = lazy(() => import("./pages/Infrastructure"));
const InfrastructureInsights = lazy(() => import("./pages/InfrastructureInsights"));
const Capacity = lazy(() => import("./pages/Capacity"));
const Medals = lazy(() => import("./pages/Medals"));
const Benchmark = lazy(() => import("./pages/Benchmark"));
const Opportunities = lazy(() => import("./pages/Opportunities"));

const GeographicAnalytics = lazy(() => import("./pages/GeographicAnalytics"));
const SchemaDocumentation = lazy(() => import("./pages/SchemaDocumentation"));

// Lazy load auth routes (except Auth which is critical)
const FirstAdminSetup = lazy(() => import("./pages/FirstAdminSetup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Lazy load admin routes (bundled together)
const Admin = lazy(() => import("./pages/Admin"));
const AdminDataManager = lazy(() => import("./pages/AdminDataManager"));
const AdminExport = lazy(() => import("./pages/AdminExport"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const FormBuilder = lazy(() => import("./pages/FormBuilder"));
const PublicForm = lazy(() => import("./pages/PublicForm"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ImportData = lazy(() => import("./pages/ImportData"));
const DataEditor = lazy(() => import("./pages/DataEditor"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const RegionMappingAdmin = lazy(() => import("./pages/RegionMappingAdmin"));

// Lazy load STC form routes (bundled together)
const STCDataCollection = lazy(() => import("./pages/STCDataCollection"));
const STCFormV4 = lazy(() => import("./pages/STCFormV4"));
const STCReport = lazy(() => import("./pages/STCReport"));
const HostelDashboard = lazy(() => import("./pages/HostelDashboard"));
const HRDashboard = lazy(() => import("./pages/HRDashboard"));
const Chintan = lazy(() => import("./pages/Chintan"));
const Nada = lazy(() => import("./pages/Nada"));

// The v1 conversational STC form wrote a different JSON shape into the same
// stc_detailed_data columns as the V4 form. V4 is the single write path; old
// links are redirected to it.
const StcLegacyFormRedirect = () => {
  const { centreId } = useParams<{ centreId: string }>();
  return <Navigate to={`/infrastructure/stc/${centreId}/form`} replace />;
};

const adminOnly = (el: JSX.Element, resource: string) => (
  <RequireAuth roles={["admin"]} resource={resource}>{el}</RequireAuth>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <AppThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Critical routes */}
              <Route path="/" element={<Home />} />
              <Route path="/chintan" element={<Chintan />} />
              <Route path="/nada" element={<Nada />} />
              
              {/* Public routes */}
              <Route path="/sport/:sportId" element={<SportDetail />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/infrastructure/insights" element={<InfrastructureInsights />} />
              <Route path="/infrastructure/stc" element={<STCDataCollection />} />
              <Route path="/infrastructure/stc/:centreId" element={<StcLegacyFormRedirect />} />
              <Route path="/infrastructure/stc/:centreId/form" element={<STCFormV4 />} />
              <Route path="/infrastructure/stc/:centreId/report" element={<RequireAuth resource="STC assessment reports"><STCReport /></RequireAuth>} />
              <Route path="/infrastructure/hostel-dashboard" element={<RequireAuth resource="the hostel dashboard"><HostelDashboard /></RequireAuth>} />
              <Route path="/infrastructure/hr-dashboard" element={<RequireAuth resource="the HR dashboard"><HRDashboard /></RequireAuth>} />
              <Route path="/capacity" element={<Capacity />} />
              <Route path="/geographic" element={<GeographicAnalytics />} />
              <Route path="/medals" element={<Medals />} />
              <Route path="/history" element={<Medals />} />
              <Route path="/benchmark" element={<Benchmark />} />
              <Route path="/opportunities" element={<Opportunities />} />

              
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup" element={<FirstAdminSetup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={adminOnly(<Admin />, "the admin panel")} />
              <Route path="/admin/dashboard" element={adminOnly(<AdminDashboard />, "the admin dashboard")} />
              <Route path="/admin/data" element={adminOnly(<AdminDataManager />, "the data manager")} />
              <Route path="/admin/export" element={adminOnly(<AdminExport />, "data export")} />
              <Route path="/admin/forms" element={adminOnly(<FormBuilder />, "the form builder")} />
              <Route path="/admin/users" element={adminOnly(<UserManagement />, "user management")} />
              <Route path="/admin/editor" element={<RequireAuth roles={["admin", "editor"]} resource="the data editor"><DataEditor /></RequireAuth>} />
              <Route path="/admin/audit-logs" element={adminOnly(<AuditLogs />, "audit logs")} />
              <Route path="/admin/region-mapping" element={adminOnly(<RegionMappingAdmin />, "region mapping")} />
              <Route path="/form/:formId" element={<PublicForm />} />
              <Route path="/import" element={adminOnly(<ImportData />, "data import")} />
              <Route path="/schema" element={<SchemaDocumentation />} />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <MobileBottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppThemeProvider>
);

export default App;
