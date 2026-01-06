import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, FileText, AlertCircle } from "lucide-react";
import type { LandOwnershipData, LandOwnershipType } from "../../../utils/formConfig";
import { LAND_OWNERSHIP_OPTIONS } from "../../../utils/disciplineFOPConfig";

interface LandOwnershipCardProps {
  data: LandOwnershipData;
  onChange: (data: LandOwnershipData) => void;
  errors?: Record<string, string>;
}

export function LandOwnershipCard({ data, onChange, errors }: LandOwnershipCardProps) {
  const updateField = <K extends keyof LandOwnershipData>(
    key: K, 
    value: LandOwnershipData[K]
  ) => {
    onChange({ ...data, [key]: value });
  };

  const showMouSection = data.land_ownership && data.land_ownership !== 'Owned by SAI';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Land Area & Ownership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Land Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="land_area" className="flex items-center gap-1">
              Land Area (acres) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="land_area"
              type="number"
              min={0}
              step={0.1}
              value={data.land_area_acres || ''}
              onChange={(e) => updateField('land_area_acres', parseFloat(e.target.value) || undefined)}
              className={errors?.land_area_acres ? 'border-destructive' : ''}
            />
            {errors?.land_area_acres && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.land_area_acres}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Land Ownership <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.land_ownership || ''}
              onValueChange={(value) => updateField('land_ownership', value as LandOwnershipType)}
            >
              <SelectTrigger className={errors?.land_ownership ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select ownership type" />
              </SelectTrigger>
              <SelectContent>
                {LAND_OWNERSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.land_ownership && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.land_ownership}
              </p>
            )}
          </div>
        </div>

        {/* MOU Section - Conditional */}
        {showMouSection && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">MOU Details</span>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Is MOU signed for STC? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={data.mou_signed === true ? 'yes' : data.mou_signed === false ? 'no' : ''}
                onValueChange={(value) => updateField('mou_signed', value === 'yes')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mou_yes" />
                  <Label htmlFor="mou_yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mou_no" />
                  <Label htmlFor="mou_no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
              {errors?.mou_signed && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.mou_signed}
                </p>
              )}
            </div>

            {/* If MOU Signed */}
            {data.mou_signed === true && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="mou_tenure" className="flex items-center gap-1">
                    Tenure of MOU (years) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mou_tenure"
                    type="number"
                    min={1}
                    value={data.mou_tenure_years || ''}
                    onChange={(e) => updateField('mou_tenure_years', parseInt(e.target.value) || undefined)}
                    className={errors?.mou_tenure_years ? 'border-destructive' : ''}
                  />
                  {errors?.mou_tenure_years && (
                    <p className="text-sm text-destructive">{errors.mou_tenure_years}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mou_renewal" className="flex items-center gap-1">
                    Year MOU is due for renewal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mou_renewal"
                    type="number"
                    min={new Date().getFullYear()}
                    value={data.mou_renewal_year || ''}
                    onChange={(e) => updateField('mou_renewal_year', parseInt(e.target.value) || undefined)}
                    className={errors?.mou_renewal_year ? 'border-destructive' : ''}
                  />
                  {errors?.mou_renewal_year && (
                    <p className="text-sm text-destructive">{errors.mou_renewal_year}</p>
                  )}
                </div>
              </div>
            )}

            {/* If MOU Not Signed */}
            {data.mou_signed === false && (
              <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="mou_reason" className="flex items-center gap-1">
                  Reason for not signing MOU <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="mou_reason"
                  value={data.mou_not_signed_reason || ''}
                  onChange={(e) => updateField('mou_not_signed_reason', e.target.value)}
                  placeholder="Please explain why MOU has not been signed..."
                  rows={3}
                  className={errors?.mou_not_signed_reason ? 'border-destructive' : ''}
                />
                {errors?.mou_not_signed_reason && (
                  <p className="text-sm text-destructive">{errors.mou_not_signed_reason}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
