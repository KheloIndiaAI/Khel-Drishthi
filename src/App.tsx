import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import SportDetail from "./pages/SportDetail";
import Infrastructure from "./pages/Infrastructure";
import InfrastructureInsights from "./pages/InfrastructureInsights";
import Capacity from "./pages/Capacity";
import Medals from "./pages/Medals";
import Admin from "./pages/Admin";
import AdminDataManager from "./pages/AdminDataManager";
import AdminDashboard from "./pages/AdminDashboard";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import UserManagement from "./pages/UserManagement";
import FirstAdminSetup from "./pages/FirstAdminSetup";
import Auth from "./pages/Auth";
import ImportData from "./pages/ImportData";
import SchemaDocumentation from "./pages/SchemaDocumentation";
import GeographicAnalytics from "./pages/GeographicAnalytics";
import DataEditor from "./pages/DataEditor";
import AuditLogs from "./pages/AuditLogs";
import RegionMappingAdmin from "./pages/RegionMappingAdmin";
import STCDataCollection from "./pages/STCDataCollection";
import STCForm from "./pages/STCForm";
import STCFormV4 from "./pages/STCFormV4";
import STCReport from "./pages/STCReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sport/:sportId" element={<SportDetail />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/infrastructure/insights" element={<InfrastructureInsights />} />
            <Route path="/infrastructure/stc" element={<STCDataCollection />} />
            <Route path="/infrastructure/stc/:centreId" element={<STCForm />} />
            <Route path="/infrastructure/stc/:centreId/form" element={<STCFormV4 />} />
            <Route path="/infrastructure/stc/:centreId/report" element={<STCReport />} />
            <Route path="/capacity" element={<Capacity />} />
            <Route path="/geographic" element={<GeographicAnalytics />} />
            <Route path="/medals" element={<Medals />} />
            <Route path="/history" element={<Medals />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/data" element={<AdminDataManager />} />
            <Route path="/admin/forms" element={<FormBuilder />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/editor" element={<DataEditor />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/region-mapping" element={<RegionMappingAdmin />} />
            <Route path="/form/:formId" element={<PublicForm />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<FirstAdminSetup />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="/schema" element={<SchemaDocumentation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
