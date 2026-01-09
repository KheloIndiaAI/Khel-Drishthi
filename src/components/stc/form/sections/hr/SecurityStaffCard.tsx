import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Home, Leaf } from "lucide-react";
import type { FormData, SupportStaff } from "../../../utils/formConfig";

interface SupportStaffCardProps {
  formData: FormData;
  updateStaff: <K extends keyof FormData['staff']>(key: K, value: FormData['staff'][K]) => void;
}

export function SecurityStaffCard({ formData, updateStaff }: SupportStaffCardProps) {
  const supportStaff = formData.staff.support_staff || {
    security_count: undefined,
    housekeeping_count: undefined,
    horticulture_count: undefined,
  };

  const updateSupportStaff = (field: keyof SupportStaff, value: number | undefined) => {
    updateStaff('support_staff', {
      ...supportStaff,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Support Staff</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter the count of support staff working at the STC in each category.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Staff */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <Label htmlFor="security_count" className="font-medium">Security Staff</Label>
            </div>
            <Input
              id="security_count"
              type="number"
              min={0}
              placeholder="Enter count"
              value={supportStaff.security_count ?? ''}
              onChange={(e) => updateSupportStaff('security_count', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-xs text-muted-foreground">
              Guards, watchmen, security personnel
            </p>
          </CardContent>
        </Card>

        {/* Housekeeping Staff */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-orange-500" />
              <Label htmlFor="housekeeping_count" className="font-medium">Housekeeping Staff</Label>
            </div>
            <Input
              id="housekeeping_count"
              type="number"
              min={0}
              placeholder="Enter count"
              value={supportStaff.housekeeping_count ?? ''}
              onChange={(e) => updateSupportStaff('housekeeping_count', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-xs text-muted-foreground">
              Cleaning, maintenance, helper staff
            </p>
          </CardContent>
        </Card>

        {/* Horticulture Staff */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              <Label htmlFor="horticulture_count" className="font-medium">Horticulture Staff</Label>
            </div>
            <Input
              id="horticulture_count"
              type="number"
              min={0}
              placeholder="Enter count"
              value={supportStaff.horticulture_count ?? ''}
              onChange={(e) => updateSupportStaff('horticulture_count', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-xs text-muted-foreground">
              Gardeners, groundskeepers, landscaping staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Summary */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Support Staff:</span>
          <span className="text-lg font-bold text-primary">
            {(supportStaff.security_count || 0) + (supportStaff.housekeeping_count || 0) + (supportStaff.horticulture_count || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
