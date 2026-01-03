import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, Plus, Trash2 } from "lucide-react";
import type { FormData, PrefillData, EquipmentGap } from "../../utils/formConfig";

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
  "Calibration",
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

  const updateDisciplineAdequacy = (discipline: string, status: string) => {
    updateEquipment('equipment_adequacy_by_discipline', {
      ...formData.equipment.equipment_adequacy_by_discipline,
      [discipline]: status,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Equipment & Strength & Conditioning</h3>
      </div>

      {/* Equipment Overview */}
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="competition_grade"
              checked={formData.equipment.competition_grade_equipment_available || false}
              onCheckedChange={(checked) => updateEquipment('competition_grade_equipment_available', checked)}
            />
            <Label htmlFor="competition_grade" className="cursor-pointer">Competition-grade Equipment</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="video_analysis"
              checked={formData.equipment.video_analysis_system_available || false}
              onCheckedChange={(checked) => updateEquipment('video_analysis_system_available', checked)}
            />
            <Label htmlFor="video_analysis" className="cursor-pointer">Video Analysis System</Label>
          </div>
        </div>
      </div>

      {/* Discipline-wise Equipment Adequacy */}
      <div className="border-t border-border pt-6 space-y-4">
        <h4 className="font-medium text-foreground">Discipline-wise Equipment Adequacy</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disciplines.map((discipline) => (
            <div key={discipline} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              <span className="font-medium text-sm flex-1">{discipline}</span>
              <Select
                value={formData.equipment.equipment_adequacy_by_discipline?.[discipline] || ''}
                onValueChange={(value) => updateDisciplineAdequacy(discipline, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adequate">Adequate</SelectItem>
                  <SelectItem value="Partially adequate">Partially adequate</SelectItem>
                  <SelectItem value="Inadequate">Inadequate</SelectItem>
                  <SelectItem value="Not available">Not available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Upgrade Needs */}
      <div className="space-y-2">
        <Label>Equipment Upgrade Needs</Label>
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
      </div>

      {/* Equipment Gap Items */}
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
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-secondary/30 rounded-lg">
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
                placeholder="Item name"
                value={gap.gap_item_name}
                onChange={(e) => updateGap(index, 'gap_item_name', e.target.value)}
              />
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
          ))}
          {(formData.equipment.equipment_gaps || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment gaps recorded. Click "Add Gap Item" if needed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Strength & Conditioning */}
      <div className="border-t border-border pt-6 space-y-4">
        <h4 className="font-medium text-foreground">Strength & Conditioning Setup</h4>
        
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
      </div>
    </div>
  );
}
