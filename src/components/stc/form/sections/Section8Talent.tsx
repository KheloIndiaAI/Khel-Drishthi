import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Trophy, AlertTriangle, Users, Megaphone, Medal, Star, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { FormData, PrefillData, DisciplineAthleteOrigin, DisciplineCompetitionData, StateWiseAthletes } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

const PUBLICITY_METHODS = [
  "School outreach",
  "District sports office",
  "Social media",
  "Newspapers",
  "Federations",
  "Clubs",
  "Other",
];

// UPDATED: Removed "State" from competition levels
const COMPETITION_LEVELS = ["National", "International"] as const;

// All Indian States and Union Territories
const INDIAN_STATES_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function Section8Talent({ formData, setFormData }: SectionProps) {
  const updateTalent = <K extends keyof FormData['talent']>(key: K, value: FormData['talent'][K]) => {
    setFormData({
      ...formData,
      talent: { ...formData.talent, [key]: value },
    });
  };

  // Auto-initialize discipline origin from sanctioned disciplines
  useEffect(() => {
    const existingOrigins = formData.talent.discipline_origin || [];
    const existingCodes = existingOrigins.map(o => o.discipline_code);
    
    const newOrigins = formData.disciplines
      .filter(d => !existingCodes.includes(d.discipline_code))
      .map(d => ({
        discipline_code: d.discipline_code,
        discipline_name: d.discipline_name,
        local_athletes_count: undefined,
        other_state_athletes_count: undefined,
        state_wise_athletes: [],
      }));
    
    if (newOrigins.length > 0) {
      updateTalent('discipline_origin', [...existingOrigins, ...newOrigins]);
    }
  }, [formData.disciplines]);

  // Auto-initialize discipline competitions from sanctioned disciplines
  useEffect(() => {
    const existingComps = formData.talent.discipline_competitions || [];
    const existingCodes = existingComps.map(c => c.discipline_code);
    
    const newComps = formData.disciplines
      .filter(d => !existingCodes.includes(d.discipline_code))
      .map(d => ({
        discipline_code: d.discipline_code,
        discipline_name: d.discipline_name,
      }));
    
    if (newComps.length > 0) {
      updateTalent('discipline_competitions', [...existingComps, ...newComps]);
    }
  }, [formData.disciplines]);

  // Calculate total existing athletes from Section 2
  const totalExisting = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0) +
    (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0), 0);

  // STC-level origin totals
  const stcOriginTotal = (formData.talent.local_athletes_count || 0) + 
                         (formData.talent.other_state_athletes_count || 0);
  const hasSCTMismatch = totalExisting > 0 && stcOriginTotal > 0 && 
    Math.abs(totalExisting - stcOriginTotal) / totalExisting > 0.1;

  // Discipline-wise origin totals
  const disciplineOriginTotals = useMemo(() => {
    const origins = formData.talent.discipline_origin || [];
    return origins.reduce((acc, d) => {
      const stateWiseTotal = (d.state_wise_athletes || []).reduce((sum, s) => sum + (s.athlete_count || 0), 0);
      return {
        local: acc.local + (d.local_athletes_count || 0),
        other: acc.other + stateWiseTotal,
      };
    }, { local: 0, other: 0 });
  }, [formData.talent.discipline_origin]);

  const hasDisciplineOriginMismatch = stcOriginTotal > 0 && 
    (disciplineOriginTotals.local + disciplineOriginTotals.other) > 0 &&
    Math.abs(stcOriginTotal - (disciplineOriginTotals.local + disciplineOriginTotals.other)) > 0;

  // Competition summary calculations (State removed)
  const competitionSummary = useMemo(() => {
    const comps = formData.talent.discipline_competitions || [];
    return {
      national: {
        participants: comps.reduce((sum, c) => sum + (c.national_participants_current || 0) + (c.national_participants_5yr || 0), 0),
        medals: comps.reduce((sum, c) => sum + (c.national_medals_current || 0) + (c.national_medals_5yr || 0), 0),
      },
      international: {
        participants: comps.reduce((sum, c) => sum + (c.international_participants_current || 0) + (c.international_participants_5yr || 0), 0),
        medals: comps.reduce((sum, c) => sum + (c.international_medals_current || 0) + (c.international_medals_5yr || 0), 0),
      },
    };
  }, [formData.talent.discipline_competitions]);

  // Update discipline origin
  const updateDisciplineOrigin = (code: string, field: keyof DisciplineAthleteOrigin, value: number | undefined | StateWiseAthletes[]) => {
    const origins = formData.talent.discipline_origin || [];
    const updated = origins.map(o => 
      o.discipline_code === code ? { ...o, [field]: value } : o
    );
    updateTalent('discipline_origin', updated);
  };

  // Add state-wise athlete entry for a discipline
  const addStateWiseAthlete = (disciplineCode: string) => {
    const origins = formData.talent.discipline_origin || [];
    const updated = origins.map(o => {
      if (o.discipline_code === disciplineCode) {
        const stateWise = o.state_wise_athletes || [];
        return { ...o, state_wise_athletes: [...stateWise, { state_name: '', athlete_count: 0 }] };
      }
      return o;
    });
    updateTalent('discipline_origin', updated);
  };

  // Update state-wise athlete entry
  const updateStateWiseAthlete = (disciplineCode: string, index: number, field: keyof StateWiseAthletes, value: string | number) => {
    const origins = formData.talent.discipline_origin || [];
    const updated = origins.map(o => {
      if (o.discipline_code === disciplineCode) {
        const stateWise = [...(o.state_wise_athletes || [])];
        stateWise[index] = { ...stateWise[index], [field]: value };
        return { ...o, state_wise_athletes: stateWise };
      }
      return o;
    });
    updateTalent('discipline_origin', updated);
  };

  // Remove state-wise athlete entry
  const removeStateWiseAthlete = (disciplineCode: string, index: number) => {
    const origins = formData.talent.discipline_origin || [];
    const updated = origins.map(o => {
      if (o.discipline_code === disciplineCode) {
        const stateWise = (o.state_wise_athletes || []).filter((_, i) => i !== index);
        return { ...o, state_wise_athletes: stateWise };
      }
      return o;
    });
    updateTalent('discipline_origin', updated);
  };

  // Update discipline competition
  const updateDisciplineCompetition = (code: string, field: keyof DisciplineCompetitionData, value: number | undefined) => {
    const comps = formData.talent.discipline_competitions || [];
    const updated = comps.map(c => 
      c.discipline_code === code ? { ...c, [field]: value } : c
    );
    updateTalent('discipline_competitions', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Talent Identification & Competitions</h3>
      </div>

      {/* Card 1: Athlete Origin (STC-Level) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Athlete Origin (As on date)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_athletes">Local Athletes (Same State)</Label>
              <Input
                id="local_athletes"
                type="number"
                min={0}
                value={formData.talent.local_athletes_count ?? ''}
                onChange={(e) => updateTalent('local_athletes_count', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_state">Other State Athletes</Label>
              <Input
                id="other_state"
                type="number"
                min={0}
                value={formData.talent.other_state_athletes_count ?? ''}
                onChange={(e) => updateTalent('other_state_athletes_count', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div className="flex items-end">
              <div className="text-center p-3 bg-secondary/30 rounded-lg w-full">
                <p className="text-xs text-muted-foreground">Total (should match Section 2)</p>
                <p className="text-xl font-bold text-foreground">{stcOriginTotal} / {totalExisting}</p>
              </div>
            </div>
          </div>

          {hasSCTMismatch && (
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

      {/* Card 2: Discipline-wise Athlete Origin with State-wise Breakdown */}
      {formData.disciplines.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Athlete Origin by Discipline
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              For each discipline, enter local athletes and specify which states other athletes come from.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.talent.discipline_origin || []).map((origin) => {
              const stateWiseTotal = (origin.state_wise_athletes || []).reduce((sum, s) => sum + (s.athlete_count || 0), 0);
              const total = (origin.local_athletes_count || 0) + stateWiseTotal;
              
              return (
                <Collapsible key={origin.discipline_code} className="border rounded-lg">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{origin.discipline_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        Total: {total}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Local Athletes (Same State)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={origin.local_athletes_count ?? ''}
                          onChange={(e) => updateDisciplineOrigin(
                            origin.discipline_code, 
                            'local_athletes_count', 
                            e.target.value ? parseInt(e.target.value) : undefined
                          )}
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="text-center p-3 bg-secondary/30 rounded-lg w-full">
                          <p className="text-xs text-muted-foreground">Other States Total</p>
                          <p className="text-lg font-bold text-foreground">{stateWiseTotal}</p>
                        </div>
                      </div>
                    </div>

                    {/* State-wise Athletes Breakdown */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Other State Athletes Breakdown</Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addStateWiseAthlete(origin.discipline_code)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add State
                        </Button>
                      </div>
                      
                      {(origin.state_wise_athletes || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Click "Add State" to specify which states other athletes come from
                        </p>
                      )}

                      {(origin.state_wise_athletes || []).map((stateAthlete, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={stateAthlete.state_name}
                            onValueChange={(value) => updateStateWiseAthlete(origin.discipline_code, index, 'state_name', value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES_UTS.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min={0}
                            className="w-24"
                            placeholder="Count"
                            value={stateAthlete.athlete_count || ''}
                            onChange={(e) => updateStateWiseAthlete(
                              origin.discipline_code, 
                              index, 
                              'athlete_count', 
                              parseInt(e.target.value) || 0
                            )}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive h-9 w-9"
                            onClick={() => removeStateWiseAthlete(origin.discipline_code, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Summary:</span>
              <span className="text-sm">
                Local: <strong>{disciplineOriginTotals.local}</strong> | 
                Other State: <strong>{disciplineOriginTotals.other}</strong> | 
                Total: <strong>{disciplineOriginTotals.local + disciplineOriginTotals.other}</strong>
              </span>
            </div>

            {hasDisciplineOriginMismatch && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm text-warning">
                  Discipline totals ({disciplineOriginTotals.local + disciplineOriginTotals.other}) don't match STC-level totals ({stcOriginTotal})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card 3: Selection Trials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Selection Trials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Publicity Question */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Are selection trials given sufficient publicity? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.talent.trials_sufficient_publicity === true ? 'yes' : 
                     formData.talent.trials_sufficient_publicity === false ? 'no' : ''}
              onValueChange={(value) => updateTalent('trials_sufficient_publicity', value === 'yes')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="publicity_yes" />
                <Label htmlFor="publicity_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="publicity_no" />
                <Label htmlFor="publicity_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Publicity Methods (only if Yes) */}
          {formData.talent.trials_sufficient_publicity === true && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <Label className="text-sm font-medium">Methods used to publicize selection trials:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          )}

          <div className="border-t border-border pt-4 space-y-3">
            {/* Turnout Question */}
            <Label className="text-sm font-medium">
              Is there a good turnout of athletes during selection trials? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.talent.trials_good_turnout === true ? 'yes' : 
                     formData.talent.trials_good_turnout === false ? 'no' : ''}
              onValueChange={(value) => updateTalent('trials_good_turnout', value === 'yes')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="turnout_yes" />
                <Label htmlFor="turnout_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="turnout_no" />
                <Label htmlFor="turnout_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {/* Turnout Notes - ALWAYS VISIBLE (non-conditional) */}
            <div className="space-y-2">
              <Label htmlFor="turnout_notes" className="text-sm font-medium">
                Brief about turnout - reasons for good/poor turnout and any challenges:
              </Label>
              <Textarea
                id="turnout_notes"
                placeholder="e.g., Good turnout due to strong outreach to schools and district sports offices. OR Poor turnout due to lack of awareness, transportation issues, timing conflicts, limited outreach to rural areas..."
                value={formData.talent.trials_turnout_notes || ''}
                onChange={(e) => updateTalent('trials_turnout_notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Competition Participation by Discipline (State REMOVED) */}
      {formData.disciplines.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Competition Participation by Discipline
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              National and International level participation and medals only.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.talent.discipline_competitions || []).map((comp) => (
              <Collapsible key={comp.discipline_code} defaultOpen={formData.disciplines.length <= 3}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <span className="font-medium">{comp.discipline_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-28">Level</TableHead>
                          <TableHead colSpan={2} className="text-center bg-primary/5">2025-26 (Current)</TableHead>
                          <TableHead colSpan={2} className="text-center bg-secondary/30">2020-2024 (5 Years)</TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead className="text-center text-xs bg-primary/5">Participants</TableHead>
                          <TableHead className="text-center text-xs bg-primary/5">Medals</TableHead>
                          <TableHead className="text-center text-xs bg-secondary/30">Participants</TableHead>
                          <TableHead className="text-center text-xs bg-secondary/30">Medals</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {COMPETITION_LEVELS.map((level) => {
                          const levelLower = level.toLowerCase() as 'national' | 'international';
                          return (
                            <TableRow key={level}>
                              <TableCell className="font-medium">{level}</TableCell>
                              <TableCell className="bg-primary/5">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-16 mx-auto text-center"
                                  value={comp[`${levelLower}_participants_current`] ?? ''}
                                  onChange={(e) => updateDisciplineCompetition(
                                    comp.discipline_code,
                                    `${levelLower}_participants_current` as keyof DisciplineCompetitionData,
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                />
                              </TableCell>
                              <TableCell className="bg-primary/5">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-16 mx-auto text-center"
                                  value={comp[`${levelLower}_medals_current`] ?? ''}
                                  onChange={(e) => updateDisciplineCompetition(
                                    comp.discipline_code,
                                    `${levelLower}_medals_current` as keyof DisciplineCompetitionData,
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                />
                              </TableCell>
                              <TableCell className="bg-secondary/30">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-16 mx-auto text-center"
                                  value={comp[`${levelLower}_participants_5yr`] ?? ''}
                                  onChange={(e) => updateDisciplineCompetition(
                                    comp.discipline_code,
                                    `${levelLower}_participants_5yr` as keyof DisciplineCompetitionData,
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                />
                              </TableCell>
                              <TableCell className="bg-secondary/30">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-16 mx-auto text-center"
                                  value={comp[`${levelLower}_medals_5yr`] ?? ''}
                                  onChange={(e) => updateDisciplineCompetition(
                                    comp.discipline_code,
                                    `${levelLower}_medals_5yr` as keyof DisciplineCompetitionData,
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Competition Summary (State removed) */}
            <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">STC Competition Summary (All Periods Combined)</h5>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">National</p>
                  <p className="font-bold">{competitionSummary.national.participants} participants</p>
                  <p className="text-sm text-primary">{competitionSummary.national.medals} medals</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">International</p>
                  <p className="font-bold">{competitionSummary.international.participants} participants</p>
                  <p className="text-sm text-primary">{competitionSummary.international.medals} medals</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 5: Notable Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4" />
            Notable Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notable_achievements">
              Please mention notable achievements from this STC including Olympians, World Champions, Asian Games medalists, etc.
            </Label>
            <Textarea
              id="notable_achievements"
              placeholder="e.g., Athlete X - Olympic Bronze 2024, Athlete Y - World Junior Champion 2023, Athlete Z - Asian Games Gold 2022..."
              value={formData.talent.notable_achievements || ''}
              onChange={(e) => updateTalent('notable_achievements', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
