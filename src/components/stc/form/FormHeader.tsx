import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronUp, Save, CheckCircle2, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RespondentData } from "../hooks/useSTCForm";

interface FormHeaderProps {
  respondent: RespondentData;
  setRespondent: (data: RespondentData) => void;
  centreName: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  onExit: () => void;
}

export function FormHeader({
  respondent,
  setRespondent,
  centreName,
  saveStatus,
  lastSaved,
  onExit,
}: FormHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field: keyof RespondentData, value: string | number) => {
    setRespondent({ ...respondent, [field]: value });
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-display font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
            {centreName || 'STC Data Collection'}
          </h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Form v4
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            {saveStatus === 'saving' && (
              <>
                <Save className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <>
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>Save failed</span>
              </>
            )}
          </div>

          {/* Exit Button */}
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>

      {/* Collapsible Respondent Section */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-2 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Respondent: {respondent.respondent_name || 'Not set'}
              </span>
              {respondent.respondent_role && (
                <Badge variant="outline" className="text-xs">
                  {respondent.respondent_role}
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 py-4 bg-secondary/20 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_name" className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_name"
                  placeholder="Your full name"
                  value={respondent.respondent_name}
                  onChange={(e) => handleChange('respondent_name', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_mobile" className="text-xs">
                  Mobile <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_mobile"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={respondent.respondent_mobile}
                  onChange={(e) => handleChange('respondent_mobile', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_email" className="text-xs">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_email"
                  type="email"
                  placeholder="your@email.com"
                  value={respondent.respondent_email}
                  onChange={(e) => handleChange('respondent_email', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_role" className="text-xs">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={respondent.respondent_role}
                  onValueChange={(value) => handleChange('respondent_role', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIC">CIC (Centre In Charge)</SelectItem>
                    <SelectItem value="Admin Staff">Admin Staff</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Confidence (spans full width on small screens) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="data_confidence" className="text-xs">
                  Data Confidence (1-5)
                </Label>
                <Select
                  value={String(respondent.data_confidence_rating)}
                  onValueChange={(value) => handleChange('data_confidence_rating', parseInt(value))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Rate confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </header>
  );
}
