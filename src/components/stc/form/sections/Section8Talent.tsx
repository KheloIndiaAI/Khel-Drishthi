import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, AlertTriangle } from "lucide-react";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const SELECTION_PROCESS = [
  "Trials",
  "Nominations",
  "Both",
  "Other",
];

const PUBLICITY_METHODS = [
  "School outreach",
  "District sports office",
  "Social media",
  "Newspapers",
  "Federations",
  "Clubs",
  "Other",
];

const COMPETITION_LEVELS = [
  "District",
  "State",
  "National",
  "International",
];

export function Section8Talent({ formData, setFormData }: SectionProps) {
  const updateTalent = <K extends keyof FormData['talent']>(key: K, value: FormData['talent'][K]) => {
    setFormData({
      ...formData,
      talent: { ...formData.talent, [key]: value },
    });
  };

  // Calculate total existing athletes
  const totalExisting = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0) +
    (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0), 0);

  // Check for origin mismatch
  const originTotal = (formData.talent.local_athletes_count || 0) + 
                      (formData.talent.other_state_athletes_count || 0);
  const hasMismatch = totalExisting > 0 && originTotal > 0 && 
    Math.abs(totalExisting - originTotal) / totalExisting > 0.1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Talent Identification & Competitions</h3>
      </div>

      {/* Athlete Origin (AS ON) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-medium text-foreground">Athlete Origin (As on date)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_athletes">Local Athletes (Same State)</Label>
              <Input
                id="local_athletes"
                type="number"
                min={0}
                value={formData.talent.local_athletes_count || ''}
                onChange={(e) => updateTalent('local_athletes_count', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_state">Other State Athletes</Label>
              <Input
                id="other_state"
                type="number"
                min={0}
                value={formData.talent.other_state_athletes_count || ''}
                onChange={(e) => updateTalent('other_state_athletes_count', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="flex items-end">
              <div className="text-center p-3 bg-secondary/30 rounded-lg w-full">
                <p className="text-xs text-muted-foreground">Total (should match Section 2)</p>
                <p className="text-xl font-bold text-foreground">{originTotal} / {totalExisting}</p>
              </div>
            </div>
          </div>

          {hasMismatch && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-warning">
                  Origin counts don't match total existing athletes (&gt;10% difference)
                </p>
                <Textarea
                  placeholder="Please explain the discrepancy..."
                  value={formData.talent.origin_mismatch_note || ''}
                  onChange={(e) => updateTalent('origin_mismatch_note', e.target.value)}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Process (Last 12 Months) */}
      <div className="border-t border-border pt-6 space-y-4">
        <h4 className="font-medium text-foreground">Selection Process (Last 12 Months)</h4>

        <div className="space-y-2">
          <Label>Athlete Selection Process</Label>
          <Select
            value={formData.talent.athlete_selection_process || ''}
            onValueChange={(value) => updateTalent('athlete_selection_process', value)}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select process" />
            </SelectTrigger>
            <SelectContent>
              {SELECTION_PROCESS.map((process) => (
                <SelectItem key={process} value={process}>{process}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Trials Publicity Methods</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PUBLICITY_METHODS.map((method) => (
              <div key={method} className="flex items-center gap-2">
                <Checkbox
                  id={`method_${method}`}
                  checked={formData.talent.trials_publicity_methods?.includes(method) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.talent.trials_publicity_methods || [];
                    updateTalent(
                      'trials_publicity_methods',
                      checked
                        ? [...current, method]
                        : current.filter((m) => m !== method)
                    );
                  }}
                />
                <Label htmlFor={`method_${method}`} className="text-sm cursor-pointer">
                  {method}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trial_events">Trial Events Conducted (Last 12 Months)</Label>
          <Input
            id="trial_events"
            type="number"
            min={0}
            value={formData.talent.trial_events_last_12m || ''}
            onChange={(e) => updateTalent('trial_events_last_12m', parseInt(e.target.value) || undefined)}
            className="w-full md:w-48"
          />
        </div>
      </div>

      {/* Competitions (Last 12 Months) */}
      <div className="border-t border-border pt-6 space-y-4">
        <h4 className="font-medium text-foreground">Competitions (Last 12 Months)</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="athletes_participated">Athletes Participated in Competitions</Label>
            <Input
              id="athletes_participated"
              type="number"
              min={0}
              value={formData.talent.athletes_participated_count || ''}
              onChange={(e) => updateTalent('athletes_participated_count', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="flex items-end">
            {totalExisting > 0 && formData.talent.athletes_participated_count && (
              <div className="text-center p-3 bg-secondary/30 rounded-lg w-full">
                <p className="text-xs text-muted-foreground">Participation Rate</p>
                <p className="text-xl font-bold text-primary">
                  {Math.round((formData.talent.athletes_participated_count / totalExisting) * 100)}%
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Competition Levels</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMPETITION_LEVELS.map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`level_${level}`}
                  checked={formData.talent.competition_levels?.includes(level) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.talent.competition_levels || [];
                    updateTalent(
                      'competition_levels',
                      checked
                        ? [...current, level]
                        : current.filter((l) => l !== level)
                    );
                  }}
                />
                <Label htmlFor={`level_${level}`} className="text-sm cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
