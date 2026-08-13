import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import PageLoader from "@/components/ui/PageLoader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

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
const STCForm = lazy(() => import("./pages/STCForm"));
const STCFormV4 = lazy(() => import("./pages/STCFormV4"));
const STCReport = lazy(() => import("./pages/STCReport"));
const HostelDashboard = lazy(() => import("./pages/HostelDashboard"));
const HRDashboard = lazy(() => import("./pages/HRDashboard"));
const Chintan = lazy(() => import("./pages/Chintan"));
const Nada = lazy(() => import("./pages/Nada"));

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
              <Route path="/infrastructure/stc/:centreId" element={<STCForm />} />
              <Route path="/infrastructure/stc/:centreId/form" element={<STCFormV4 />} />
              <Route path="/infrastructure/stc/:centreId/report" element={<STCReport />} />
              <Route path="/infrastructure/hostel-dashboard" element={<HostelDashboard />} />
              <Route path="/infrastructure/hr-dashboard" element={<HRDashboard />} />
              <Route path="/capacity" element={<Capacity />} />
              <Route path="/geographic" element={<GeographicAnalytics />} />
              <Route path="/medals" element={<Medals />} />
              <Route path="/history" element={<Medals />} />
              
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup" element={<FirstAdminSetup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/data" element={<AdminDataManager />} />
              <Route path="/admin/export" element={<AdminExport />} />
              <Route path="/admin/forms" element={<FormBuilder />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/editor" element={<DataEditor />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/region-mapping" element={<RegionMappingAdmin />} />
              <Route path="/form/:formId" element={<PublicForm />} />
              <Route path="/import" element={<ImportData />} />
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
