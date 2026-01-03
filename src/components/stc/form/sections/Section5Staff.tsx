import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, Plus, Trash2 } from "lucide-react";
import type { FormData, PrefillData, StaffRoster } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const EMPLOYMENT_NATURE = ["Regular/Permanent", "Contractual", "Outsourced", "Deputation", "Other"];
const DIVISION_RESPONSIBILITIES = [
  "Accounts",
  "Store",
  "Procurement",
  "Office",
  "Hostel",
  "Mess",
  "Logistics",
  "Security supervision",
  "Housekeeping supervision",
  "IT-AMS",
  "Other",
];

export function Section5Staff({ formData, setFormData, disciplines }: SectionProps) {
  const updateStaff = <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => {
    setFormData({
      ...formData,
      staff: { ...formData.staff, [key]: value },
    });
  };

  const addCoach = () => {
    const newCoach: StaffRoster = {
      staff_name: '',
      staff_designation: '',
      employment_nature: '',
    };
    updateStaff('coach_roster', [...(formData.staff.coach_roster || []), newCoach]);
  };

  const updateCoach = (index: number, field: keyof StaffRoster, value: unknown) => {
    const updated = [...(formData.staff.coach_roster || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateStaff('coach_roster', updated);
  };

  const removeCoach = (index: number) => {
    const updated = (formData.staff.coach_roster || []).filter((_, i) => i !== index);
    updateStaff('coach_roster', updated);
  };

  const addAdmin = () => {
    const newAdmin: StaffRoster = {
      staff_name: '',
      staff_designation: '',
      employment_nature: '',
      dedicated_to_stc: true,
    };
    updateStaff('admin_roster', [...(formData.staff.admin_roster || []), newAdmin]);
  };

  const updateAdmin = (index: number, field: keyof StaffRoster, value: unknown) => {
    const updated = [...(formData.staff.admin_roster || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateStaff('admin_roster', updated);
  };

  const removeAdmin = (index: number) => {
    const updated = (formData.staff.admin_roster || []).filter((_, i) => i !== index);
    updateStaff('admin_roster', updated);
  };

  const coachRosterMismatch = formData.staff.coach_roster && 
    formData.staff.coach_roster.length !== formData.staff.coach_count_total;
  const adminRosterMismatch = formData.staff.admin_roster && 
    formData.staff.admin_roster.length !== formData.staff.admin_staff_count_total;

  return (
    <div className="space-y-8">
      {/* Coach Summary */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Coaching Staff</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coach_total">Total Coaches <span className="text-destructive">*</span></Label>
            <Input
              id="coach_total"
              type="number"
              min={0}
              value={formData.staff.coach_count_total || ''}
              onChange={(e) => updateStaff('coach_count_total', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certified_coaches">Certified Coaches</Label>
            <Input
              id="certified_coaches"
              type="number"
              min={0}
              value={formData.staff.certified_coaches_count || ''}
              onChange={(e) => updateStaff('certified_coaches_count', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreign_coaches">Foreign Coaches</Label>
            <Input
              id="foreign_coaches"
              type="number"
              min={0}
              value={formData.staff.foreign_coaches_count || ''}
              onChange={(e) => updateStaff('foreign_coaches_count', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Coaching Quality (1-5)</Label>
          <Select
            value={String(formData.staff.coaching_quality_rating || '')}
            onValueChange={(value) => updateStaff('coaching_quality_rating', parseInt(value))}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Rate quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Poor</SelectItem>
              <SelectItem value="2">2 - Below Average</SelectItem>
              <SelectItem value="3">3 - Average</SelectItem>
              <SelectItem value="4">4 - Good</SelectItem>
              <SelectItem value="5">5 - Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="staff_training"
            checked={formData.staff.staff_training_programs_last_12m || false}
            onCheckedChange={(checked) => updateStaff('staff_training_programs_last_12m', checked)}
          />
          <Label htmlFor="staff_training" className="cursor-pointer">
            Training programs conducted (last 12 months)
          </Label>
        </div>

        {formData.staff.staff_training_programs_last_12m && (
          <div className="space-y-2">
            <Label htmlFor="training_notes">Training Details</Label>
            <Textarea
              id="training_notes"
              value={formData.staff.staff_training_notes || ''}
              onChange={(e) => updateStaff('staff_training_notes', e.target.value)}
              placeholder="Describe the training programs..."
              rows={2}
            />
          </div>
        )}

        {/* Coach Roster */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Coach Roster (Recommended)</CardTitle>
              <Button size="sm" variant="outline" onClick={addCoach}>
                <Plus className="h-4 w-4 mr-1" /> Add Coach
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(formData.staff.coach_roster || []).map((coach, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-secondary/30 rounded-lg">
                <Input
                  placeholder="Name"
                  value={coach.staff_name}
                  onChange={(e) => updateCoach(index, 'staff_name', e.target.value)}
                />
                <Input
                  placeholder="Designation"
                  value={coach.staff_designation}
                  onChange={(e) => updateCoach(index, 'staff_designation', e.target.value)}
                />
                <Select
                  value={coach.discipline_code || ''}
                  onValueChange={(value) => updateCoach(index, 'discipline_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={coach.employment_nature}
                  onValueChange={(value) => updateCoach(index, 'employment_nature', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Employment" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_NATURE.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeCoach(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(formData.staff.coach_roster || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No coaches added yet. Click "Add Coach" to start.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Staff */}
      <div className="border-t border-border pt-6 space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Administrative Staff</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin_total">Total Admin Staff <span className="text-destructive">*</span></Label>
            <Input
              id="admin_total"
              type="number"
              min={0}
              value={formData.staff.admin_staff_count_total || ''}
              onChange={(e) => updateStaff('admin_staff_count_total', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance_staff">Maintenance Staff</Label>
            <Input
              id="maintenance_staff"
              type="number"
              min={0}
              value={formData.staff.maintenance_staff_count || ''}
              onChange={(e) => updateStaff('maintenance_staff_count', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="security_staff">Security Staff</Label>
            <Input
              id="security_staff"
              type="number"
              min={0}
              value={formData.staff.security_staff_count || ''}
              onChange={(e) => updateStaff('security_staff_count', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Admin Roster */}
        <Card className={adminRosterMismatch ? 'border-warning/50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Admin Staff Roster 
                {formData.staff.admin_staff_count_total > 0 && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addAdmin}>
                <Plus className="h-4 w-4 mr-1" /> Add Staff
              </Button>
            </div>
            {adminRosterMismatch && (
              <p className="text-sm text-warning">
                Roster count ({formData.staff.admin_roster?.length || 0}) doesn't match 
                total ({formData.staff.admin_staff_count_total})
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {(formData.staff.admin_roster || []).map((admin, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-secondary/30 rounded-lg">
                <Input
                  placeholder="Name"
                  value={admin.staff_name}
                  onChange={(e) => updateAdmin(index, 'staff_name', e.target.value)}
                />
                <Input
                  placeholder="Designation"
                  value={admin.staff_designation}
                  onChange={(e) => updateAdmin(index, 'staff_designation', e.target.value)}
                />
                <Select
                  value={admin.employment_nature}
                  onValueChange={(value) => updateAdmin(index, 'employment_nature', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Employment" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_NATURE.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={admin.dedicated_to_stc ?? true}
                    onCheckedChange={(checked) => updateAdmin(index, 'dedicated_to_stc', checked)}
                  />
                  <Label className="text-xs">Dedicated</Label>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeAdmin(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(formData.staff.admin_roster || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No admin staff added yet. Click "Add Staff" to start.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
