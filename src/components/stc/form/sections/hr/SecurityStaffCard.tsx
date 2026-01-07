import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import type { FormData } from "../../../utils/formConfig";

interface SecurityStaffCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
}

export function SecurityStaffCard({ formData, updateStaff }: SecurityStaffCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Security Staff</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="security_staff_count">Number of Security Staff Present at STC</Label>
        <Input
          id="security_staff_count"
          type="number"
          min={0}
          value={formData.staff.security_staff_count ?? ''}
          onChange={(e) => updateStaff('security_staff_count', e.target.value ? parseInt(e.target.value) : undefined)}
          className="max-w-[200px]"
        />
      </div>
    </div>
  );
}
