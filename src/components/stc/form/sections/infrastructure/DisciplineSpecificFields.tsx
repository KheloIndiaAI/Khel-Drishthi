import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisciplineFOPConfig, type FOPFieldConfig } from "../../../utils/disciplineFOPConfig";

interface DisciplineSpecificFieldsProps {
  disciplineName: string;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function DisciplineSpecificFields({ 
  disciplineName, 
  values, 
  onChange 
}: DisciplineSpecificFieldsProps) {
  const config = getDisciplineFOPConfig(disciplineName);
  
  if (config.length === 0) {
    return null;
  }

  const updateField = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  const renderField = (field: FOPFieldConfig) => {
    const value = values[field.key];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Select
              value={(value as string) || ''}
              onValueChange={(val) => updateField(field.key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <Label>
              {field.label}
              {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
            </Label>
            <Input
              type="number"
              min={field.min ?? 0}
              max={field.max}
              value={(value as number) ?? ''}
              onChange={(e) => updateField(field.key, parseFloat(e.target.value) || undefined)}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={field.key} className="flex items-center justify-between py-2">
            <Label className="cursor-pointer">{field.label}</Label>
            <Switch
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => updateField(field.key, checked)}
            />
          </div>
        );

      case 'text':
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={(value as string) || ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'multiselect':
        // For multiselect, render as checkboxes
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option) => {
                const selected = Array.isArray(value) && (value as string[]).includes(option);
                return (
                  <div key={option} className="flex items-center gap-2">
                    <Switch
                      checked={selected}
                      onCheckedChange={(checked) => {
                        const current = (value as string[]) || [];
                        updateField(
                          field.key,
                          checked
                            ? [...current, option]
                            : current.filter((v) => v !== option)
                        );
                      }}
                    />
                    <Label className="text-sm cursor-pointer">{option}</Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Group boolean fields together for better layout
  const booleanFields = config.filter(f => f.type === 'boolean');
  const otherFields = config.filter(f => f.type !== 'boolean');

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <h4 className="text-sm font-medium text-muted-foreground">
        {disciplineName}-Specific Details
      </h4>
      
      {/* Non-boolean fields in grid */}
      {otherFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherFields.map(renderField)}
        </div>
      )}
      
      {/* Boolean fields in grid */}
      {booleanFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-secondary/20 p-3 rounded-lg">
          {booleanFields.map(renderField)}
        </div>
      )}
    </div>
  );
}
