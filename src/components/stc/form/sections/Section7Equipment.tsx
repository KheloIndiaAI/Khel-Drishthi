import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Wrench, Plus, Trash2, ChevronDown, Dumbbell, Target } from "lucide-react";
import type { FormData, PrefillData, EquipmentGap, DisciplineEquipmentDetail, EquipmentUtilizationLevel, SNCMethodology } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const EQUIPMENT_UPGRADE_NEEDS = [
  "Replace",
  "Repair",
  "Add new",
  "Other",
];

const SNC_EQUIPMENT = [
  "Racks",
  "Free weights",
  "Platforms",
  "Cardio",
  "Plyo",
  "Mobility",
  "Testing equipment",
  "Other",
];

const UTILIZATION_LEVELS: { value: EquipmentUtilizationLevel; label: string }[] = [
  { value: 'Fully Utilized', label: 'Fully utilized (daily use as per training plan)' },
  { value: 'Partially Utilized', label: 'Partially utilized (used but not optimally)' },
  { value: 'Underutilized', label: 'Underutilized (rarely used despite availability)' },
  { value: 'Not Being Used', label: 'Not being used' },
];

const SNC_METHODOLOGIES: SNCMethodology[] = [
  'Strength Training',
  'Speed/Power Training',
  'Endurance Training',
  'Flexibility/Recovery',
];

const EQUIPMENT_ADEQUACY_OPTIONS = [
  'Adequate',
  'Partially Adequate',
  'Inadequate',
  'Not Available',
];

