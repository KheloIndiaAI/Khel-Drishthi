import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Database, CheckCircle2 } from "lucide-react";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const NON_OPERATIONAL_REASONS = [
  "Infrastructure",
  "Coaches",
  "Hostel",
  "Safety",
  "Funding",
  "Admin",
  "Other",
];

export function Section1Identity({ formData, setFormData, prefillData, errors }: SectionProps) {
  const updateCore = <K extends keyof FormData['core']>(key: K, value: FormData['core'][K]) => {
    setFormData({
      ...formData,
      core: { ...formData.core, [key]: value },
    });
  };

  const isPrefilled = (field: string) => {
    return prefillData && (prefillData as Record<string, unknown>)[field];
  };

  return (
    <div className="space-y-6">
      {/* STC Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="stc_name">STC Name</Label>
          {isPrefilled('stc_name') && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Database className="h-3 w-3" />
              From Database
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="stc_name"
            value={formData.core.stc_name}
            onChange={(e) => updateCore('stc_name', e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Switch
              id="verify_stc_name"
              checked={formData.core.verify_stc_name}
              onCheckedChange={(checked) => updateCore('verify_stc_name', checked)}
            />
            <Label htmlFor="verify_stc_name" className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Label>
          </div>
        </div>
      </div>

      {/* State */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="state">State</Label>
          {isPrefilled('state') && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Database className="h-3 w-3" />
              From Database
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="state"
            value={formData.core.state}
            onChange={(e) => updateCore('state', e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Switch
              id="verify_state"
              checked={formData.core.verify_state}
              onCheckedChange={(checked) => updateCore('verify_state', checked)}
            />
            <Label htmlFor="verify_state" className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Label>
          </div>
        </div>
      </div>

      {/* Region/RC */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="rc_name">Region / Regional Centre</Label>
          {isPrefilled('region') && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Database className="h-3 w-3" />
              From Database
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="rc_name"
            value={formData.core.rc_name}
            onChange={(e) => updateCore('rc_name', e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Switch
              id="verify_rc_name"
              checked={formData.core.verify_rc_name}
              onCheckedChange={(checked) => updateCore('verify_rc_name', checked)}
            />
            <Label htmlFor="verify_rc_name" className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year of Establishment */}
        <div className="space-y-2">
          <Label htmlFor="year_establishment">Year of Establishment</Label>
          <Input
            id="year_establishment"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={formData.core.year_establishment || ''}
            onChange={(e) => updateCore('year_establishment', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* Year of Inclusion */}
        <div className="space-y-2">
          <Label htmlFor="year_inclusion">Year of Inclusion (as STC)</Label>
          <Input
            id="year_inclusion"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={formData.core.year_inclusion || ''}
            onChange={(e) => updateCore('year_inclusion', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Operational Status */}
      <div className="space-y-2">
        <Label htmlFor="operational_status">Operational Status <span className="text-destructive">*</span></Label>
        <Select
          value={formData.core.operational_status}
          onValueChange={(value) => updateCore('operational_status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fully operational">Fully operational</SelectItem>
            <SelectItem value="Partially operational">Partially operational</SelectItem>
            <SelectItem value="Temporarily closed">Temporarily closed</SelectItem>
            <SelectItem value="Non-operational">Non-operational</SelectItem>
          </SelectContent>
        </Select>
        {errors.operational_status && (
          <p className="text-sm text-destructive">{errors.operational_status}</p>
        )}
      </div>

      {/* Non-operational fields */}
      {formData.core.operational_status !== 'Fully operational' && (
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="non_operational_since_date">Non-operational Since</Label>
            <Input
              id="non_operational_since_date"
              type="date"
              value={formData.core.non_operational_since_date || ''}
              onChange={(e) => updateCore('non_operational_since_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Reasons for Non-operation</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {NON_OPERATIONAL_REASONS.map((reason) => (
                <div key={reason} className="flex items-center gap-2">
                  <Checkbox
                    id={`reason_${reason}`}
                    checked={formData.core.non_operational_reasons?.includes(reason) || false}
                    onCheckedChange={(checked) => {
                      const current = formData.core.non_operational_reasons || [];
                      updateCore(
                        'non_operational_reasons',
                        checked
                          ? [...current, reason]
                          : current.filter((r) => r !== reason)
                      );
                    }}
                  />
                  <Label htmlFor={`reason_${reason}`} className="text-sm cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="non_operational_notes">Additional Notes</Label>
            <Textarea
              id="non_operational_notes"
              value={formData.core.non_operational_notes || ''}
              onChange={(e) => updateCore('non_operational_notes', e.target.value)}
              placeholder="Briefly explain the situation..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Address Section */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Address</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line">Address</Label>
            <Textarea
              id="address_line"
              value={formData.core.address_line || ''}
              onChange={(e) => updateCore('address_line', e.target.value)}
              placeholder="Full address..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.core.district || ''}
                onChange={(e) => updateCore('district', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.core.pincode || ''}
                onChange={(e) => updateCore('pincode', e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
