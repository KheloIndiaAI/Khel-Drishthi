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
import { TreeDeciduous, Plus, Trash2 } from "lucide-react";
import type { FormData, GroundsmanRoster } from "../../../utils/formConfig";

interface GroundsmenCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
}

const GROUNDSMEN_EMPLOYMENT_NATURE = [
  'Permanent',
  'Contractual',
  'Outsourced',
  'Casual',
];

export function GroundsmenCard({ formData, updateStaff }: GroundsmenCardProps) {
  // Get FOPs from disciplines for assignment dropdown
  const availableFOPs = formData.disciplines.map(d => d.discipline_name).filter(Boolean);

  const addGroundsman = () => {
    const newGroundsman: GroundsmanRoster = {
      staff_name: '',
      employment_nature: '',
    };
    updateStaff('groundsmen_roster', [...(formData.staff.groundsmen_roster || []), newGroundsman]);
  };

  const updateGroundsman = (index: number, field: keyof GroundsmanRoster, value: unknown) => {
    const updated = [...(formData.staff.groundsmen_roster || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateStaff('groundsmen_roster', updated);
  };

  const removeGroundsman = (index: number) => {
    const updated = (formData.staff.groundsmen_roster || []).filter((_, i) => i !== index);
    updateStaff('groundsmen_roster', updated);
  };

  const rosterMismatch = formData.staff.groundsmen_roster &&
    formData.staff.groundsmen_count_total !== undefined &&
    formData.staff.groundsmen_roster.length !== formData.staff.groundsmen_count_total;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TreeDeciduous className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Groundsmen</h3>
      </div>

      {/* Total Groundsmen Input */}
      <div className="space-y-2">
        <Label htmlFor="groundsmen_total">Total Number of Groundsmen</Label>
        <Input
          id="groundsmen_total"
          type="number"
          min={0}
          value={formData.staff.groundsmen_count_total ?? ''}
          onChange={(e) => updateStaff('groundsmen_count_total', e.target.value ? parseInt(e.target.value) : undefined)}
          className="max-w-[200px]"
        />
      </div>

      {/* Groundsmen Roster */}
      <Card className={rosterMismatch ? 'border-warning/50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Groundsmen Roster</CardTitle>
            <Button size="sm" variant="outline" onClick={addGroundsman}>
              <Plus className="h-4 w-4 mr-1" /> Add Groundsman
            </Button>
          </div>
          {rosterMismatch && (
            <p className="text-sm text-warning">
              ⚠️ Roster count ({formData.staff.groundsmen_roster?.length || 0}) doesn't match
              total entered ({formData.staff.groundsmen_count_total})
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.staff.groundsmen_roster || []).map((groundsman, index) => (
            <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Groundsman #{index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 w-8 p-0"
                  onClick={() => removeGroundsman(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="Full name"
                    value={groundsman.staff_name}
                    onChange={(e) => updateGroundsman(index, 'staff_name', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Nature of Employment</Label>
                  <Select
                    value={groundsman.employment_nature || ''}
                    onValueChange={(value) => updateGroundsman(index, 'employment_nature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUNDSMEN_EMPLOYMENT_NATURE.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Assigned to FoP</Label>
                  <Select
                    value={groundsman.assigned_fop || ''}
                    onValueChange={(value) => updateGroundsman(index, 'assigned_fop', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select FoP" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFOPs.map((fop) => (
                        <SelectItem key={fop} value={fop}>{fop}</SelectItem>
                      ))}
                      <SelectItem value="General">General / Multiple FOPs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {(formData.staff.groundsmen_roster || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No groundsmen added yet. Click "Add Groundsman" to start.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
