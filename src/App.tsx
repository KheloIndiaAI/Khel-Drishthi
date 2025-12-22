import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import SportDetail from "./pages/SportDetail";
import Infrastructure from "./pages/Infrastructure";
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
            <Route path="/capacity" element={<Capacity />} />
            <Route path="/medals" element={<Medals />} />
            <Route path="/history" element={<Medals />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/data" element={<AdminDataManager />} />
            <Route path="/admin/forms" element={<FormBuilder />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/form/:formId" element={<PublicForm />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<FirstAdminSetup />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
