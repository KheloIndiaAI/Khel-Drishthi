import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Users, AlertTriangle } from "lucide-react";
import type { FormData, PrefillData, DisciplineStrength } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section2Disciplines({ formData, setFormData, prefillData }: SectionProps) {
  const updateDiscipline = (index: number, field: keyof DisciplineStrength, value: unknown) => {
    const updated = [...formData.disciplines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      disciplines: updated,
    });
  };

  const computeTotals = (d: DisciplineStrength) => {
    const sanctioned_res = (d.sanctioned_res_boys || 0) + (d.sanctioned_res_girls || 0);
    const sanctioned_nonres = (d.sanctioned_nonres_boys || 0) + (d.sanctioned_nonres_girls || 0);
    const sanctioned_total = sanctioned_res + sanctioned_nonres;

    const existing_res = (d.existing_res_boys || 0) + (d.existing_res_girls || 0);
    const existing_nonres = (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0);
    const existing_total = existing_res + existing_nonres;

    const vacancy = Math.max(0, sanctioned_total - existing_total);
    const surplus = Math.max(0, existing_total - sanctioned_total);
    const utilization = sanctioned_total > 0 ? Math.round((existing_total / sanctioned_total) * 100) : 0;

    return { sanctioned_total, existing_total, vacancy, surplus, utilization };
  };

  // Calculate overall totals
  const overallTotals = formData.disciplines.reduce(
    (acc, d) => {
      const totals = computeTotals(d);
      return {
        sanctioned: acc.sanctioned + totals.sanctioned_total,
        existing: acc.existing + totals.existing_total,
        vacancy: acc.vacancy + totals.vacancy,
        surplus: acc.surplus + totals.surplus,
      };
    },
    { sanctioned: 0, existing: 0, vacancy: 0, surplus: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Sanctioned</p>
              <p className="text-2xl font-bold text-foreground">{overallTotals.sanctioned}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Existing</p>
              <p className="text-2xl font-bold text-foreground">{overallTotals.existing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Vacancies</p>
              <p className="text-2xl font-bold text-accent">{overallTotals.vacancy}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className="text-2xl font-bold text-primary">
                {overallTotals.sanctioned > 0 
                  ? Math.round((overallTotals.existing / overallTotals.sanctioned) * 100) 
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discipline Cards */}
      {formData.disciplines.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No disciplines found. Please check the database for this centre.
            </p>
          </CardContent>
        </Card>
      ) : (
        formData.disciplines.map((discipline, index) => {
          const totals = computeTotals(discipline);
          const hasSurplus = totals.surplus > 0;
          const isPrefilled = prefillData.disciplines.some(
            (d) => d.discipline_code === discipline.discipline_code
          );

          return (
            <Card key={discipline.discipline_code || index} className={hasSurplus ? 'border-warning/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {discipline.discipline_name || `Discipline ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isPrefilled && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Database className="h-3 w-3" />
                        Prefilled
                      </Badge>
                    )}
                    <Badge variant={totals.utilization >= 80 ? 'default' : 'secondary'}>
                      {totals.utilization}% utilized
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strength Grid */}
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  <div></div>
                  <div className="font-medium text-muted-foreground">Boys</div>
                  <div className="font-medium text-muted-foreground">Girls</div>
                  <div className="font-medium text-muted-foreground">Total</div>
                  <div className="font-medium text-muted-foreground">Vacancy</div>
                </div>

                {/* Sanctioned Residential */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="text-sm">San. Res.</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discipline.sanctioned_res_boys || ''}
                    onChange={(e) => updateDiscipline(index, 'sanctioned_res_boys', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={discipline.sanctioned_res_girls || ''}
                    onChange={(e) => updateDiscipline(index, 'sanctioned_res_girls', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <div className="text-center font-medium">
                    {(discipline.sanctioned_res_boys || 0) + (discipline.sanctioned_res_girls || 0)}
                  </div>
                  <div></div>
                </div>

                {/* Sanctioned Non-Residential */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="text-sm">San. Non-Res.</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discipline.sanctioned_nonres_boys || ''}
                    onChange={(e) => updateDiscipline(index, 'sanctioned_nonres_boys', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={discipline.sanctioned_nonres_girls || ''}
                    onChange={(e) => updateDiscipline(index, 'sanctioned_nonres_girls', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <div className="text-center font-medium">
                    {(discipline.sanctioned_nonres_boys || 0) + (discipline.sanctioned_nonres_girls || 0)}
                  </div>
                  <div></div>
                </div>

                {/* Existing Residential */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="text-sm">Ex. Res.</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discipline.existing_res_boys || ''}
                    onChange={(e) => updateDiscipline(index, 'existing_res_boys', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={discipline.existing_res_girls || ''}
                    onChange={(e) => updateDiscipline(index, 'existing_res_girls', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <div className="text-center font-medium">
                    {(discipline.existing_res_boys || 0) + (discipline.existing_res_girls || 0)}
                  </div>
                  <div className="text-center text-accent">
                    {Math.max(0, 
                      ((discipline.sanctioned_res_boys || 0) + (discipline.sanctioned_res_girls || 0)) -
                      ((discipline.existing_res_boys || 0) + (discipline.existing_res_girls || 0))
                    )}
                  </div>
                </div>

                {/* Existing Non-Residential */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="text-sm">Ex. Non-Res.</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discipline.existing_nonres_boys || ''}
                    onChange={(e) => updateDiscipline(index, 'existing_nonres_boys', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={discipline.existing_nonres_girls || ''}
                    onChange={(e) => updateDiscipline(index, 'existing_nonres_girls', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                  />
                  <div className="text-center font-medium">
                    {(discipline.existing_nonres_boys || 0) + (discipline.existing_nonres_girls || 0)}
                  </div>
                  <div className="text-center text-accent">
                    {Math.max(0,
                      ((discipline.sanctioned_nonres_boys || 0) + (discipline.sanctioned_nonres_girls || 0)) -
                      ((discipline.existing_nonres_boys || 0) + (discipline.existing_nonres_girls || 0))
                    )}
                  </div>
                </div>

                {/* Totals Row */}
                <div className="grid grid-cols-5 gap-2 items-center pt-2 border-t border-border">
                  <Label className="text-sm font-semibold">Total</Label>
                  <div></div>
                  <div></div>
                  <div className="text-center font-bold text-foreground">
                    {totals.existing_total} / {totals.sanctioned_total}
                  </div>
                  <div className="text-center font-bold text-accent">
                    {totals.vacancy}
                  </div>
                </div>

                {/* Surplus Warning */}
                {hasSurplus && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg mt-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-warning font-medium">
                        Surplus of {totals.surplus} athletes (existing exceeds sanctioned)
                      </p>
                      <Textarea
                        placeholder="Please explain the surplus..."
                        value={discipline.strength_surplus_note || ''}
                        onChange={(e) => updateDiscipline(index, 'strength_surplus_note', e.target.value)}
                        className="mt-2 h-16"
                      />
                    </div>
                  </div>
                )}

                {/* Age Group */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor={`age_group_${index}`}>Age Group</Label>
                    <Select
                      value={discipline.age_group || ''}
                      onValueChange={(value) => updateDiscipline(index, 'age_group', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="U14">U14</SelectItem>
                        <SelectItem value="U16">U16</SelectItem>
                        <SelectItem value="U18">U18</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
