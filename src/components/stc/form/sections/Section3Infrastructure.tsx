import { useMemo } from "react";
import { Building2 } from "lucide-react";
import type { FormData, PrefillData, DisciplineFOPDetails, LandOwnershipData, IndoorFacilityDetails, NonSanctionedFOP, AdminBlockData } from "../../utils/formConfig";
import { LandOwnershipCard } from "./infrastructure/LandOwnershipCard";
import { DisciplineFOPCard } from "./infrastructure/DisciplineFOPCard";
import { NonSanctionedFOPSection } from "./infrastructure/NonSanctionedFOPSection";
import { GeneralFacilitiesCard } from "./infrastructure/GeneralFacilitiesCard";
import { AdministrativeBlockCard } from "./infrastructure/AdministrativeBlockCard";
import { ExpansionEnvironmentCard } from "./infrastructure/ExpansionEnvironmentCard";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section3Infrastructure({ formData, setFormData }: SectionProps) {
  // Initialize discipline FOPs from formData.disciplines if not already set
  const disciplineFOPs = useMemo(() => {
    const existingFops = formData.infrastructure.discipline_fops || [];
    
    return formData.disciplines.map(disc => {
      const existing = existingFops.find(f => f.discipline_code === disc.discipline_code);
      if (existing) return existing;
      
      return {
        discipline_code: disc.discipline_code,
        discipline_name: disc.discipline_name,
      } as DisciplineFOPDetails;
    });
  }, [formData.disciplines, formData.infrastructure.discipline_fops]);

  const updateLand = (land: LandOwnershipData) => {
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, land },
    });
  };

  const updateDisciplineFOP = (updatedFop: DisciplineFOPDetails) => {
    const updatedFops = disciplineFOPs.map(fop => 
      fop.discipline_code === updatedFop.discipline_code ? updatedFop : fop
    );
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, discipline_fops: updatedFops },
    });
  };

  const updateNonSanctionedToggle = (has: boolean) => {
    setFormData({
      ...formData,
      infrastructure: { 
        ...formData.infrastructure, 
        has_non_sanctioned_fop: has,
        non_sanctioned_fops: has ? (formData.infrastructure.non_sanctioned_fops || []) : []
      },
    });
  };

  const updateNonSanctionedFOPs = (fops: NonSanctionedFOP[]) => {
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, non_sanctioned_fops: fops },
    });
  };

  const updateWarmup = (available: boolean, description?: string) => {
    setFormData({
      ...formData,
      infrastructure: { 
        ...formData.infrastructure, 
        warmup_area_available: available,
        warmup_area_description: description
      },
    });
  };


  const updateIndoor = (indoor: IndoorFacilityDetails) => {
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, indoor_facilities: indoor },
    });
  };

  const updateSurplus = (available: boolean, acres?: number, potentialUse?: string) => {
    setFormData({
      ...formData,
      infrastructure: { 
        ...formData.infrastructure, 
        surplus_land_available: available,
        surplus_land_acres: acres,
        surplus_land_potential_use: potentialUse
      },
    });
  };

  const updateWeather = (impacts: boolean, description?: string) => {
    setFormData({
      ...formData,
      infrastructure: { 
        ...formData.infrastructure, 
        weather_impacts_training: impacts,
        weather_impact_description: description
      },
    });
  };

  const updateAdminBlock = (adminBlock: AdminBlockData) => {
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, admin_block: adminBlock },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Infrastructure & Field of Play</h2>
      </div>

      {/* Card 1: Land Area & Ownership */}
      <LandOwnershipCard
        data={formData.infrastructure.land || {}}
        onChange={updateLand}
      />

      {/* Card 2: Discipline-wise FOP */}
      {disciplineFOPs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Discipline-wise Field of Play</h3>
          {disciplineFOPs.map(fop => (
            <DisciplineFOPCard
              key={fop.discipline_code}
              fop={fop}
              onChange={updateDisciplineFOP}
            />
          ))}
        </div>
      )}

      {/* Card 3: Non-Sanctioned FOP */}
      <NonSanctionedFOPSection
        hasNonSanctionedFOP={formData.infrastructure.has_non_sanctioned_fop}
        fops={formData.infrastructure.non_sanctioned_fops || []}
        onToggle={updateNonSanctionedToggle}
        onChange={updateNonSanctionedFOPs}
        availableSports={[]}
      />

      {/* Card 4: General Facilities */}
      <GeneralFacilitiesCard
        warmupAreaAvailable={formData.infrastructure.warmup_area_available}
        warmupAreaDescription={formData.infrastructure.warmup_area_description}
        indoorFacilities={formData.infrastructure.indoor_facilities || {}}
        onWarmupChange={updateWarmup}
        onIndoorChange={updateIndoor}
      />

      {/* Card 5: Administrative Block */}
      <AdministrativeBlockCard
        data={formData.infrastructure.admin_block || { admin_block_available: false, sufficient_space_for_staff: false }}
        onChange={updateAdminBlock}
      />

      {/* Card 6: Expansion & Environment */}
      <ExpansionEnvironmentCard
        surplusLandAvailable={formData.infrastructure.surplus_land_available}
        surplusLandAcres={formData.infrastructure.surplus_land_acres}
        surplusLandPotentialUse={formData.infrastructure.surplus_land_potential_use}
        weatherImpactsTraining={formData.infrastructure.weather_impacts_training}
        weatherImpactDescription={formData.infrastructure.weather_impact_description}
        onSurplusChange={updateSurplus}
        onWeatherChange={updateWeather}
      />
    </div>
  );
}
