import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Lightbulb } from "lucide-react";
import type { FormData, PrefillData, DisciplineStrength } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const INDOOR_FACILITIES = [
  "Multipurpose hall",
  "Gym",
  "S&C room",
  "Indoor court",
  "Swimming pool",
  "Other",
];

const OUTDOOR_FACILITIES = [
  "Ground/Field",
  "Track",
  "Courts",
  "Turf",
  "Other",
];

const MOU_PENDING_REASONS = [
  "Under negotiation",
  "Legal issues",
  "Budget constraints",
  "Administrative delays",
  "Partner unavailable",
  "Other",
];

export function Section3Infrastructure({ formData, setFormData }: SectionProps) {
  const updateInfra = <K extends keyof FormData['infrastructure']>(
    key: K, 
    value: FormData['infrastructure'][K]
  ) => {
    setFormData({
      ...formData,
      infrastructure: { ...formData.infrastructure, [key]: value },
    });
  };

  const updateDiscipline = (index: number, field: keyof DisciplineStrength, value: unknown) => {
    const updated = [...formData.disciplines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      disciplines: updated,
    });
  };

  return (
    <div className="space-y-8">
      {/* General Infrastructure */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          General Infrastructure
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="land_area">Land Area (acres)</Label>
            <Input
              id="land_area"
              type="number"
              min={0}
              step={0.1}
              value={formData.infrastructure.land_area_acres || ''}
              onChange={(e) => updateInfra('land_area_acres', parseFloat(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="built_up_area">Built-up Area (sq ft)</Label>
            <Input
              id="built_up_area"
              type="number"
              min={0}
              value={formData.infrastructure.built_up_area_sqft || ''}
              onChange={(e) => updateInfra('built_up_area_sqft', parseFloat(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Indoor Facilities */}
        <div className="space-y-2">
          <Label>Indoor Facilities Available</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INDOOR_FACILITIES.map((facility) => (
              <div key={facility} className="flex items-center gap-2">
                <Checkbox
                  id={`indoor_${facility}`}
                  checked={formData.infrastructure.indoor_facilities_available?.includes(facility) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.infrastructure.indoor_facilities_available || [];
                    updateInfra(
                      'indoor_facilities_available',
                      checked
                        ? [...current, facility]
                        : current.filter((f) => f !== facility)
                    );
                  }}
                />
                <Label htmlFor={`indoor_${facility}`} className="text-sm cursor-pointer">
                  {facility}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Outdoor Facilities */}
        <div className="space-y-2">
          <Label>Outdoor Facilities Available</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {OUTDOOR_FACILITIES.map((facility) => (
              <div key={facility} className="flex items-center gap-2">
                <Checkbox
                  id={`outdoor_${facility}`}
                  checked={formData.infrastructure.outdoor_facilities_available?.includes(facility) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.infrastructure.outdoor_facilities_available || [];
                    updateInfra(
                      'outdoor_facilities_available',
                      checked
                        ? [...current, facility]
                        : current.filter((f) => f !== facility)
                    );
                  }}
                />
                <Label htmlFor={`outdoor_${facility}`} className="text-sm cursor-pointer">
                  {facility}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="training_grounds">Number of Training Grounds/Courts</Label>
            <Input
              id="training_grounds"
              type="number"
              min={0}
              value={formData.infrastructure.number_of_training_grounds_or_courts || ''}
              onChange={(e) => updateInfra('number_of_training_grounds_or_courts', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition_rating">Overall Facility Condition (1-5)</Label>
            <Select
              value={String(formData.infrastructure.facility_condition_rating_overall || '')}
              onValueChange={(value) => updateInfra('facility_condition_rating_overall', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rate condition" />
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
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="floodlights"
              checked={formData.infrastructure.floodlights_anywhere_on_campus || false}
              onCheckedChange={(checked) => updateInfra('floodlights_anywhere_on_campus', checked)}
            />
            <Label htmlFor="floodlights" className="flex items-center gap-2 cursor-pointer">
              <Lightbulb className="h-4 w-4" />
              Floodlights Available
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="last_renovation">Last Renovation Year</Label>
            <Input
              id="last_renovation"
              type="number"
              min={1950}
              max={new Date().getFullYear()}
              value={formData.infrastructure.last_renovation_year || ''}
              onChange={(e) => updateInfra('last_renovation_year', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ongoing/Planned Projects</Label>
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="ongoing_projects"
                checked={formData.infrastructure.ongoing_planned_projects || false}
                onCheckedChange={(checked) => updateInfra('ongoing_planned_projects', checked)}
              />
              <Label htmlFor="ongoing_projects" className="cursor-pointer">Yes</Label>
            </div>
          </div>
        </div>

        {formData.infrastructure.ongoing_planned_projects && (
          <div className="space-y-2">
            <Label htmlFor="project_notes">Project Details</Label>
            <Textarea
              id="project_notes"
              value={formData.infrastructure.project_notes || ''}
              onChange={(e) => updateInfra('project_notes', e.target.value)}
              placeholder="Describe ongoing or planned projects..."
              rows={2}
            />
          </div>
        )}
      </div>

      {/* MoU Section */}
      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">MoU & FoP Sharing</h3>

        <div className="space-y-2">
          <Label>FoP Sharing Status</Label>
          <Select
            value={formData.infrastructure.fop_sharing_status || ''}
            onValueChange={(value) => updateInfra('fop_sharing_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sharing">Sharing</SelectItem>
              <SelectItem value="Non-sharing">Non-sharing</SelectItem>
              <SelectItem value="Partially shared">Partially shared</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="mou_signed"
            checked={formData.infrastructure.mou_signed || false}
            onCheckedChange={(checked) => updateInfra('mou_signed', checked)}
          />
          <Label htmlFor="mou_signed" className="cursor-pointer">MoU Signed with Facility Partner</Label>
        </div>

        {formData.infrastructure.mou_signed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="mou_tenure">MoU Tenure (years)</Label>
              <Input
                id="mou_tenure"
                type="number"
                min={1}
                value={formData.infrastructure.mou_tenure_years || ''}
                onChange={(e) => updateInfra('mou_tenure_years', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mou_renewal">Renewal Year</Label>
              <Input
                id="mou_renewal"
                type="number"
                min={new Date().getFullYear()}
                value={formData.infrastructure.mou_renewal_year || ''}
                onChange={(e) => updateInfra('mou_renewal_year', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        )}

        {formData.infrastructure.mou_signed === false && (
          <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
            <div className="space-y-2">
              <Label>Reasons for Pending MoU</Label>
              <div className="grid grid-cols-2 gap-2">
                {MOU_PENDING_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center gap-2">
                    <Checkbox
                      id={`mou_reason_${reason}`}
                      checked={formData.infrastructure.mou_pending_reason?.includes(reason) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.infrastructure.mou_pending_reason || [];
                        updateInfra(
                          'mou_pending_reason',
                          checked
                            ? [...current, reason]
                            : current.filter((r) => r !== reason)
                        );
                      }}
                    />
                    <Label htmlFor={`mou_reason_${reason}`} className="text-sm cursor-pointer">
                      {reason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discipline-wise Facility */}
      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Discipline-wise Facility Availability</h3>

        {formData.disciplines.map((discipline, index) => (
          <Card key={discipline.discipline_code || index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{discipline.discipline_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facility Availability</Label>
                <Select
                  value={discipline.facility_availability_status || ''}
                  onValueChange={(value) => updateDiscipline(index, 'facility_availability_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Shared-Offsite">Shared-Offsite</SelectItem>
                    <SelectItem value="Not available">Not available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discipline.facility_availability_status === 'Shared-Offsite' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-secondary/30 rounded-lg">
                  <div className="space-y-2">
                    <Label>Partner Name</Label>
                    <Input
                      value={discipline.facility_partner_name || ''}
                      onChange={(e) => updateDiscipline(index, 'facility_partner_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={discipline.facility_distance_km || ''}
                      onChange={(e) => updateDiscipline(index, 'facility_distance_km', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                </div>
              )}

              {(discipline.facility_availability_status === 'On-site' || 
                discipline.facility_availability_status === 'Shared-Offsite') && (
                <div className="space-y-4 p-3 bg-secondary/30 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>FoP Condition (1-5)</Label>
                      <Select
                        value={String(discipline.fop_condition_rating || '')}
                        onValueChange={(value) => updateDiscipline(index, 'fop_condition_rating', parseInt(value))}
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
                    <div className="space-y-2">
                      <Label>Maintenance Status</Label>
                      <Select
                        value={discipline.fop_maintenance_status || ''}
                        onValueChange={(value) => updateDiscipline(index, 'fop_maintenance_status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Well maintained">Well maintained</SelectItem>
                          <SelectItem value="Acceptable">Acceptable</SelectItem>
                          <SelectItem value="Needs repair">Needs repair</SelectItem>
                          <SelectItem value="Not usable">Not usable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
