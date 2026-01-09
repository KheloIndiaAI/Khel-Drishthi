import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Home, AlertCircle, Info } from "lucide-react";
import type { IndoorFacilityDetails, ConditionRating, RenovationStatus } from "../../../utils/formConfig";
import { CONDITION_OPTIONS, RENOVATION_STATUS_OPTIONS } from "../../../utils/disciplineFOPConfig";

interface GeneralFacilitiesCardProps {
  warmupAreaAvailable?: boolean;
  warmupAreaDescription?: string;
  indoorFacilities: IndoorFacilityDetails;
  onWarmupChange: (available: boolean, description?: string) => void;
  onIndoorChange: (data: IndoorFacilityDetails) => void;
  errors?: Record<string, string>;
}

export function GeneralFacilitiesCard({
  warmupAreaAvailable,
  warmupAreaDescription,
  indoorFacilities,
  onWarmupChange,
  onIndoorChange,
  errors
}: GeneralFacilitiesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          General Facilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warm-up Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">🏃</span>
            <Label className="font-medium">Warm-up Area</Label>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Warm-up area (running facilities) available? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={warmupAreaAvailable === true ? 'yes' : warmupAreaAvailable === false ? 'no' : ''}
              onValueChange={(value) => onWarmupChange(value === 'yes', warmupAreaDescription)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="warmup_yes" />
                <Label htmlFor="warmup_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="warmup_no" />
                <Label htmlFor="warmup_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {errors?.warmup_area_available && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.warmup_area_available}
              </p>
            )}
          </div>

          {warmupAreaAvailable === true && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
              <Label>Description of warm-up facilities</Label>
              <Textarea
                value={warmupAreaDescription || ''}
                onChange={(e) => onWarmupChange(true, e.target.value)}
                placeholder="Describe the warm-up area facilities..."
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Indoor Facilities */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <Label className="font-medium">Indoor Facilities</Label>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Indoor facilities available? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={indoorFacilities.has_indoor_facilities === true ? 'yes' : indoorFacilities.has_indoor_facilities === false ? 'no' : ''}
              onValueChange={(value) => onIndoorChange({ 
                ...indoorFacilities, 
                has_indoor_facilities: value === 'yes' 
              })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="indoor_yes" />
                <Label htmlFor="indoor_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="indoor_no" />
                <Label htmlFor="indoor_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {errors?.has_indoor_facilities && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.has_indoor_facilities}
              </p>
            )}
          </div>

          {indoorFacilities.has_indoor_facilities === true && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label>Brief description of indoor facilities</Label>
                <Textarea
                  value={indoorFacilities.description || ''}
                  onChange={(e) => onIndoorChange({ ...indoorFacilities, description: e.target.value })}
                  placeholder="Describe the indoor facilities available..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Area (sq ft)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={indoorFacilities.area_sqft || ''}
                    onChange={(e) => onIndoorChange({ 
                      ...indoorFacilities, 
                      area_sqft: parseInt(e.target.value) || undefined 
                    })}
                  />
                  {/* Area unit confirmation nudge */}
                  <Alert className="py-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Please confirm this value is in <strong>Square Feet (sq ft)</strong>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2">
                  <Label>Construction Year</Label>
                  <Input
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    value={indoorFacilities.construction_year || ''}
                    onChange={(e) => onIndoorChange({ 
                      ...indoorFacilities, 
                      construction_year: parseInt(e.target.value) || undefined 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Current Condition <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={indoorFacilities.condition || ''}
                    onValueChange={(value) => onIndoorChange({ 
                      ...indoorFacilities, 
                      condition: value as ConditionRating 
                    })}
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
                    value={indoorFacilities.renovation_status || ''}
                    onValueChange={(value) => onIndoorChange({ 
                      ...indoorFacilities, 
                      renovation_status: value as RenovationStatus 
                    })}
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

              {/* Repair Needs Textarea */}
              <div className="space-y-2 border-t border-border pt-4">
                <Label>Repair/Maintenance Needed</Label>
                <Textarea
                  value={indoorFacilities.repair_notes || ''}
                  onChange={(e) => onIndoorChange({ ...indoorFacilities, repair_notes: e.target.value })}
                  placeholder="Details about repair or maintenance needed for indoor facilities..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  📷 Consider adding photos of indoor facilities in the Attachments section
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}