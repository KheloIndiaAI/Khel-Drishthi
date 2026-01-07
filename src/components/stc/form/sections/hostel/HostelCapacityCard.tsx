import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, AlertCircle } from "lucide-react";
import type { HostelData, GenderCapacity, RoomTypeBreakup } from "../../../utils/formConfig";
import { calculateRoomBeds, calculateTotalRooms, SEGREGATION_TYPES } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function HostelCapacityCard({ hostel, updateHostel }: Props) {
  const updateGenderCapacity = (key: keyof GenderCapacity, value: number | undefined) => {
    updateHostel('gender_capacity', {
      ...hostel.gender_capacity,
      [key]: value,
    });
  };

  const updateRoomBreakup = (key: keyof RoomTypeBreakup, value: number | undefined) => {
    updateHostel('room_type_breakup', {
      ...hostel.room_type_breakup,
      [key]: value,
    });
  };

  const showRoomDetails = hostel.hostel_type === 'Rooms' || hostel.hostel_type === 'Mixed';
  const showDormDetails = hostel.hostel_type === 'Dormitory' || hostel.hostel_type === 'Mixed';

  // Validation helpers
  const genderTotal = (hostel.gender_capacity?.male_beds || 0) + (hostel.gender_capacity?.female_beds || 0);
  const genderMismatch = hostel.hostel_bed_capacity && genderTotal > 0 && genderTotal !== hostel.hostel_bed_capacity;
  
  const totalRooms = calculateTotalRooms(hostel.room_type_breakup);
  const roomCountMismatch = hostel.number_of_rooms && totalRooms > 0 && totalRooms !== hostel.number_of_rooms;

  const roomBeds = calculateRoomBeds(hostel.room_type_breakup);
  const dormBeds = hostel.dormitory_total_beds || 0;
  const totalCalculatedBeds = roomBeds + dormBeds;
  const capacityMismatch = hostel.hostel_bed_capacity && totalCalculatedBeds > hostel.hostel_bed_capacity;

  const occupancyExceeds = hostel.hostel_bed_capacity && hostel.current_hostel_occupancy && 
    hostel.current_hostel_occupancy > hostel.hostel_bed_capacity;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Capacity & Room Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Capacity and Occupancy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hostel_capacity">Total Bed Capacity <span className="text-destructive">*</span></Label>
            <Input
              id="hostel_capacity"
              type="number"
              min={0}
              value={hostel.hostel_bed_capacity || ''}
              onChange={(e) => updateHostel('hostel_bed_capacity', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostel_occupancy">Current Occupancy <span className="text-destructive">*</span></Label>
            <Input
              id="hostel_occupancy"
              type="number"
              min={0}
              value={hostel.current_hostel_occupancy || ''}
              onChange={(e) => updateHostel('current_hostel_occupancy', parseInt(e.target.value) || undefined)}
              className={occupancyExceeds ? 'border-destructive' : ''}
            />
            {occupancyExceeds && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Occupancy cannot exceed bed capacity
              </p>
            )}
          </div>
        </div>

        {/* Gender-wise Capacity */}
        <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
          <Label className="font-medium">Gender-wise Capacity</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="male_beds">Male Beds</Label>
              <Input
                id="male_beds"
                type="number"
                min={0}
                value={hostel.gender_capacity?.male_beds || ''}
                onChange={(e) => updateGenderCapacity('male_beds', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="female_beds">Female Beds</Label>
              <Input
                id="female_beds"
                type="number"
                min={0}
                value={hostel.gender_capacity?.female_beds || ''}
                onChange={(e) => updateGenderCapacity('female_beds', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
          {genderMismatch && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Gender-wise beds ({genderTotal}) must equal total capacity ({hostel.hostel_bed_capacity})
            </p>
          )}
        </div>

        {/* Room Details */}
        {showRoomDetails && (
          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="font-medium">Room Details</Label>
            <div className="space-y-2">
              <Label htmlFor="number_of_rooms">Number of Rooms <span className="text-destructive">*</span></Label>
              <Input
                id="number_of_rooms"
                type="number"
                min={0}
                value={hostel.number_of_rooms || ''}
                onChange={(e) => updateHostel('number_of_rooms', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-3">
              <Label>Room Type Breakup</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="single_rooms" className="text-xs">Single Bed Rooms</Label>
                  <Input
                    id="single_rooms"
                    type="number"
                    min={0}
                    value={hostel.room_type_breakup?.single_bed_count || ''}
                    onChange={(e) => updateRoomBreakup('single_bed_count', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="two_bed_rooms" className="text-xs">2-Bed Rooms</Label>
                  <Input
                    id="two_bed_rooms"
                    type="number"
                    min={0}
                    value={hostel.room_type_breakup?.two_bed_count || ''}
                    onChange={(e) => updateRoomBreakup('two_bed_count', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="three_bed_rooms" className="text-xs">3-Bed Rooms</Label>
                  <Input
                    id="three_bed_rooms"
                    type="number"
                    min={0}
                    value={hostel.room_type_breakup?.three_bed_count || ''}
                    onChange={(e) => updateRoomBreakup('three_bed_count', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="four_bed_rooms" className="text-xs">4-Bed Rooms</Label>
                  <Input
                    id="four_bed_rooms"
                    type="number"
                    min={0}
                    value={hostel.room_type_breakup?.four_bed_count || ''}
                    onChange={(e) => updateRoomBreakup('four_bed_count', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
              {roomCountMismatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Room breakup ({totalRooms}) must equal total rooms ({hostel.number_of_rooms})
                </p>
              )}
              {hostel.room_type_breakup && (
                <p className="text-xs text-muted-foreground">
                  Total beds from rooms: {roomBeds}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dormitory Details */}
        {showDormDetails && (
          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="font-medium">Dormitory Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_dormitories">Number of Dormitories <span className="text-destructive">*</span></Label>
                <Input
                  id="number_of_dormitories"
                  type="number"
                  min={0}
                  value={hostel.number_of_dormitories || ''}
                  onChange={(e) => updateHostel('number_of_dormitories', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dormitory_beds">Total Dormitory Beds</Label>
                <Input
                  id="dormitory_beds"
                  type="number"
                  min={0}
                  value={hostel.dormitory_total_beds || ''}
                  onChange={(e) => updateHostel('dormitory_total_beds', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Capacity validation message */}
        {capacityMismatch && (
          <p className="text-xs text-destructive flex items-center gap-1 p-2 bg-destructive/10 rounded">
            <AlertCircle className="h-3 w-3" />
            Calculated beds ({totalCalculatedBeds}) exceed total capacity ({hostel.hostel_bed_capacity})
          </p>
        )}

        {/* Gender Segregation */}
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="gender_segregation"
              checked={hostel.hostel_gender_segregation_present || false}
              onCheckedChange={(checked) => updateHostel('hostel_gender_segregation_present', checked)}
            />
            <Label htmlFor="gender_segregation" className="cursor-pointer">
              Gender Segregation Present <span className="text-destructive">*</span>
            </Label>
          </div>

          {hostel.hostel_gender_segregation_present && (
            <div className="space-y-2">
              <Label>Segregation Type</Label>
              <Select
                value={hostel.hostel_gender_segregation_type || ''}
                onValueChange={(value) => updateHostel('hostel_gender_segregation_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SEGREGATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hostel.hostel_gender_segregation_type === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="segregation_other">Explain other arrangement:</Label>
              <Textarea
                id="segregation_other"
                value={hostel.hostel_gender_segregation_note || ''}
                onChange={(e) => updateHostel('hostel_gender_segregation_note', e.target.value)}
                placeholder="Describe the gender segregation arrangement..."
                rows={2}
              />
            </div>
          )}

          {hostel.hostel_gender_segregation_present === false && (
            <div className="space-y-2">
              <Label htmlFor="segregation_note">Why is gender segregation not present?</Label>
              <Textarea
                id="segregation_note"
                value={hostel.hostel_gender_segregation_note || ''}
                onChange={(e) => updateHostel('hostel_gender_segregation_note', e.target.value)}
                placeholder="Explain..."
                rows={2}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
