import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ClipboardList, Plus, Trash2, CalendarIcon, Lock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FormData, AdminRoster } from "../../../utils/formConfig";

interface AdminStaffCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
}

const ADMIN_DESIGNATIONS = [
  'Deputy Director',
  'Assistant Director',
  'Section Officer',
  'LDC (Lower Division Clerk)',
  'UDC (Upper Division Clerk)',
  'Assistant',
  'Superintendent',
  'Accounts Officer',
  'Store Keeper',
  'Other',
];

const ADMIN_EMPLOYMENT_NATURE = [
  'Permanent',
  'Contractual',
  'Outsourced',
  'Casual',
];

export function AdminStaffCard({ formData, updateStaff }: AdminStaffCardProps) {
  const addAdmin = () => {
    const newAdmin: AdminRoster = {
      staff_name: '',
      designation: '',
      employment_nature: '',
    };
    updateStaff('admin_roster', [...(formData.staff.admin_roster || []), newAdmin]);
  };

  const updateAdmin = (index: number, field: keyof AdminRoster, value: unknown) => {
    const updated = [...(formData.staff.admin_roster || [])];
    updated[index] = { ...updated[index], [field]: value };
    // Clear designation_other if designation is not "Other"
    if (field === 'designation' && value !== 'Other') {
      updated[index].designation_other = undefined;
    }
    updateStaff('admin_roster', updated);
  };

  const removeAdmin = (index: number) => {
    const updated = (formData.staff.admin_roster || []).filter((_, i) => i !== index);
    updateStaff('admin_roster', updated);
  };

  const rosterMismatch = formData.staff.admin_roster &&
    formData.staff.admin_roster.length !== formData.staff.admin_staff_count_total;

  // CIC from Section 1 (Core)
  const cicName = formData.core.cic_name;
  const cicDesignation = formData.core.cic_designation;
  const cicPostedSince = formData.core.cic_posted_since;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Administrative Staff</h3>
      </div>

      {/* Centre In Charge (Read-only from Section 1) */}
      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Centre In Charge (from Centre Identity)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cicName ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{cicName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="text-sm font-medium">{cicDesignation || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Posted Since</p>
                <p className="text-sm font-medium">
                  {cicPostedSince ? format(new Date(cicPostedSince), "PPP") : 'Not specified'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              CIC details not entered. Please fill in the Centre Identity section.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Admin Staff Input */}
      <div className="space-y-2">
        <Label htmlFor="admin_total">
          Total Number of Admin Staff <span className="text-destructive">*</span>
        </Label>
        <Input
          id="admin_total"
          type="number"
          min={0}
          value={formData.staff.admin_staff_count_total || ''}
          onChange={(e) => updateStaff('admin_staff_count_total', parseInt(e.target.value) || 0)}
          className="max-w-[200px]"
        />
      </div>

      {/* Admin Staff Roster */}
      <Card className={rosterMismatch ? 'border-warning/50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Admin Staff Roster</CardTitle>
            <Button size="sm" variant="outline" onClick={addAdmin}>
              <Plus className="h-4 w-4 mr-1" /> Add Admin Staff
            </Button>
          </div>
          {rosterMismatch && (
            <p className="text-sm text-warning">
              ⚠️ Roster count ({formData.staff.admin_roster?.length || 0}) doesn't match
              total entered ({formData.staff.admin_staff_count_total})
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.staff.admin_roster || []).map((admin, index) => (
            <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Admin #{index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 w-8 p-0"
                  onClick={() => removeAdmin(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="Full name"
                    value={admin.staff_name}
                    onChange={(e) => updateAdmin(index, 'staff_name', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Designation</Label>
                  <Select
                    value={admin.designation || ''}
                    onValueChange={(value) => updateAdmin(index, 'designation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional "Other" designation input */}
                {admin.designation === 'Other' && (
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Specify Designation <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Enter designation"
                      value={admin.designation_other || ''}
                      onChange={(e) => updateAdmin(index, 'designation_other', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Nature of Employment</Label>
                  <Select
                    value={admin.employment_nature || ''}
                    onValueChange={(value) => updateAdmin(index, 'employment_nature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Permanent, Contractual, Outsourced" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_EMPLOYMENT_NATURE.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Posted at STC Since</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !admin.posted_since_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {admin.posted_since_date ? (
                          format(new Date(admin.posted_since_date), "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={admin.posted_since_date ? new Date(admin.posted_since_date) : undefined}
                        onSelect={(date) => updateAdmin(index, 'posted_since_date', date?.toISOString().split('T')[0])}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        fromYear={1980}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}

          {(formData.staff.admin_roster || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No admin staff added yet. Click "Add Admin Staff" to start.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
