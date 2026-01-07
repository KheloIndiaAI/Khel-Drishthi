import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HardHat } from "lucide-react";
import type { HostelData, NewHostelRequirement } from "../../../utils/formConfig";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function NewHostelRequirementCard({ hostel, updateHostel }: Props) {
  const updateNewHostel = (key: keyof NewHostelRequirement, value: boolean | number | string | undefined) => {
    updateHostel('new_hostel_requirement', {
      ...hostel.new_hostel_requirement,
      new_hostel_needed: hostel.new_hostel_requirement?.new_hostel_needed ?? false,
      [key]: value,
    });
  };

  const showDetails = hostel.new_hostel_requirement?.new_hostel_needed === true;
  const showLandDetails = hostel.new_hostel_requirement?.land_available_for_new_hostel === true;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <HardHat className="h-5 w-5 text-primary" />
          New Hostel Construction Requirement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Hostel Needed */}
        <div className="space-y-3">
          <Label>Is there a need for construction of new hostel?</Label>
          <RadioGroup
            value={hostel.new_hostel_requirement?.new_hostel_needed === true ? 'yes' : 
                   hostel.new_hostel_requirement?.new_hostel_needed === false ? 'no' : ''}
            onValueChange={(value) => updateNewHostel('new_hostel_needed', value === 'yes')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="new_hostel_yes" />
              <Label htmlFor="new_hostel_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="new_hostel_no" />
              <Label htmlFor="new_hostel_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        {showDetails && (
          <div className="space-y-6 p-4 border rounded-lg bg-secondary/20">
            {/* Land Available */}
            <div className="space-y-3">
              <Label>Is land available for new hostel? <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={hostel.new_hostel_requirement?.land_available_for_new_hostel === true ? 'yes' : 
                       hostel.new_hostel_requirement?.land_available_for_new_hostel === false ? 'no' : ''}
                onValueChange={(value) => updateNewHostel('land_available_for_new_hostel', value === 'yes')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="land_yes" />
                  <Label htmlFor="land_yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="land_no" />
                  <Label htmlFor="land_no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Land Area */}
            {showLandDetails && (
              <div className="space-y-2">
                <Label htmlFor="land_area">Land Area Available (in acres)</Label>
                <Input
                  id="land_area"
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="e.g., 2.5"
                  value={hostel.new_hostel_requirement?.land_area_for_new_hostel_acres || ''}
                  onChange={(e) => updateNewHostel('land_area_for_new_hostel_acres', parseFloat(e.target.value) || undefined)}
                />
              </div>
            )}

            {/* Beds Needed */}
            <div className="space-y-2">
              <Label htmlFor="beds_needed">How many beds are needed? <span className="text-destructive">*</span></Label>
              <Input
                id="beds_needed"
                type="number"
                min={0}
                placeholder="e.g., 100"
                value={hostel.new_hostel_requirement?.beds_needed || ''}
                onChange={(e) => updateNewHostel('beds_needed', parseInt(e.target.value) || undefined)}
              />
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <Label htmlFor="justification">Justification for new hostel <span className="text-destructive">*</span></Label>
              <Textarea
                id="justification"
                value={hostel.new_hostel_requirement?.justification || ''}
                onChange={(e) => updateNewHostel('justification', e.target.value)}
                placeholder="Explain why new hostel is needed, current constraints, expected benefits, etc."
                rows={4}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
