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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Database, CheckCircle2, CalendarIcon, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const ABEYANCE_REASONS = [
  "Infrastructure Issues",
  "Coach Vacancy",
  "Hostel Issues",
  "Safety Concerns",
  "Funding Constraints",
  "Administrative Issues",
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
    return prefillData && (prefillData as unknown as Record<string, unknown>)[field];
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

      {/* Year of Inclusion */}
      <div className="space-y-2">
        <Label htmlFor="year_inclusion">Year of Inclusion in the Scheme</Label>
        <Input
          id="year_inclusion"
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          value={formData.core.year_inclusion || ''}
          onChange={(e) => updateCore('year_inclusion', e.target.value ? parseInt(e.target.value) : undefined)}
          className="max-w-[200px]"
        />
      </div>

      {/* Operational Status */}
      <div className="space-y-2">
        <Label htmlFor="operational_status">Operational Status <span className="text-destructive">*</span></Label>
        <Select
          value={formData.core.operational_status}
          onValueChange={(value) => updateCore('operational_status', value)}
        >
          <SelectTrigger className="max-w-[300px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Operational">Operational</SelectItem>
            <SelectItem value="Kept in Abeyance">Kept in Abeyance</SelectItem>
          </SelectContent>
        </Select>
        {errors.operational_status && (
          <p className="text-sm text-destructive">{errors.operational_status}</p>
        )}
      </div>

      {/* Abeyance fields - shown only when "Kept in Abeyance" is selected */}
      {formData.core.operational_status === 'Kept in Abeyance' && (
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="abeyance_since_date">Kept in Abeyance Since</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full max-w-[280px] justify-start text-left font-normal",
                    !formData.core.abeyance_since_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.core.abeyance_since_date ? (
                    format(new Date(formData.core.abeyance_since_date), "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.core.abeyance_since_date ? new Date(formData.core.abeyance_since_date) : undefined}
                  onSelect={(date) => updateCore('abeyance_since_date', date?.toISOString().split('T')[0])}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Reasons for Abeyance</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ABEYANCE_REASONS.map((reason) => (
                <div key={reason} className="flex items-center gap-2">
                  <Checkbox
                    id={`reason_${reason}`}
                    checked={formData.core.abeyance_reasons?.includes(reason) || false}
                    onCheckedChange={(checked) => {
                      const current = formData.core.abeyance_reasons || [];
                      updateCore(
                        'abeyance_reasons',
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
            <Label htmlFor="abeyance_notes">Additional Notes</Label>
            <Textarea
              id="abeyance_notes"
              value={formData.core.abeyance_notes || ''}
              onChange={(e) => updateCore('abeyance_notes', e.target.value)}
              placeholder="Briefly explain the situation..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Centre In Charge (CIC) Section */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Centre In Charge (CIC)</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cic_name">Name of the Centre In Charge (CIC)</Label>
            <Input
              id="cic_name"
              value={formData.core.cic_name || ''}
              onChange={(e) => updateCore('cic_name', e.target.value)}
              placeholder="Full name of the CIC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cic_designation">Designation of Centre In Charge</Label>
            <Input
              id="cic_designation"
              value={formData.core.cic_designation || ''}
              onChange={(e) => updateCore('cic_designation', e.target.value)}
              placeholder="e.g., Coach / Senior Coach / Assistant Director / Deputy Director"
            />
          </div>

          {/* NEW: CIC Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="cic_phone" className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Phone Number of Centre In Charge
            </Label>
            <Input
              id="cic_phone"
              type="tel"
              value={formData.core.cic_phone || ''}
              onChange={(e) => updateCore('cic_phone', e.target.value)}
              placeholder="e.g., 9876543210"
              className="max-w-[250px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cic_posted_since">Posted as CIC Since</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full max-w-[280px] justify-start text-left font-normal",
                    !formData.core.cic_posted_since && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.core.cic_posted_since ? (
                    format(new Date(formData.core.cic_posted_since), "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.core.cic_posted_since ? new Date(formData.core.cic_posted_since) : undefined}
                  onSelect={(date) => updateCore('cic_posted_since', date?.toISOString().split('T')[0])}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Geo Coordinates Section */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geo Coordinates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              min={-90}
              max={90}
              value={formData.core.latitude ?? ''}
              onChange={(e) => updateCore('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 28.6139"
            />
            <p className="text-xs text-muted-foreground">Range: -90 to 90</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              min={-180}
              max={180}
              value={formData.core.longitude ?? ''}
              onChange={(e) => updateCore('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 77.2090"
            />
            <p className="text-xs text-muted-foreground">Range: -180 to 180</p>
          </div>
        </div>
      </div>

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
