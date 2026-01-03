import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, AlertTriangle } from "lucide-react";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const ROOM_TYPES = ["Dormitory", "2-bed", "3-bed", "4-bed", "Single", "Mixed"];
const HOSTEL_AMENITIES = ["WiFi", "TV", "AC", "Recreation room", "Study room", "CCTV", "Other"];
const IMPROVEMENT_NEEDS = [
  "More rooms",
  "Better ventilation",
  "AC installation",
  "Renovation",
  "Safety upgrades",
  "Furniture",
  "Other",
];

export function Section4Hostel({ formData, setFormData }: SectionProps) {
  const updateHostel = <K extends keyof FormData['hostel']>(key: K, value: FormData['hostel'][K]) => {
    setFormData({
      ...formData,
      hostel: { ...formData.hostel, [key]: value },
    });
  };

  // Check if there are residential athletes but no hostel
  const totalResAthletes = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0), 0);
  const hasResidentialMismatch = totalResAthletes > 0 && formData.hostel.hostel_type === 'No hostel';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Hostel Facilities</h3>
      </div>

      {/* Hostel Type */}
      <div className="space-y-2">
        <Label htmlFor="hostel_type">Hostel Type <span className="text-destructive">*</span></Label>
        <Select
          value={formData.hostel.hostel_type}
          onValueChange={(value) => updateHostel('hostel_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select hostel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dormitory">Dormitory</SelectItem>
            <SelectItem value="Rooms">Rooms</SelectItem>
            <SelectItem value="Mixed">Mixed (Dormitory + Rooms)</SelectItem>
            <SelectItem value="No hostel">No hostel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Residential mismatch warning */}
      {hasResidentialMismatch && (
        <div className="flex items-start gap-2 p-4 bg-warning/10 rounded-lg border border-warning/30">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">
              You have {totalResAthletes} residential athletes but no hostel
            </p>
            <div className="mt-2">
              <Label htmlFor="residential_arrangement">Please explain the arrangement:</Label>
              <Textarea
                id="residential_arrangement"
                value={formData.hostel.residential_arrangement_note || ''}
                onChange={(e) => updateHostel('residential_arrangement_note', e.target.value)}
                placeholder="E.g., Temporary stay, nearby hostel, etc."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hostel Details */}
      {formData.hostel.hostel_type && formData.hostel.hostel_type !== 'No hostel' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hostel_capacity">Hostel Bed Capacity <span className="text-destructive">*</span></Label>
              <Input
                id="hostel_capacity"
                type="number"
                min={0}
                value={formData.hostel.hostel_bed_capacity || ''}
                onChange={(e) => updateHostel('hostel_bed_capacity', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostel_occupancy">Current Occupancy <span className="text-destructive">*</span></Label>
              <Input
                id="hostel_occupancy"
                type="number"
                min={0}
                value={formData.hostel.current_hostel_occupancy || ''}
                onChange={(e) => updateHostel('current_hostel_occupancy', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>

          {/* Room Types */}
          <div className="space-y-2">
            <Label>Room Types Available</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ROOM_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`room_${type}`}
                    checked={formData.hostel.room_types_available?.includes(type) || false}
                    onCheckedChange={(checked) => {
                      const current = formData.hostel.room_types_available || [];
                      updateHostel(
                        'room_types_available',
                        checked
                          ? [...current, type]
                          : current.filter((t) => t !== type)
                      );
                    }}
                  />
                  <Label htmlFor={`room_${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Segregation */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="gender_segregation"
                checked={formData.hostel.hostel_gender_segregation_present || false}
                onCheckedChange={(checked) => updateHostel('hostel_gender_segregation_present', checked)}
              />
              <Label htmlFor="gender_segregation" className="cursor-pointer">
                Gender Segregation Present <span className="text-destructive">*</span>
              </Label>
            </div>

            {formData.hostel.hostel_gender_segregation_present && (
              <div className="space-y-2">
                <Label>Segregation Type</Label>
                <Select
                  value={formData.hostel.hostel_gender_segregation_type || ''}
                  onValueChange={(value) => updateHostel('hostel_gender_segregation_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Separate buildings">Separate buildings</SelectItem>
                    <SelectItem value="Same building separate wings-floors">Same building, separate wings/floors</SelectItem>
                    <SelectItem value="Controlled shared common areas">Controlled shared common areas</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.hostel.hostel_gender_segregation_present === false && (
              <div className="space-y-2">
                <Label htmlFor="segregation_note">Please explain:</Label>
                <Textarea
                  id="segregation_note"
                  value={formData.hostel.hostel_gender_segregation_note || ''}
                  onChange={(e) => updateHostel('hostel_gender_segregation_note', e.target.value)}
                  placeholder="Why is gender segregation not present?"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Sanitation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Toilet Type</Label>
              <Select
                value={formData.hostel.toilet_type || ''}
                onValueChange={(value) => updateHostel('toilet_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common">Common</SelectItem>
                  <SelectItem value="Individual">Individual (attached)</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toilets_count">Functional Toilets Count</Label>
              <Input
                id="toilets_count"
                type="number"
                min={0}
                value={formData.hostel.functional_toilets_count || ''}
                onChange={(e) => updateHostel('functional_toilets_count', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Hostel Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {HOSTEL_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity_${amenity}`}
                    checked={formData.hostel.hostel_amenities?.includes(amenity) || false}
                    onCheckedChange={(checked) => {
                      const current = formData.hostel.hostel_amenities || [];
                      updateHostel(
                        'hostel_amenities',
                        checked
                          ? [...current, amenity]
                          : current.filter((a) => a !== amenity)
                      );
                    }}
                  />
                  <Label htmlFor={`amenity_${amenity}`} className="text-sm cursor-pointer">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Mess Quality (1-5)</Label>
              <Select
                value={String(formData.hostel.mess_quality_rating || '')}
                onValueChange={(value) => updateHostel('mess_quality_rating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="laundry"
                checked={formData.hostel.laundry_facility || false}
                onCheckedChange={(checked) => updateHostel('laundry_facility', checked)}
              />
              <Label htmlFor="laundry" className="cursor-pointer">Laundry Facility</Label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="recreation"
                checked={formData.hostel.recreation_facilities || false}
                onCheckedChange={(checked) => updateHostel('recreation_facilities', checked)}
              />
              <Label htmlFor="recreation" className="cursor-pointer">Recreation Facilities</Label>
            </div>
          </div>

          {/* Improvement Needs */}
          <div className="space-y-2">
            <Label>Improvement Needs</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {IMPROVEMENT_NEEDS.map((need) => (
                <div key={need} className="flex items-center gap-2">
                  <Checkbox
                    id={`need_${need}`}
                    checked={formData.hostel.hostel_improvement_needs?.includes(need) || false}
                    onCheckedChange={(checked) => {
                      const current = formData.hostel.hostel_improvement_needs || [];
                      updateHostel(
                        'hostel_improvement_needs',
                        checked
                          ? [...current, need]
                          : current.filter((n) => n !== need)
                      );
                    }}
                  />
                  <Label htmlFor={`need_${need}`} className="text-sm cursor-pointer">
                    {need}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
