import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SectionSidebar } from "./SectionSidebar";
import { FormHeader } from "./FormHeader";
import { SectionContent } from "./SectionContent";
import { ReviewPage } from "./ReviewPage";
import { MobileBottomNav } from "./MobileBottomNav";
import { SectionCompletionFeedback } from "./SectionCompletionFeedback";
import { useSTCForm } from "../hooks/useSTCForm";
import { useAutoSave } from "../hooks/useAutoSave";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { useSwipeNavigation } from "./useSwipeNavigation";
import { FORM_SECTIONS } from "../utils/formConfig";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface STCFormLayoutProps {
  centreId: string;
  centreName: string;
  state: string;
  region: string;
}

export function STCFormLayout({ centreId, centreName, state, region }: STCFormLayoutProps) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const {
    formData,
    setFormData,
    respondent,
    setRespondent,
    prefillData,
    isLoading,
    sectionProgress,
    validationErrors,
    disciplines,
  } = useSTCForm(centreId);

  const { saveStatus, lastSaved, triggerSave } = useAutoSave({
    centreId,
    formData,
    respondent,
  });

  const isReviewSection = currentSection === FORM_SECTIONS.length;
  const currentProgress = sectionProgress[currentSection] || 0;
  const isCurrentSectionComplete = currentProgress === 100;

  const handleSectionChange = useCallback((index: number) => {
    setCurrentSection(index);
    // Scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNext = useCallback(() => {
    if (currentSection < FORM_SECTIONS.length) {
      handleSectionChange(currentSection + 1);
    }
  }, [currentSection, handleSectionChange]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      handleSectionChange(currentSection - 1);
    }
  }, [currentSection, handleSectionChange]);

  const handleExit = () => {
    triggerSave();
    navigate('/infrastructure/stc');
  };

  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation({
    currentSection,
    totalSections: FORM_SECTIONS.length,
    onSectionChange: handleSectionChange,
    onSave: triggerSave,
  });

  // Swipe navigation for mobile
  useSwipeNavigation({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 80,
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Format centre name with STC prefix
  const formattedCentreName = centreName ? `STC ${centreName}` : 'STC Data Collection';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header with Respondent Info */}
      <FormHeader
        respondent={respondent}
        setRespondent={setRespondent}
        centreName={formattedCentreName}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        onExit={handleExit}
        currentSection={currentSection}
        totalSections={FORM_SECTIONS.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <SectionSidebar
          sections={FORM_SECTIONS}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          sectionProgress={sectionProgress}
          validationErrors={validationErrors}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area with animations */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          sidebarOpen ? "lg:ml-72" : "lg:ml-16",
          "pb-24 lg:pb-8" // Extra bottom padding for mobile nav
        )}>
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {isReviewSection ? (
                  <ReviewPage
                    formData={formData}
                    respondent={respondent}
                    disciplines={disciplines}
                    centreId={centreId}
                    centreName={centreName}
                    onJumpToSection={handleSectionChange}
                  />
                ) : (
                  <SectionContent
                    section={FORM_SECTIONS[currentSection]}
                    sectionIndex={currentSection}
                    formData={formData}
                    setFormData={setFormData}
                    prefillData={prefillData}
                    disciplines={disciplines}
                    validationErrors={validationErrors[currentSection] || {}}
                    sectionProgress={currentProgress}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation Buttons */}
            <div className="hidden lg:flex mt-8 items-center justify-between border-t border-border pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className="h-11 px-5 touch-target"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {/* Keyboard shortcuts hint */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Keyboard className="h-4 w-4" />
                      <span>Keyboard shortcuts</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1.5">
                      {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="flex gap-0.5">
                            {s.keys.map((key, j) => (
                              <kbd key={j} className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                                {key}
                              </kbd>
                            ))}
                          </div>
                          <span className="text-muted-foreground">{s.description}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={handleNext}
                disabled={currentSection === FORM_SECTIONS.length}
                className="h-11 px-5 touch-target"
              >
                {currentSection === FORM_SECTIONS.length - 1 ? 'Review & Submit' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentSection={currentSection}
        totalSections={FORM_SECTIONS.length}
        sectionProgress={sectionProgress}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenSidebar={() => setSidebarOpen(true)}
        saveStatus={saveStatus}
        isReviewSection={isReviewSection}
      />

      {/* Section Completion Feedback */}
      {!isReviewSection && (
        <SectionCompletionFeedback
          isComplete={isCurrentSectionComplete}
          sectionTitle={FORM_SECTIONS[currentSection]?.title || ''}
          onNextSection={handleNext}
          isLastSection={currentSection === FORM_SECTIONS.length - 1}
        />
      )}
    </div>
  );
}
