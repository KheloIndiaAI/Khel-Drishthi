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
import { UtensilsCrossed } from "lucide-react";
import type { HostelData, MessOperator, OverallQuality } from "../../../utils/formConfig";
import { QUALITY_OPTIONS } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function DiningMessCard({ hostel, updateHostel }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Dining & Mess Facilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mess Operator */}
        <div className="space-y-3">
          <Label>Mess Operated By <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={hostel.mess_operator || ''}
            onValueChange={(value) => updateHostel('mess_operator', value as MessOperator)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SAI" id="mess_sai" />
              <Label htmlFor="mess_sai" className="cursor-pointer">SAI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Outsourced" id="mess_outsourced" />
              <Label htmlFor="mess_outsourced" className="cursor-pointer">Outsourced</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Contractor Name */}
        {hostel.mess_operator === 'Outsourced' && (
          <div className="space-y-2">
            <Label htmlFor="contractor_name">Contractor/Agency Name <span className="text-destructive">*</span></Label>
            <Input
              id="contractor_name"
              value={hostel.mess_contractor_name || ''}
              onChange={(e) => updateHostel('mess_contractor_name', e.target.value)}
              placeholder="Enter contractor or agency name"
            />
          </div>
        )}

        {/* Dining Hall Seating Capacity */}
        <div className="space-y-2">
          <Label htmlFor="dining_capacity">Dining Hall Seating Capacity</Label>
          <Input
            id="dining_capacity"
            type="number"
            min={0}
            value={hostel.dining_seating_capacity || ''}
            onChange={(e) => updateHostel('dining_seating_capacity', parseInt(e.target.value) || undefined)}
            placeholder="Number of people that can be seated at once"
          />
        </div>

        {/* Dining Area Quality */}
        <div className="space-y-2">
          <Label htmlFor="dining_quality">Overall Dining Area Quality</Label>
          <Select
            value={hostel.dining_area_quality || ''}
            onValueChange={(value) => updateHostel('dining_area_quality', value as OverallQuality)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quality rating" />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
