import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wifi, ShieldCheck } from "lucide-react";
import type { HostelData } from "../../../utils/formConfig";
import { HOSTEL_AMENITIES } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function HostelAmenitiesCard({ hostel, updateHostel }: Props) {
  const toggleAmenity = (amenity: string, checked: boolean) => {
    const current = hostel.hostel_amenities || [];
    updateHostel(
      'hostel_amenities',
      checked ? [...current, amenity] : current.filter((a) => a !== amenity)
    );
  };

  const showOtherAmenityNote = hostel.hostel_amenities?.includes('Other');

  // Convert legacy boolean to string format
  const fireSafetyValue = typeof hostel.fire_safety_equipment === 'boolean' 
    ? (hostel.fire_safety_equipment ? 'Yes' : 'No')
    : hostel.fire_safety_equipment || '';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wifi className="h-5 w-5 text-primary" />
          Hostel Amenities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amenities Checklist */}
        <div className="space-y-3">
          <Label>Available Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HOSTEL_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  id={`amenity_${amenity}`}
                  checked={hostel.hostel_amenities?.includes(amenity) || false}
                  onCheckedChange={(checked) => toggleAmenity(amenity, checked as boolean)}
                />
                <Label htmlFor={`amenity_${amenity}`} className="text-sm cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Other Amenity Note */}
        {showOtherAmenityNote && (
          <div className="space-y-2">
            <Label htmlFor="amenity_other">Specify other amenities: <span className="text-destructive">*</span></Label>
            <Textarea
              id="amenity_other"
              value={hostel.hostel_amenities_other_note || ''}
              onChange={(e) => updateHostel('hostel_amenities_other_note', e.target.value)}
              placeholder="List other amenities available..."
              rows={2}
            />
          </div>
        )}

        {/* Fire Safety Equipment - Radio Button */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-destructive" />
            <Label className="text-sm font-medium">Fire Safety Equipment Available?</Label>
          </div>
          <RadioGroup
            value={fireSafetyValue}
            onValueChange={(value) => updateHostel('fire_safety_equipment', value as 'Yes' | 'No')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="fire_safety_yes" />
              <Label htmlFor="fire_safety_yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="fire_safety_no" />
              <Label htmlFor="fire_safety_no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Fire extinguishers, smoke detectors, fire alarms, etc.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
