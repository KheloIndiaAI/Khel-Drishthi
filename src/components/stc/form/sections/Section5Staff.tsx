import type { FormData, PrefillData } from "../../utils/formConfig";
import { CoachingStaffCard } from "./hr/CoachingStaffCard";
import { GroundsmenCard } from "./hr/GroundsmenCard";
import { AdminStaffCard } from "./hr/AdminStaffCard";
import { StaffAwarenessCard } from "./hr/StaffAwarenessCard";
import { SecurityStaffCard } from "./hr/SecurityStaffCard";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section5Staff({ formData, setFormData, disciplines }: SectionProps) {
  const updateStaff = <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => {
    setFormData({
      ...formData,
      staff: { ...formData.staff, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      {/* Coaching Staff */}
      <CoachingStaffCard 
        formData={formData} 
        updateStaff={updateStaff} 
        disciplines={disciplines} 
      />

      {/* Groundsmen */}
      <div className="border-t border-border pt-6">
        <GroundsmenCard formData={formData} updateStaff={updateStaff} />
      </div>

      {/* Administrative Staff */}
      <div className="border-t border-border pt-6">
        <AdminStaffCard formData={formData} updateStaff={updateStaff} />
      </div>

      {/* Staff Awareness & Knowledge */}
      <div className="border-t border-border pt-6">
        <StaffAwarenessCard formData={formData} updateStaff={updateStaff} />
      </div>

      {/* Security Staff */}
      <div className="border-t border-border pt-6">
        <SecurityStaffCard formData={formData} updateStaff={updateStaff} />
      </div>
    </div>
  );
}
