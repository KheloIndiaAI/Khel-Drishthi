import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck } from "lucide-react";
import type { HostelData, OverallQuality } from "../../../utils/formConfig";
import { QUALITY_OPTIONS, IMPROVEMENT_NEEDS } from "../../../utils/hostelValidation";

interface Props {
  hostel: HostelData;
  updateHostel: <K extends keyof HostelData>(key: K, value: HostelData[K]) => void;
}

export function HostelQualityCard({ hostel, updateHostel }: Props) {
  const toggleImprovement = (improvement: string, checked: boolean) => {
    const current = hostel.hostel_improvement_needs || [];
    updateHostel(
      'hostel_improvement_needs',
      checked ? [...current, improvement] : current.filter((i) => i !== improvement)
    );
  };

  const showOtherNote = hostel.hostel_improvement_needs?.includes('Other');

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Overall Quality & Improvements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Quality */}
        <div className="space-y-2">
          <Label htmlFor="overall_quality">Overall Hostel Quality <span className="text-destructive">*</span></Label>
          <Select
            value={hostel.overall_hostel_quality || ''}
            onValueChange={(value) => updateHostel('overall_hostel_quality', value as OverallQuality)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quality rating" />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Improvement Needs */}
        <div className="space-y-3">
          <Label>Improvement Needs (select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {IMPROVEMENT_NEEDS.map((need) => (
              <div key={need} className="flex items-center gap-2">
                <Checkbox
                  id={`need_${need}`}
                  checked={hostel.hostel_improvement_needs?.includes(need) || false}
                  onCheckedChange={(checked) => toggleImprovement(need, checked as boolean)}
                />
                <Label htmlFor={`need_${need}`} className="text-sm cursor-pointer">
                  {need}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Other Improvement Note */}
        {showOtherNote && (
          <div className="space-y-2">
            <Label htmlFor="improvement_other">Specify other improvements needed: <span className="text-destructive">*</span></Label>
            <Textarea
              id="improvement_other"
              value={hostel.improvement_other_note || ''}
              onChange={(e) => updateHostel('improvement_other_note', e.target.value)}
              placeholder="Describe other improvements needed..."
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