export function Section7Equipment({ formData, setFormData, disciplines }: SectionProps) {
  const updateEquipment = <K extends keyof FormData['equipment']>(
    key: K, 
    value: FormData['equipment'][K]
  ) => {
    setFormData({
      ...formData,
      equipment: { ...formData.equipment, [key]: value },
    });
  };

  // Auto-initialize discipline equipment when disciplines change
  useEffect(() => {
    const existingEquipment = formData.equipment.discipline_equipment || [];
    const existingCodes = existingEquipment.map(e => e.discipline_code);
    
    const newEquipment = disciplines
      .filter(d => !existingCodes.includes(d))
      .map(d => ({
        discipline_code: d,
        discipline_name: d,
        equipment_description: undefined,
        equipment_adequacy: undefined,
        utilization_level: undefined,
        utilization_barriers: undefined,
      }));
    
    if (newEquipment.length > 0) {
      updateEquipment('discipline_equipment', [...existingEquipment, ...newEquipment]);
    }
  }, [disciplines]);

  const addEquipmentGap = () => {
    const newGap: EquipmentGap = {
      gap_item_name: '',
      gap_qty_required: 1,
      gap_priority: 'Medium',
    };
    updateEquipment('equipment_gaps', [...(formData.equipment.equipment_gaps || []), newGap]);
  };

  const updateGap = (index: number, field: keyof EquipmentGap, value: unknown) => {
    const updated = [...(formData.equipment.equipment_gaps || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateEquipment('equipment_gaps', updated);
  };

  const removeGap = (index: number) => {
    const updated = (formData.equipment.equipment_gaps || []).filter((_, i) => i !== index);
    updateEquipment('equipment_gaps', updated);
  };

  const updateDisciplineEquipment = (
    disciplineCode: string,
    field: keyof DisciplineEquipmentDetail,
    value: string | undefined
  ) => {
    const updated = (formData.equipment.discipline_equipment || []).map(de =>
      de.discipline_code === disciplineCode
        ? { ...de, [field]: value }
        : de
    );
    updateEquipment('discipline_equipment', updated);
  };

  const hasSNCSetup = formData.equipment.snc_setup_level && formData.equipment.snc_setup_level !== 'None';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Equipment & Strength & Conditioning</h3>
      </div>

      {/* Card 1: Equipment Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Equipment Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Overall Equipment Quality (1-5)</Label>
              <Select
                value={String(formData.equipment.overall_equipment_quality_rating || '')}
                onValueChange={(value) => updateEquipment('overall_equipment_quality_rating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate quality" />
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
              <Label>Equipment Age Category</Label>
              <Select
                value={formData.equipment.equipment_age_category || ''}
                onValueChange={(value) => updateEquipment('equipment_age_category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="0-2 yrs">0-2 years</SelectItem>
                  <SelectItem value="3-5 yrs">3-5 years</SelectItem>
                  <SelectItem value=">5 yrs">&gt;5 years</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Not sure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="procurement_year">Equipment Procurement Year</Label>
              <Input
                id="procurement_year"
                type="number"
                min={1990}
                max={new Date().getFullYear()}
                value={formData.equipment.equipment_procurement_year || ''}
                onChange={(e) => updateEquipment('equipment_procurement_year', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label>Training Equipment Condition (1-5)</Label>
              <Select
                value={String(formData.equipment.training_equipment_condition_rating || '')}
                onValueChange={(value) => updateEquipment('training_equipment_condition_rating', parseInt(value))}
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

        </CardContent>
      </Card>

      {/* Card 2: Discipline-wise Sports Equipment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sports Equipment by Discipline
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe the equipment available and how it's being utilized for each sanctioned discipline.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.equipment.discipline_equipment || []).map((de) => (
            <Collapsible key={de.discipline_code} className="border rounded-lg">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{de.discipline_name}</span>
                  {de.equipment_adequacy && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      de.equipment_adequacy === 'Adequate' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      de.equipment_adequacy === 'Partially Adequate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {de.equipment_adequacy}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label>Description of equipment available</Label>
                  <Textarea
                    placeholder="Please provide details of equipment present for this discipline (e.g., type, quantity, brand, condition)"
                    value={de.equipment_description || ''}
                    onChange={(e) => updateDisciplineEquipment(de.discipline_code, 'equipment_description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Equipment Adequacy</Label>
                  <Select
                    value={de.equipment_adequacy || ''}
                    onValueChange={(value) => updateDisciplineEquipment(de.discipline_code, 'equipment_adequacy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select adequacy status" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_ADEQUACY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Equipment Utilization Level</Label>
                  <RadioGroup
                    value={de.utilization_level || ''}
                    onValueChange={(value) => updateDisciplineEquipment(de.discipline_code, 'utilization_level', value)}
                    className="space-y-2"
                  >
                    {UTILIZATION_LEVELS.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={`${de.discipline_code}-${level.value}`} />
                        <Label htmlFor={`${de.discipline_code}-${level.value}`} className="font-normal cursor-pointer">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {de.utilization_level && de.utilization_level !== 'Fully Utilized' && (
                  <div className="space-y-2">
                    <Label>Barriers to full utilization</Label>
                    <Textarea
                      placeholder="e.g., Equipment needs repair, lack of trained coaches, athletes not aware of how to use..."
                      value={de.utilization_barriers || ''}
                      onChange={(e) => updateDisciplineEquipment(de.discipline_code, 'utilization_barriers', e.target.value)}
                      rows={2}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {(formData.equipment.discipline_equipment || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No disciplines configured. Please add disciplines in Section 2.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Equipment Upgrade Needs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Equipment Upgrade Needs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {EQUIPMENT_UPGRADE_NEEDS.map((need) => (
              <div key={need} className="flex items-center gap-2">
                <Checkbox
                  id={`upgrade_${need}`}
                  checked={formData.equipment.equipment_upgrade_needs?.includes(need) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.equipment.equipment_upgrade_needs || [];
                    updateEquipment(
                      'equipment_upgrade_needs',
                      checked
                        ? [...current, need]
                        : current.filter((n) => n !== need)
                    );
                  }}
                />
                <Label htmlFor={`upgrade_${need}`} className="text-sm cursor-pointer">
                  {need}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Equipment Gap Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Equipment Gap Items</CardTitle>
            <Button size="sm" variant="outline" onClick={addEquipmentGap}>
              <Plus className="h-4 w-4 mr-1" /> Add Gap Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(formData.equipment.equipment_gaps || []).map((gap, index) => (
            <div key={index} className="p-3 bg-secondary/30 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select
                  value={gap.discipline_code || ''}
                  onValueChange={(value) => updateGap(index, 'discipline_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={gap.gap_qty_required}
                  onChange={(e) => updateGap(index, 'gap_qty_required', parseInt(e.target.value) || 1)}
                />
                <Select
                  value={gap.gap_priority}
                  onValueChange={(value) => updateGap(index, 'gap_priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeGap(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="What equipment needs to be procured on priority? What challenges are you facing (e.g., fund constraints, procurement delays, vendor issues, approval pending)?"
                value={gap.gap_item_name}
                onChange={(e) => updateGap(index, 'gap_item_name', e.target.value)}
                rows={2}
              />
            </div>
          ))}
          {(formData.equipment.equipment_gaps || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment gaps recorded. Click "Add Gap Item" if needed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 5: Strength & Conditioning Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Strength & Conditioning Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>S&C Setup Level</Label>
            <Select
              value={formData.equipment.snc_setup_level || ''}
              onValueChange={(value) => updateEquipment('snc_setup_level', value)}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dedicated">Dedicated S&C Room</SelectItem>
                <SelectItem value="Shared">Shared Facility</SelectItem>
                <SelectItem value="Minimal">Minimal Setup</SelectItem>
                <SelectItem value="None">No S&C Setup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasSNCSetup && (
            <>
              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Description of S&C setup and equipment available</Label>
                  <Textarea
                    placeholder="e.g., Dedicated 1000 sq ft gym area with power racks (4), Olympic platforms (2), free weights up to 50kg, cable machines, cardio area with treadmills and cycles..."
                    value={formData.equipment.snc_setup_description || ''}
                    onChange={(e) => updateEquipment('snc_setup_description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>S&C Equipment Categories Available</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SNC_EQUIPMENT.map((equipment) => (
                      <div key={equipment} className="flex items-center gap-2">
                        <Checkbox
                          id={`snc_${equipment}`}
                          checked={formData.equipment.snc_equipment_categories?.includes(equipment) || false}
                          onCheckedChange={(checked) => {
                            const current = formData.equipment.snc_equipment_categories || [];
                            updateEquipment(
                              'snc_equipment_categories',
                              checked
                                ? [...current, equipment]
                                : current.filter((e) => e !== equipment)
                            );
                          }}
                        />
                        <Label htmlFor={`snc_${equipment}`} className="text-sm cursor-pointer">
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>S&C Equipment Condition</Label>
                  <Select
                    value={formData.equipment.snc_equipment_condition || ''}
                    onValueChange={(value) => updateEquipment('snc_equipment_condition', value as FormData['equipment']['snc_equipment_condition'])}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Needs Minor Repair">Needs Minor Repair</SelectItem>
                      <SelectItem value="Needs Major Renovation">Needs Major Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-3">
                  <Label>Is there a structured S&C program in place?</Label>
                  <RadioGroup
                    value={formData.equipment.snc_structured_program === undefined ? '' : formData.equipment.snc_structured_program ? 'yes' : 'no'}
                    onValueChange={(value) => updateEquipment('snc_structured_program', value === 'yes')}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="snc_program_yes" />
                      <Label htmlFor="snc_program_yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="snc_program_no" />
                      <Label htmlFor="snc_program_no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Training methodologies/techniques practiced</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SNC_METHODOLOGIES.map((methodology) => (
                      <div key={methodology} className="flex items-center gap-2">
                        <Checkbox
                          id={`methodology_${methodology}`}
                          checked={formData.equipment.snc_methodologies?.includes(methodology) || false}
                          onCheckedChange={(checked) => {
                            const current = formData.equipment.snc_methodologies || [];
                            updateEquipment(
                              'snc_methodologies',
                              checked
                                ? [...current, methodology]
                                : current.filter((m) => m !== methodology)
                            );
                          }}
                        />
                        <Label htmlFor={`methodology_${methodology}`} className="text-sm cursor-pointer">
                          {methodology}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>How well is the S&C facility being utilized?</Label>
                  <RadioGroup
                    value={formData.equipment.snc_utilization_level || ''}
                    onValueChange={(value) => updateEquipment('snc_utilization_level', value as EquipmentUtilizationLevel)}
                    className="space-y-2"
                  >
                    {UTILIZATION_LEVELS.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={`snc_util_${level.value}`} />
                        <Label htmlFor={`snc_util_${level.value}`} className="font-normal cursor-pointer">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {formData.equipment.snc_utilization_level && formData.equipment.snc_utilization_level !== 'Fully Utilized' && (
                  <div className="space-y-2">
                    <Label>Barriers to S&C utilization</Label>
                    <Textarea
                      placeholder="e.g., No dedicated S&C coach, athletes not aware of benefits, time constraints due to training schedule..."
                      value={formData.equipment.snc_utilization_barriers || ''}
                      onChange={(e) => updateEquipment('snc_utilization_barriers', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {!hasSNCSetup && formData.equipment.snc_setup_level === 'None' && (
            <p className="text-sm text-muted-foreground py-2">
              No S&C setup available at this centre. Additional questions are skipped.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
