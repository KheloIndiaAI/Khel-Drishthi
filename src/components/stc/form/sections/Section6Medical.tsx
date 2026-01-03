import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const MEDICAL_FACILITIES = [
  "First aid room",
  "Medical room",
  "Physio room",
  "Recovery tools",
  "Ambulance",
  "Other",
  "None",
];

export function Section6Medical({ formData, setFormData }: SectionProps) {
  const updateMedical = <K extends keyof FormData['medical']>(key: K, value: FormData['medical'][K]) => {
    setFormData({
      ...formData,
      medical: { ...formData.medical, [key]: value },
    });
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    const current = formData.medical.medical_facilities_available || [];
    
    if (facility === 'None') {
      // If selecting None, clear other selections
      updateMedical('medical_facilities_available', checked ? ['None'] : []);
    } else {
      // If selecting something else, remove None
      const filtered = current.filter(f => f !== 'None');
      updateMedical(
        'medical_facilities_available',
        checked
          ? [...filtered, facility]
          : filtered.filter((f) => f !== facility)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Medical & Support Services</h3>
      </div>

      {/* Medical Facilities */}
      <div className="space-y-2">
        <Label>Medical Facilities Available</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MEDICAL_FACILITIES.map((facility) => (
            <div key={facility} className="flex items-center gap-2">
              <Checkbox
                id={`medical_${facility}`}
                checked={formData.medical.medical_facilities_available?.includes(facility) || false}
                onCheckedChange={(checked) => handleFacilityChange(facility, checked === true)}
              />
              <Label htmlFor={`medical_${facility}`} className="text-sm cursor-pointer">
                {facility}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medical_staff">Full-time Medical Staff Count</Label>
          <Input
            id="medical_staff"
            type="number"
            min={0}
            value={formData.medical.full_time_medical_staff_count || ''}
            onChange={(e) => updateMedical('full_time_medical_staff_count', parseInt(e.target.value) || undefined)}
          />
        </div>
      </div>

      {/* Specialist Availability */}
      <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
        <h4 className="font-medium text-foreground">Specialist Services</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="physio_room"
              checked={formData.medical.physiotherapy_room_available || false}
              onCheckedChange={(checked) => updateMedical('physiotherapy_room_available', checked)}
            />
            <Label htmlFor="physio_room" className="cursor-pointer">Physiotherapy Room Available</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="psychologist"
              checked={formData.medical.sports_psychologist_available || false}
              onCheckedChange={(checked) => updateMedical('sports_psychologist_available', checked)}
            />
            <Label htmlFor="psychologist" className="cursor-pointer">Sports Psychologist Available</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="nutritionist"
              checked={formData.medical.nutritionist_dietitian_available || false}
              onCheckedChange={(checked) => updateMedical('nutritionist_dietitian_available', checked)}
            />
            <Label htmlFor="nutritionist" className="cursor-pointer">Nutritionist/Dietitian Available</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="injury_protocol"
              checked={formData.medical.injury_management_protocol_present || false}
              onCheckedChange={(checked) => updateMedical('injury_management_protocol_present', checked)}
            />
            <Label htmlFor="injury_protocol" className="cursor-pointer">Injury Management Protocol</Label>
          </div>
        </div>
      </div>

      {/* Hospital Tie-up */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch
            id="hospital_tieup"
            checked={formData.medical.hospital_tie_up || false}
            onCheckedChange={(checked) => updateMedical('hospital_tie_up', checked)}
          />
          <Label htmlFor="hospital_tieup" className="cursor-pointer">Hospital Tie-up</Label>
        </div>

        {formData.medical.hospital_tie_up && (
          <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
            <Label htmlFor="hospital_details">Hospital Details (Name & Distance)</Label>
            <Input
              id="hospital_details"
              value={formData.medical.hospital_tieup_details || ''}
              onChange={(e) => updateMedical('hospital_tieup_details', e.target.value)}
              placeholder="e.g., City Hospital - 5km"
            />
          </div>
        )}
      </div>
    </div>
  );
}
