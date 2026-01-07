import { Section1Identity } from "./sections/Section1Identity";
import { Section2Disciplines } from "./sections/Section2Disciplines";
import { Section3Infrastructure } from "./sections/Section3Infrastructure";
import { Section4Hostel } from "./sections/Section4Hostel";
import { Section5Staff } from "./sections/Section5Staff";
import { Section7Equipment } from "./sections/Section7Equipment";
import { Section8Talent } from "./sections/Section8Talent";
import { Section9Vision } from "./sections/Section9Vision";
import { Section10Attachments } from "./sections/Section10Attachments";
import { SectionHeader } from "./SectionHeader";
import { ValidationSummary } from "./ValidationMessage";
import type { FormSection, FormData, PrefillData } from "../utils/formConfig";

interface SectionContentProps {
  section: FormSection;
  sectionIndex: number;
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  validationErrors: Record<string, string>;
  sectionProgress?: number;
}

// 9 sections now: Identity, Disciplines, Infrastructure, Hostel, HR, Equipment, Talent, Vision, Attachments
const SECTION_COMPONENTS = [
  Section1Identity,
  Section2Disciplines,
  Section3Infrastructure,
  Section4Hostel,
  Section5Staff,
  Section7Equipment,
  Section8Talent,
  Section9Vision,
  Section10Attachments,
];

export function SectionContent({
  section,
  sectionIndex,
  formData,
  setFormData,
  prefillData,
  disciplines,
  validationErrors,
  sectionProgress = 0,
}: SectionContentProps) {
  const SectionComponent = SECTION_COMPONENTS[sectionIndex];
  const hasErrors = Object.keys(validationErrors).length > 0;
  const isComplete = sectionProgress === 100 && !hasErrors;

  // Get the STC name for dynamic title replacement
  const rawStcName = formData.core?.stc_name || prefillData.stc_name || '';
  const stcName = rawStcName ? `STC ${rawStcName}` : 'STC';
  
  // Replace {STC_NAME} placeholder in title with actual name
  const dynamicTitle = section.title.replace('{STC_NAME}', stcName);

  if (!SectionComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Section not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header with progress */}
      <SectionHeader
        title={dynamicTitle}
        description={section.description}
        sectionIndex={sectionIndex}
        progress={sectionProgress}
        isComplete={isComplete}
      />

      {/* Section Content */}
      <div className="stc-form-section">
        <SectionComponent
          formData={formData}
          setFormData={setFormData}
          prefillData={prefillData}
          disciplines={disciplines}
          errors={validationErrors}
        />
      </div>

      {/* Validation Summary */}
      <ValidationSummary errors={validationErrors} />
    </div>
  );
}
