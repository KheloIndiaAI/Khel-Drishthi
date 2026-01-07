import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bath } from "lucide-react";
import type { HostelData } from "../../../utils/formConfig";
import { TOILET_TYPES } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function ToiletSanitationCard({ hostel, updateHostel }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bath className="h-5 w-5 text-primary" />
          Toilet & Sanitation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Toilet Type</Label>
            <Select
              value={hostel.toilet_type || ''}
              onValueChange={(value) => updateHostel('toilet_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TOILET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toilets_count">Functional Toilets Count</Label>
            <Input
              id="toilets_count"
              type="number"
              min={0}
              value={hostel.functional_toilets_count || ''}
              onChange={(e) => updateHostel('functional_toilets_count', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Toilets Sufficient */}
        <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
          <Label>Are toilet facilities sufficient? <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={hostel.toilets_sufficient === true ? 'yes' : hostel.toilets_sufficient === false ? 'no' : ''}
            onValueChange={(value) => updateHostel('toilets_sufficient', value === 'yes')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="toilets_yes" />
              <Label htmlFor="toilets_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="toilets_no" />
              <Label htmlFor="toilets_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>

          {hostel.toilets_sufficient === false && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="toilet_issues">What improvements are needed? <span className="text-destructive">*</span></Label>
              <Textarea
                id="toilet_issues"
                value={hostel.toilets_insufficiency_note || ''}
                onChange={(e) => updateHostel('toilets_insufficiency_note', e.target.value)}
                placeholder="Describe required improvements..."
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Bathroom Ratio */}
        <div className="space-y-2">
          <Label htmlFor="bathroom_ratio">Bathroom Ratio (occupants per bathroom)</Label>
          <Input
            id="bathroom_ratio"
            type="number"
            min={0}
            step={0.1}
            placeholder="e.g., 4.5"
            value={hostel.bathroom_ratio || ''}
            onChange={(e) => updateHostel('bathroom_ratio', parseFloat(e.target.value) || undefined)}
          />
          <p className="text-xs text-muted-foreground">
            Calculate: Current Occupancy ÷ Number of Bathrooms
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
