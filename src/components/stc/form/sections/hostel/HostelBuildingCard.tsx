import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, AlertTriangle } from "lucide-react";
import type { HostelData, HostelType } from "../../../utils/formConfig";
import { HOSTEL_TYPES } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
  hasResidentialMismatch: boolean;
  totalResAthletes: number;
}

export function HostelBuildingCard({ 
  hostel, 
  updateHostel, 
  hasResidentialMismatch, 
  totalResAthletes 
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" />
          Hostel Building Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hostel Available */}
        <div className="space-y-3">
          <Label>Is hostel available at this STC? <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={hostel.hostel_available === true ? 'yes' : hostel.hostel_available === false ? 'no' : ''}
            onValueChange={(value) => updateHostel('hostel_available', value === 'yes')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="hostel_yes" />
              <Label htmlFor="hostel_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="hostel_no" />
              <Label htmlFor="hostel_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Residential mismatch warning */}
        {hasResidentialMismatch && (
          <div className="flex items-start gap-2 p-4 bg-warning/10 rounded-lg border border-warning/30">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">
                You have {totalResAthletes} residential athletes but no hostel
              </p>
              <div className="mt-2 space-y-2">
                <Label htmlFor="residential_arrangement">Please explain the arrangement: <span className="text-destructive">*</span></Label>
                <Textarea
                  id="residential_arrangement"
                  value={hostel.residential_arrangement_note || ''}
                  onChange={(e) => updateHostel('residential_arrangement_note', e.target.value)}
                  placeholder="E.g., Temporary stay, nearby hostel, rented accommodation, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Building Details - Only show if hostel available */}
        {hostel.hostel_available === true && (
          <>
            <div className="space-y-2">
              <Label htmlFor="hostel_type">Hostel Type <span className="text-destructive">*</span></Label>
              <Select
                value={hostel.hostel_type || ''}
                onValueChange={(value) => updateHostel('hostel_type', value as HostelType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hostel type" />
                </SelectTrigger>
                <SelectContent>
                  {HOSTEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building_year">Building Year / Age</Label>
                <Input
                  id="building_year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2010"
                  value={hostel.hostel_building_year || ''}
                  onChange={(e) => updateHostel('hostel_building_year', parseInt(e.target.value) || undefined)}
                />
                <p className="text-xs text-muted-foreground">Year the hostel building was constructed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floors">Number of Floors</Label>
                <Input
                  id="floors"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="e.g., 3"
                  value={hostel.number_of_floors || ''}
                  onChange={(e) => updateHostel('number_of_floors', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
