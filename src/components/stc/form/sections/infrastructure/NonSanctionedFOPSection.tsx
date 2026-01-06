import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import type { NonSanctionedFOP, ConditionRating, RenovationStatus } from "../../../utils/formConfig";
import { CONDITION_OPTIONS, RENOVATION_STATUS_OPTIONS } from "../../../utils/disciplineFOPConfig";

interface NonSanctionedFOPSectionProps {
  hasNonSanctionedFOP?: boolean;
  fops: NonSanctionedFOP[];
  onToggle: (has: boolean) => void;
  onChange: (fops: NonSanctionedFOP[]) => void;
  availableSports: string[];
  errors?: Record<string, string>;
}

// Sports that might have FOP but not be sanctioned
const DEFAULT_SPORTS = [
  'Basketball',
  'Volleyball',
  'Football',
  'Tennis',
  'Cricket',
  'Handball',
  'Kabaddi',
  'Kho-Kho',
  'Lawn Tennis',
  'Squash',
  'Other',
];

export function NonSanctionedFOPSection({ 
  hasNonSanctionedFOP,
  fops, 
  onToggle,
  onChange,
  availableSports,
  errors 
}: NonSanctionedFOPSectionProps) {
  const sports = availableSports.length > 0 ? availableSports : DEFAULT_SPORTS;

  const addFOP = () => {
    const newFOP: NonSanctionedFOP = {
      id: crypto.randomUUID(),
      sport_name: '',
      consider_for_sanction: false,
    };
    onChange([...fops, newFOP]);
  };

  const updateFOP = (index: number, updates: Partial<NonSanctionedFOP>) => {
    const updated = [...fops];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeFOP = (index: number) => {
    onChange(fops.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Non-Sanctioned FOP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Does STC have FOP for sports NOT currently sanctioned?</Label>
          <RadioGroup
            value={hasNonSanctionedFOP === true ? 'yes' : hasNonSanctionedFOP === false ? 'no' : ''}
            onValueChange={(value) => onToggle(value === 'yes')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="ns_fop_yes" />
              <Label htmlFor="ns_fop_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="ns_fop_no" />
              <Label htmlFor="ns_fop_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        {hasNonSanctionedFOP === true && (
          <div className="space-y-4 pt-4 border-t border-border">
            {fops.map((fop, index) => (
              <div 
                key={fop.id || index} 
                className="p-4 bg-secondary/30 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-muted-foreground">
                    Non-Sanctioned FOP #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFOP(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sport</Label>
                    <Select
                      value={fop.sport_name}
                      onValueChange={(value) => updateFOP(index, { sport_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Condition</Label>
                    <Select
                      value={fop.fop_condition || ''}
                      onValueChange={(value) => updateFOP(index, { fop_condition: value as ConditionRating })}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Renovation Status</Label>
                    <Select
                      value={fop.renovation_status || ''}
                      onValueChange={(value) => updateFOP(index, { renovation_status: value as RenovationStatus })}
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

                  <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                      id={`consider_sanction_${index}`}
                      checked={fop.consider_for_sanction}
                      onCheckedChange={(checked) => updateFOP(index, { consider_for_sanction: !!checked })}
                    />
                    <Label htmlFor={`consider_sanction_${index}`} className="cursor-pointer text-sm">
                      Consider for starting sanctioned discipline?
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={fop.notes || ''}
                    onChange={(e) => updateFOP(index, { notes: e.target.value })}
                    placeholder="Additional notes about this FOP..."
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addFOP}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Non-Sanctioned FOP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
