import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wifi } from "lucide-react";
import type { HostelData, WaterSupply } from "../../../utils/formConfig";
import { HOSTEL_AMENITIES, WATER_SUPPLY_OPTIONS } from "../../../utils/hostelValidation";

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
  const showWaterIssueNote = hostel.water_supply === 'Tanker';

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

        {/* Water Supply */}
        <div className="space-y-2">
          <Label htmlFor="water_supply">Water Supply</Label>
          <Select
            value={hostel.water_supply || ''}
            onValueChange={(value) => updateHostel('water_supply', value as WaterSupply)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select water supply type" />
            </SelectTrigger>
            <SelectContent>
              {WATER_SUPPLY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Water Issue Note */}
        {showWaterIssueNote && (
          <div className="space-y-2">
            <Label htmlFor="water_issue">Describe water supply issues:</Label>
            <Textarea
              id="water_issue"
              value={hostel.water_supply_issue_note || ''}
              onChange={(e) => updateHostel('water_supply_issue_note', e.target.value)}
              placeholder="E.g., frequency of tanker supply, storage capacity..."
              rows={2}
            />
          </div>
        )}

        {/* Power Backup & Fire Safety */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Switch
              id="power_backup"
              checked={hostel.power_backup_available || false}
              onCheckedChange={(checked) => updateHostel('power_backup_available', checked)}
            />
            <Label htmlFor="power_backup" className="cursor-pointer">Power Backup Available</Label>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Switch
              id="fire_safety"
              checked={hostel.fire_safety_equipment || false}
              onCheckedChange={(checked) => updateHostel('fire_safety_equipment', checked)}
            />
            <Label htmlFor="fire_safety" className="cursor-pointer">Fire Safety Equipment</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
