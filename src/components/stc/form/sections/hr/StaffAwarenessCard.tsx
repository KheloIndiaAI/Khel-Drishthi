import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import type { FormData, AwarenessLevel, KnowledgeLevel } from "../../../utils/formConfig";

interface StaffAwarenessCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
}

const AWARENESS_LEVELS: AwarenessLevel[] = [
  'Fully Aware',
  'Partially Aware',
  'Not Aware',
  'Training Needed',
];

const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  'Expert',
  'Proficient',
  'Basic',
  'Needs Training',
];

export function StaffAwarenessCard({ formData, updateStaff }: StaffAwarenessCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Staff Awareness & Knowledge</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Awareness of Administration & Coaching Staff about:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AMS & NSRS */}
          <div className="space-y-2">
            <Label htmlFor="ams_nsrs">
              AMS & NSRS
              <span className="text-xs text-muted-foreground ml-2">
                (Athlete Management System / National Sports Registry System)
              </span>
            </Label>
            <Select
              value={formData.staff.ams_nsrs_awareness || ''}
              onValueChange={(value) => updateStaff('ams_nsrs_awareness', value as AwarenessLevel)}
            >
              <SelectTrigger className="max-w-[300px]">
                <SelectValue placeholder="Select awareness level" />
              </SelectTrigger>
              <SelectContent>
                {AWARENESS_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* POCSO & POSH */}
          <div className="space-y-2">
            <Label htmlFor="pocso_posh">
              POCSO & POSH Guidelines
              <span className="text-xs text-muted-foreground ml-2">
                (Protection of Children from Sexual Offences / Prevention of Sexual Harassment)
              </span>
            </Label>
            <Select
              value={formData.staff.pocso_posh_awareness || ''}
              onValueChange={(value) => updateStaff('pocso_posh_awareness', value as AwarenessLevel)}
            >
              <SelectTrigger className="max-w-[300px]">
                <SelectValue placeholder="Select awareness level" />
              </SelectTrigger>
              <SelectContent>
                {AWARENESS_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procurement & Accounting Knowledge */}
          <div className="space-y-2">
            <Label htmlFor="procurement_knowledge">
              Knowledge of Procurement & Accounting
              <span className="text-xs text-muted-foreground ml-2">
                (Admin & Accounts Staff)
              </span>
            </Label>
            <Select
              value={formData.staff.procurement_accounting_knowledge || ''}
              onValueChange={(value) => updateStaff('procurement_accounting_knowledge', value as KnowledgeLevel)}
            >
              <SelectTrigger className="max-w-[300px]">
                <SelectValue placeholder="Select knowledge level" />
              </SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
