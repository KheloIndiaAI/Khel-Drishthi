import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, ChevronUp, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { DisciplineFOPDetails, ConditionRating, RenovationStatus, FOPType, TravelMode } from "../../../utils/formConfig";
import { 
  CONDITION_OPTIONS, 
  RENOVATION_STATUS_OPTIONS,
  TRAVEL_MODE_OPTIONS 
} from "../../../utils/disciplineFOPConfig";
import { DisciplineSpecificFields } from "./DisciplineSpecificFields";

interface DisciplineFOPCardProps {
  fop: DisciplineFOPDetails;
  onChange: (fop: DisciplineFOPDetails) => void;
  errors?: Record<string, string>;
}

export function DisciplineFOPCard({ fop, onChange, errors }: DisciplineFOPCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateField = <K extends keyof DisciplineFOPDetails>(
    key: K, 
    value: DisciplineFOPDetails[K]
  ) => {
    onChange({ ...fop, [key]: value });
  };

  const isComplete = fop.fop_exclusive_to_sai !== undefined && (
    (fop.fop_exclusive_to_sai === true && fop.fop_type && fop.fop_condition && fop.fop_renovation_status) ||
    (fop.fop_exclusive_to_sai === false && fop.fop_owned_by && fop.fop_distance_km !== undefined && fop.fop_travel_mode)
  );

  const hasErrors = Object.keys(errors || {}).some(key => 
    key.includes(fop.discipline_code)
  );

  return (
    <Card className={hasErrors ? 'border-destructive/50' : isComplete ? 'border-primary/30' : ''}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {fop.discipline_name}
                <Badge variant="secondary" className="text-xs">Sanctioned</Badge>
              </div>
              <div className="flex items-center gap-2">
                {isComplete && !hasErrors && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                {hasErrors && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* SAI Exclusivity Question */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Is FOP exclusively available for SAI? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={fop.fop_exclusive_to_sai === true ? 'yes' : fop.fop_exclusive_to_sai === false ? 'no' : ''}
                onValueChange={(value) => updateField('fop_exclusive_to_sai', value === 'yes')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`fop_exclusive_yes_${fop.discipline_code}`} />
                  <Label htmlFor={`fop_exclusive_yes_${fop.discipline_code}`} className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`fop_exclusive_no_${fop.discipline_code}`} />
                  <Label htmlFor={`fop_exclusive_no_${fop.discipline_code}`} className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* If Exclusive to SAI */}
            {fop.fop_exclusive_to_sai === true && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      FOP Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fop.fop_type || ''}
                      onValueChange={(value) => updateField('fop_type', value as FOPType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Construction Year</Label>
                    <Input
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={fop.fop_construction_year || ''}
                      onChange={(e) => updateField('fop_construction_year', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Current Condition <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fop.fop_condition || ''}
                      onValueChange={(value) => updateField('fop_condition', value as ConditionRating)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Renovation Status <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fop.fop_renovation_status || ''}
                      onValueChange={(value) => updateField('fop_renovation_status', value as RenovationStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {RENOVATION_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Discipline-specific fields */}
                <DisciplineSpecificFields
                  disciplineName={fop.discipline_name}
                  values={fop.discipline_specific || {}}
                  onChange={(values) => updateField('discipline_specific', values)}
                />
              </div>
            )}

            {/* If NOT Exclusive to SAI */}
            {fop.fop_exclusive_to_sai === false && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      FOP is owned by <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={fop.fop_owned_by || ''}
                      onChange={(e) => updateField('fop_owned_by', e.target.value)}
                      placeholder="e.g., State Sports Department, University"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Distance from STC (km) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={fop.fop_distance_km ?? ''}
                      onChange={(e) => updateField('fop_distance_km', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Mode of Travel <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={fop.fop_travel_mode || ''}
                    onValueChange={(value) => updateField('fop_travel_mode', value as TravelMode)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select travel mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_MODE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Still show discipline-specific fields */}
                <DisciplineSpecificFields
                  disciplineName={fop.discipline_name}
                  values={fop.discipline_specific || {}}
                  onChange={(values) => updateField('discipline_specific', values)}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
