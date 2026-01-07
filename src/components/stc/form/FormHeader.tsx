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
import { motion, AnimatePresence } from "framer-motion";
import type { RespondentData } from "../hooks/useSTCForm";

interface FormHeaderProps {
  respondent: RespondentData;
  setRespondent: (data: RespondentData) => void;
  centreName: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  onExit: () => void;
  currentSection?: number;
  totalSections?: number;
}

export function FormHeader({
  respondent,
  setRespondent,
  centreName,
  saveStatus,
  lastSaved,
  onExit,
  currentSection = 0,
  totalSections = 10,
}: FormHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof RespondentData, value: string | number) => {
    setRespondent({ ...respondent, [field]: value });
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm flex-shrink-0">
      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base sm:text-lg font-display font-bold text-foreground truncate max-w-[150px] sm:max-w-[280px]">
            {centreName}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile section indicator */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-muted-foreground">
            <span>{currentSection + 1}/{totalSections + 1}</span>
          </div>

          {/* Save Status - visible on all sizes */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={saveStatus}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              {saveStatus === 'saving' && (
                <>
                  <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse text-primary" />
                  <span className="hidden xs:inline">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && lastSaved && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                  <span className="hidden sm:inline">Saved {formatLastSaved(lastSaved)}</span>
                  <span className="sm:hidden">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                  <span>Error</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <span className="text-muted-foreground/50">–</span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Exit Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit}
            className="h-9 px-2 sm:px-3 touch-target"
          >
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>

      {/* Collapsible Respondent Section */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-2 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors touch-target">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                {respondent.respondent_name || 'Set respondent info'}
              </span>
              {respondent.respondent_role && (
                <Badge variant="outline" className="text-xs hidden sm:inline-flex flex-shrink-0">
                  {respondent.respondent_role}
                </Badge>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-4 bg-secondary/20 border-t border-border"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_name" className="text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_name"
                  placeholder="Your full name"
                  value={respondent.respondent_name}
                  onChange={(e) => handleChange('respondent_name', e.target.value)}
                  className="h-10 touch-target"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_mobile" className="text-xs font-medium">
                  Mobile <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_mobile"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={respondent.respondent_mobile}
                  onChange={(e) => handleChange('respondent_mobile', e.target.value)}
                  className="h-10 touch-target"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_email" className="text-xs font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent_email"
                  type="email"
                  placeholder="your@email.com"
                  value={respondent.respondent_email}
                  onChange={(e) => handleChange('respondent_email', e.target.value)}
                  className="h-10 touch-target"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="respondent_role" className="text-xs font-medium">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={respondent.respondent_role}
                  onValueChange={(value) => handleChange('respondent_role', value)}
                >
                  <SelectTrigger className="h-10 touch-target">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIC">CIC (Centre In Charge)</SelectItem>
                    <SelectItem value="Admin Staff">Admin Staff</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Confidence */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="data_confidence" className="text-xs font-medium">
                  Data Confidence (1-5)
                </Label>
                <Select
                  value={String(respondent.data_confidence_rating)}
                  onValueChange={(value) => handleChange('data_confidence_rating', parseInt(value))}
                >
                  <SelectTrigger className="h-10 touch-target">
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
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </header>
  );
}
