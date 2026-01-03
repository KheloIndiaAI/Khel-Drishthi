import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target } from "lucide-react";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

// Discipline-specific questions configuration
const DISCIPLINE_QUESTIONS: Record<string, Array<{
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}>> = {
  'Athletics': [
    { id: 'timing_system_available', label: 'Timing System Available', type: 'boolean' },
    { id: 'track_length', label: 'Track Length', type: 'select', options: ['400m', '200m', 'Other'] },
    { id: 'throwing_cage_available', label: 'Throwing Cage Available', type: 'boolean' },
    { id: 'pole_vault_setup_available', label: 'Pole Vault Setup Available', type: 'boolean' },
    { id: 'track_lanes', label: 'Number of Track Lanes', type: 'number' },
  ],
  'Swimming': [
    { id: 'pool_type', label: 'Pool Type', type: 'select', options: ['25m', '50m', 'Other'] },
    { id: 'pool_lanes', label: 'Number of Lanes', type: 'number' },
    { id: 'water_heating_available', label: 'Water Heating Available', type: 'boolean' },
    { id: 'timing_system_type', label: 'Timing System', type: 'select', options: ['Manual', 'Electronic', 'Other'] },
  ],
  'Boxing': [
    { id: 'boxing_rings_count', label: 'Number of Boxing Rings', type: 'number' },
    { id: 'punching_bags_count', label: 'Number of Punching Bags', type: 'number' },
    { id: 'protective_equipment_quality', label: 'Protective Equipment Quality (1-5)', type: 'number' },
  ],
  'Hockey': [
    { id: 'turf_type', label: 'Turf Type', type: 'select', options: ['Water-based', 'Sand-based', 'Hybrid', 'Natural grass', 'Not sure'] },
    { id: 'goal_posts_condition', label: 'Goal Posts Condition (1-5)', type: 'number' },
  ],
  'Football': [
    { id: 'field_surface_type', label: 'Field Surface Type', type: 'select', options: ['Natural grass', 'Synthetic', 'Mixed', 'Soil', 'Other'] },
    { id: 'goal_posts_condition', label: 'Goal Posts Condition (1-5)', type: 'number' },
  ],
  'Archery': [
    { id: 'shooting_lanes', label: 'Number of Shooting Lanes', type: 'number' },
    { id: 'range_distance', label: 'Range Distance (meters)', type: 'number' },
    { id: 'target_types', label: 'Target Types', type: 'select', options: ['Foam', 'Paper', '3D', 'Other'] },
  ],
  'Wrestling': [
    { id: 'mat_area_sqm', label: 'Mat Area (sq meters)', type: 'number' },
    { id: 'mat_count', label: 'Number of Mats', type: 'number' },
  ],
  'Judo': [
    { id: 'mat_area_sqm', label: 'Mat Area (sq meters)', type: 'number' },
    { id: 'mat_count', label: 'Number of Mats', type: 'number' },
  ],
  'Shooting': [
    { id: 'range_types', label: 'Range Types Available', type: 'select', options: ['10m', '25m', '50m', 'Multiple'] },
    { id: 'firing_points', label: 'Number of Firing Points', type: 'number' },
    { id: 'electronic_scoring_available', label: 'Electronic Scoring Available', type: 'boolean' },
    { id: 'air_weapons_count', label: 'Air Rifles/Pistols Count', type: 'number' },
  ],
  'Weightlifting': [
    { id: 'platform_count', label: 'Number of Platforms', type: 'number' },
    { id: 'competition_barbells', label: 'Competition Barbells Available', type: 'boolean' },
  ],
};

export function Section9Discipline({ formData, setFormData, disciplines }: SectionProps) {
  const updateDisciplineSpecific = (discipline: string, field: string, value: unknown) => {
    setFormData({
      ...formData,
      disciplineSpecific: {
        ...formData.disciplineSpecific,
        [discipline]: {
          ...(formData.disciplineSpecific[discipline] || {}),
          [field]: value,
        },
      },
    });
  };

  const getDisciplineValue = (discipline: string, field: string) => {
    return formData.disciplineSpecific[discipline]?.[field];
  };

  const renderQuestion = (discipline: string, question: typeof DISCIPLINE_QUESTIONS['Athletics'][0]) => {
    const value = getDisciplineValue(discipline, question.id);

    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => updateDisciplineSpecific(discipline, question.id, checked)}
            />
            <Label className="cursor-pointer">{question.label}</Label>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label>{question.label}</Label>
            <Input
              type="number"
              min={0}
              value={(value as string | number) || ''}
              onChange={(e) => updateDisciplineSpecific(discipline, question.id, parseInt(e.target.value) || undefined)}
              className="w-full md:w-48"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label>{question.label}</Label>
            <Select
              value={value as string || ''}
              onValueChange={(v) => updateDisciplineSpecific(discipline, question.id, v)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>{question.label}</Label>
            <Input
              value={value as string || ''}
              onChange={(e) => updateDisciplineSpecific(discipline, question.id, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Discipline-Specific Questions</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Answer additional questions specific to each discipline offered at this centre.
      </p>

      {disciplines.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No disciplines found. Please complete Section 2 first.
            </p>
          </CardContent>
        </Card>
      ) : (
        disciplines.map((discipline) => {
          const questions = DISCIPLINE_QUESTIONS[discipline];
          
          return (
            <Card key={discipline}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{discipline}</CardTitle>
              </CardHeader>
              <CardContent>
                {questions && questions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions.map((question) => (
                      <div key={question.id}>
                        {renderQuestion(discipline, question)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No additional questions configured for this discipline.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
