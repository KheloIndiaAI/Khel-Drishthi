import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SectionSidebar } from "./SectionSidebar";
import { FormHeader } from "./FormHeader";
import { SectionContent } from "./SectionContent";
import { ReviewPage } from "./ReviewPage";
import { useSTCForm } from "../hooks/useSTCForm";
import { useAutoSave } from "../hooks/useAutoSave";
import { FORM_SECTIONS } from "../utils/formConfig";
import { Button } from "@/components/ui/button";
import { X, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleSectionChange = (index: number) => {
    setCurrentSection(index);
  };

  const handleNext = () => {
    if (currentSection < FORM_SECTIONS.length) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleExit = () => {
    triggerSave();
    navigate('/infrastructure/stc');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header with Respondent Info */}
      <FormHeader
        respondent={respondent}
        setRespondent={setRespondent}
        centreName={centreName}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        onExit={handleExit}
      />

      {/* Main Content Area - relative container for sidebar */}
      <div className="flex flex-1 relative">
        {/* Sidebar - positioned relative to content area, not header */}
        <SectionSidebar
          sections={FORM_SECTIONS}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          sectionProgress={sectionProgress}
          validationErrors={validationErrors}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          sidebarOpen ? "lg:ml-72" : "lg:ml-16"
        )}>
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === 'saving' && (
                  <>
                    <Save className="h-4 w-4 animate-pulse" />
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>Saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Save failed</span>
                  </>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentSection === FORM_SECTIONS.length}
              >
                {currentSection === FORM_SECTIONS.length - 1 ? 'Review & Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
