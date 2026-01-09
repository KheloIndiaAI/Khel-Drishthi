import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Wifi, Monitor, AlertCircle } from "lucide-react";
import type { AdminBlockData, ConditionRating, RenovationStatus, InternetConnectivity, ITEquipmentAdequacy, FloorType } from "../../../utils/formConfig";
import { FLOOR_OPTIONS } from "../../../utils/formConfig";
import { CONDITION_OPTIONS, RENOVATION_STATUS_OPTIONS } from "../../../utils/disciplineFOPConfig";

const INTERNET_CONNECTIVITY_OPTIONS: InternetConnectivity[] = [
  'Broadband',
  '4G/Mobile',
  'Limited',
  'None'
];

const IT_EQUIPMENT_ADEQUACY_OPTIONS: ITEquipmentAdequacy[] = [
  'Adequate',
  'Partially Adequate',
  'Inadequate',
  'None'
];

interface AdministrativeBlockCardProps {
  data: AdminBlockData;
  onChange: (data: AdminBlockData) => void;
  errors?: Record<string, string>;
}

export function AdministrativeBlockCard({
  data,
  onChange,
  errors
}: AdministrativeBlockCardProps) {
  const updateField = <K extends keyof AdminBlockData>(key: K, value: AdminBlockData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Administrative Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Availability */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Administrative Block Available? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.admin_block_available === true ? 'yes' : data.admin_block_available === false ? 'no' : ''}
            onValueChange={(value) => updateField('admin_block_available', value === 'yes')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="admin_block_yes" />
              <Label htmlFor="admin_block_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="admin_block_no" />
              <Label htmlFor="admin_block_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
          {errors?.admin_block_available && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.admin_block_available}
            </p>
          )}
        </div>

        {data.admin_block_available === true && (
          <div className="space-y-6 p-4 bg-secondary/30 rounded-lg">
            {/* Building Details */}
            <div className="space-y-4">
              <Label className="font-medium text-base">Building Details</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Number of Floors</Label>
                  <Select
                    value={data.admin_block_floors || ''}
                    onValueChange={(value) => updateField('admin_block_floors', value as FloorType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floors" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOOR_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Area (sq ft)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.admin_block_area_sqft || ''}
                    onChange={(e) => updateField('admin_block_area_sqft', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 2500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Construction Year</Label>
                  <Input
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    value={data.admin_block_construction_year || ''}
                    onChange={(e) => updateField('admin_block_construction_year', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 2010"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description of Administrative Block</Label>
                <Textarea
                  value={data.admin_block_description || ''}
                  onChange={(e) => updateField('admin_block_description', e.target.value)}
                  placeholder="Describe the administrative block layout and facilities..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Condition</Label>
                  <Select
                    value={data.admin_block_condition || ''}
                    onValueChange={(value) => updateField('admin_block_condition', value as ConditionRating)}
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
                  <Label>Renovation Status</Label>
                  <Select
                    value={data.admin_block_renovation_status || ''}
                    onValueChange={(value) => updateField('admin_block_renovation_status', value as RenovationStatus)}
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
            </div>

            {/* Space Sufficiency */}
            <div className="space-y-4 border-t border-border pt-4">
              <Label className="font-medium text-base">Space Sufficiency</Label>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Does the admin block have sufficient space to accommodate staff? <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={data.sufficient_space_for_staff === true ? 'yes' : data.sufficient_space_for_staff === false ? 'no' : ''}
                  onValueChange={(value) => updateField('sufficient_space_for_staff', value === 'yes')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="space_sufficient_yes" />
                    <Label htmlFor="space_sufficient_yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="space_sufficient_no" />
                    <Label htmlFor="space_sufficient_no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
                {errors?.sufficient_space_for_staff && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.sufficient_space_for_staff}
                  </p>
                )}
              </div>

              {data.sufficient_space_for_staff === false && (
                <div className="space-y-2">
                  <Label>Describe the space constraints</Label>
                  <Textarea
                    value={data.space_insufficiency_note || ''}
                    onChange={(e) => updateField('space_insufficiency_note', e.target.value)}
                    placeholder="Explain the space constraints and how it affects staff accommodation..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Specific Facilities */}
            <div className="space-y-4 border-t border-border pt-4">
              <Label className="font-medium text-base">Specific Facilities</Label>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accounts_room"
                    checked={data.has_separate_accounts_room || false}
                    onCheckedChange={(checked) => updateField('has_separate_accounts_room', checked === true)}
                  />
                  <Label htmlFor="accounts_room" className="cursor-pointer">Separate Accounts Room</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="store_room"
                    checked={data.has_store_room || false}
                    onCheckedChange={(checked) => updateField('has_store_room', checked === true)}
                  />
                  <Label htmlFor="store_room" className="cursor-pointer">Store Room</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="meeting_room"
                    checked={data.has_meeting_room || false}
                    onCheckedChange={(checked) => updateField('has_meeting_room', checked === true)}
                  />
                  <Label htmlFor="meeting_room" className="cursor-pointer">Meeting / Conference Room</Label>
                </div>
              </div>
            </div>

            {/* IT & Connectivity */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium text-base">IT & Connectivity</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Internet Connectivity</Label>
                  <Select
                    value={data.internet_connectivity || ''}
                    onValueChange={(value) => updateField('internet_connectivity', value as InternetConnectivity)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connectivity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERNET_CONNECTIVITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <Label>IT Equipment Adequacy</Label>
                  </div>
                  <Select
                    value={data.it_equipment_adequacy || ''}
                    onValueChange={(value) => updateField('it_equipment_adequacy', value as ITEquipmentAdequacy)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select adequacy level" />
                    </SelectTrigger>
                    <SelectContent>
                      {IT_EQUIPMENT_ADEQUACY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Future Requirements */}
            <div className="space-y-4 border-t border-border pt-4">
              <Label className="font-medium text-base">Future Requirements</Label>
              
              <div className="space-y-2">
                <Label>Is a new/expanded admin block needed?</Label>
                <RadioGroup
                  value={data.new_admin_block_needed === true ? 'yes' : data.new_admin_block_needed === false ? 'no' : ''}
                  onValueChange={(value) => updateField('new_admin_block_needed', value === 'yes')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="new_admin_yes" />
                    <Label htmlFor="new_admin_yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="new_admin_no" />
                    <Label htmlFor="new_admin_no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {data.new_admin_block_needed === true && (
                <div className="space-y-2">
                  <Label>Justification for new admin block</Label>
                  <Textarea
                    value={data.new_admin_block_justification || ''}
                    onChange={(e) => updateField('new_admin_block_justification', e.target.value)}
                    placeholder="Explain why a new or expanded admin block is required..."
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
