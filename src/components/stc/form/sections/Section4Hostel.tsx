import { Home } from "lucide-react";
import type { FormData, PrefillData, HostelData } from "../../utils/formConfig";
import { HostelBuildingCard } from "./hostel/HostelBuildingCard";
import { HostelCapacityCard } from "./hostel/HostelCapacityCard";
import { HostelAmenitiesCard } from "./hostel/HostelAmenitiesCard";
import { ToiletSanitationCard } from "./hostel/ToiletSanitationCard";
import { DiningMessCard } from "./hostel/DiningMessCard";
import { HostelQualityCard } from "./hostel/HostelQualityCard";
import { NewHostelRequirementCard } from "./hostel/NewHostelRequirementCard";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section4Hostel({ formData, setFormData }: SectionProps) {
  const updateHostel = <K extends keyof HostelData>(key: K, value: HostelData[K]) => {
    setFormData({
      ...formData,
      hostel: { ...formData.hostel, [key]: value },
    });
  };

  // Check if there are residential athletes but no hostel
  const totalResAthletes = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0), 0);
  const hasResidentialMismatch = totalResAthletes > 0 && formData.hostel.hostel_available === false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Hostel Facilities</h3>
      </div>

      {/* Card 1: Building Details & Availability */}
      <HostelBuildingCard
        hostel={formData.hostel}
        updateHostel={updateHostel}
        hasResidentialMismatch={hasResidentialMismatch}
        totalResAthletes={totalResAthletes}
      />

      {/* Only show remaining cards if hostel is available */}
      {formData.hostel.hostel_available === true && (
        <>
          {/* Card 2: Capacity & Room Details */}
          <HostelCapacityCard hostel={formData.hostel} updateHostel={updateHostel} />

          {/* Card 3: Amenities */}
          <HostelAmenitiesCard hostel={formData.hostel} updateHostel={updateHostel} />

          {/* Card 4: Toilet & Sanitation */}
          <ToiletSanitationCard hostel={formData.hostel} updateHostel={updateHostel} />

          {/* Card 5: Dining & Mess */}
          <DiningMessCard hostel={formData.hostel} updateHostel={updateHostel} />

          {/* Card 6: Overall Quality */}
          <HostelQualityCard hostel={formData.hostel} updateHostel={updateHostel} />

          {/* Card 7: New Hostel Requirement */}
          <NewHostelRequirementCard hostel={formData.hostel} updateHostel={updateHostel} />
        </>
      )}
    </div>
  );
}
