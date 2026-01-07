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
import { UserCheck, Plus, Trash2, CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FormData, CoachRoster } from "../../../utils/formConfig";

interface CoachingStaffCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
  disciplines: string[];
}

const COACH_DESIGNATIONS = [
  'High Performance Coach',
  'Senior Coach',
  'Coach',
  'Assistant Coach',
];

const COACH_EMPLOYMENT_NATURE = [
  'Permanent',
  'Contractual',
  'Deputation',
];

export function CoachingStaffCard({ formData, updateStaff, disciplines }: CoachingStaffCardProps) {
  // Calculate total athletes from disciplines
  const totalAthletes = formData.disciplines.reduce((sum, d) => {
    return sum +
      (d.existing_res_boys || 0) +
      (d.existing_res_girls || 0) +
      (d.existing_nonres_boys || 0) +
      (d.existing_nonres_girls || 0);
  }, 0);

  const coachCount = formData.staff.coach_count_total || 0;
  const ratio = coachCount > 0 ? Math.round(totalAthletes / coachCount) : null;

  // Color coding for ratio
  const ratioColor = ratio === null ? 'text-muted-foreground' :
    ratio <= 15 ? 'text-green-600' :
      ratio <= 25 ? 'text-amber-600' : 'text-red-600';

  const ratioLabel = ratio === null ? 'N/A' :
    ratio <= 15 ? 'Excellent' :
      ratio <= 25 ? 'Adequate' : 'High Load';

  const addCoach = () => {
    const newCoach: CoachRoster = {
      staff_name: '',
      designation: '',
      sport_discipline: '',
      employment_nature: '',
    };
    updateStaff('coach_roster', [...(formData.staff.coach_roster || []), newCoach]);
  };

  const updateCoach = (index: number, field: keyof CoachRoster, value: unknown) => {
    const updated = [...(formData.staff.coach_roster || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateStaff('coach_roster', updated);
  };

  const removeCoach = (index: number) => {
    const updated = (formData.staff.coach_roster || []).filter((_, i) => i !== index);
    updateStaff('coach_roster', updated);
  };

  const rosterMismatch = formData.staff.coach_roster &&
    formData.staff.coach_roster.length !== formData.staff.coach_count_total;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Coaching Staff</h3>
      </div>

      {/* Total Coaches Input */}
      <div className="space-y-2">
        <Label htmlFor="coach_total">
          Total Number of Coaches Posted at STC <span className="text-destructive">*</span>
        </Label>
        <Input
          id="coach_total"
          type="number"
          min={0}
          value={formData.staff.coach_count_total || ''}
          onChange={(e) => updateStaff('coach_count_total', parseInt(e.target.value) || 0)}
          className="max-w-[200px]"
        />
      </div>

      {/* Auto-Calculated Coach to Athlete Ratio */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Auto-Calculated: Coach to Athlete Ratio</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground">Total Athletes</p>
              <p className="text-2xl font-bold text-foreground">{totalAthletes}</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground">Total Coaches</p>
              <p className="text-2xl font-bold text-foreground">{coachCount}</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground">Coach : Athlete Ratio</p>
              <p className={cn("text-2xl font-bold", ratioColor)}>
                {ratio !== null ? `1 : ${ratio}` : 'N/A'}
              </p>
              <p className={cn("text-xs", ratioColor)}>{ratioLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coach Roster */}
      <Card className={rosterMismatch ? 'border-warning/50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Coach Roster</CardTitle>
            <Button size="sm" variant="outline" onClick={addCoach}>
              <Plus className="h-4 w-4 mr-1" /> Add Coach
            </Button>
          </div>
          {rosterMismatch && (
            <p className="text-sm text-warning">
              ⚠️ Roster count ({formData.staff.coach_roster?.length || 0}) doesn't match
              total coaches entered ({formData.staff.coach_count_total})
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.staff.coach_roster || []).map((coach, index) => (
            <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Coach #{index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 w-8 p-0"
                  onClick={() => removeCoach(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="Full name"
                    value={coach.staff_name}
                    onChange={(e) => updateCoach(index, 'staff_name', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Designation</Label>
                  <Select
                    value={coach.designation || ''}
                    onValueChange={(value) => updateCoach(index, 'designation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="High Performance Coach, Senior Coach..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COACH_DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Sport/Discipline</Label>
                  <Select
                    value={coach.sport_discipline || ''}
                    onValueChange={(value) => updateCoach(index, 'sport_discipline', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Nature of Employment</Label>
                  <Select
                    value={coach.employment_nature || ''}
                    onValueChange={(value) => updateCoach(index, 'employment_nature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Permanent, Contractual, Deputation" />
                    </SelectTrigger>
                    <SelectContent>
                      {COACH_EMPLOYMENT_NATURE.map((e) => (
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
                          !coach.posted_since_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {coach.posted_since_date ? (
                          format(new Date(coach.posted_since_date), "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={coach.posted_since_date ? new Date(coach.posted_since_date) : undefined}
                        onSelect={(date) => updateCoach(index, 'posted_since_date', date?.toISOString().split('T')[0])}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Last Training Course Year</Label>
                  <Input
                    type="number"
                    min={1990}
                    max={new Date().getFullYear()}
                    placeholder="e.g., 2023"
                    value={coach.last_training_course_year || ''}
                    onChange={(e) => updateCoach(index, 'last_training_course_year', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Level/Course Completed</Label>
                  <Input
                    placeholder="e.g., Level 1, Level 2, Level 3"
                    value={coach.course_level_completed || ''}
                    onChange={(e) => updateCoach(index, 'course_level_completed', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {(formData.staff.coach_roster || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No coaches added yet. Click "Add Coach" to start adding coaching staff details.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
