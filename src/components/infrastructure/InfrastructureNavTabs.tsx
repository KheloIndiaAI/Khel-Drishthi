import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Layers, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ViewMode = "region" | "state" | "type";

interface InfrastructureNavTabsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const InfrastructureNavTabs = ({ activeView, onViewChange }: InfrastructureNavTabsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Tabs value={activeView} onValueChange={(v) => onViewChange(v as ViewMode)} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="region" className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">By Region</span>
            <span className="sm:hidden">Region</span>
          </TabsTrigger>
          <TabsTrigger value="state" className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">By State</span>
            <span className="sm:hidden">State</span>
          </TabsTrigger>
          <TabsTrigger value="type" className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">By Type</span>
            <span className="sm:hidden">Type</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button
        variant="outline"
        onClick={() => navigate('/infrastructure/stc')}
        className="gap-2 whitespace-nowrap"
      >
        <ClipboardList className="h-4 w-4" />
        <span className="hidden md:inline">STC Data Collection</span>
        <span className="md:hidden">STC</span>
      </Button>
    </div>
  );
};
