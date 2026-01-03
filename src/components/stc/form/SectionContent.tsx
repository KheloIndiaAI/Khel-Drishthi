import { Section1Identity } from "./sections/Section1Identity";
import { Section2Disciplines } from "./sections/Section2Disciplines";
import { Section3Infrastructure } from "./sections/Section3Infrastructure";
import { Section4Hostel } from "./sections/Section4Hostel";
import { Section5Staff } from "./sections/Section5Staff";
import { Section6Medical } from "./sections/Section6Medical";
import { Section7Equipment } from "./sections/Section7Equipment";
import { Section8Talent } from "./sections/Section8Talent";
import { Section9Discipline } from "./sections/Section9Discipline";
import { Section10Attachments } from "./sections/Section10Attachments";
import type { FormSection, FormData, PrefillData } from "../utils/formConfig";

interface SectionContentProps {
  section: FormSection;
  sectionIndex: number;
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  validationErrors: Record<string, string>;
}

const SECTION_COMPONENTS = [
  Section1Identity,
  Section2Disciplines,
  Section3Infrastructure,
  Section4Hostel,
  Section5Staff,
  Section6Medical,
  Section7Equipment,
  Section8Talent,
  Section9Discipline,
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
}: SectionContentProps) {
  const SectionComponent = SECTION_COMPONENTS[sectionIndex];

  if (!SectionComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Section not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-display font-bold text-foreground">
          {section.title}
        </h2>
        {section.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {section.description}
          </p>
        )}
      </div>

      {/* Section Content */}
      <SectionComponent
        formData={formData}
        setFormData={setFormData}
        prefillData={prefillData}
        disciplines={disciplines}
        errors={validationErrors}
      />
    </div>
  );
}
