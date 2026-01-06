import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Expand, Cloud } from "lucide-react";

interface ExpansionEnvironmentCardProps {
  surplusLandAvailable?: boolean;
  surplusLandAcres?: number;
  surplusLandPotentialUse?: string;
  weatherImpactsTraining?: boolean;
  weatherImpactDescription?: string;
  onSurplusChange: (available: boolean, acres?: number, potentialUse?: string) => void;
  onWeatherChange: (impacts: boolean, description?: string) => void;
}

export function ExpansionEnvironmentCard({
  surplusLandAvailable,
  surplusLandAcres,
  surplusLandPotentialUse,
  weatherImpactsTraining,
  weatherImpactDescription,
  onSurplusChange,
  onWeatherChange
}: ExpansionEnvironmentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Expand className="h-5 w-5 text-primary" />
          Expansion & Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Surplus Land */}
        <div className="space-y-3">
          <Label className="font-medium">Surplus Land for Expansion</Label>
          
          <div className="space-y-2">
            <Label>Is surplus land available for expansion of the centre?</Label>
            <RadioGroup
              value={surplusLandAvailable === true ? 'yes' : surplusLandAvailable === false ? 'no' : ''}
              onValueChange={(value) => onSurplusChange(
                value === 'yes', 
                surplusLandAcres, 
                surplusLandPotentialUse
              )}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="surplus_yes" />
                <Label htmlFor="surplus_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="surplus_no" />
                <Label htmlFor="surplus_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {surplusLandAvailable === true && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label>Surplus Land Available (acres)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={surplusLandAcres || ''}
                  onChange={(e) => onSurplusChange(
                    true, 
                    parseFloat(e.target.value) || undefined, 
                    surplusLandPotentialUse
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Potential Use</Label>
                <Textarea
                  value={surplusLandPotentialUse || ''}
                  onChange={(e) => onSurplusChange(true, surplusLandAcres, e.target.value)}
                  placeholder="Please mention the number of acres available for expansion and what it can be used for construction of (e.g., new hostel, additional courts, indoor hall)..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weather Impact */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <Label className="font-medium">Weather Impact on Training</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Does weather impact the training sessions of athletes?</Label>
            <RadioGroup
              value={weatherImpactsTraining === true ? 'yes' : weatherImpactsTraining === false ? 'no' : ''}
              onValueChange={(value) => onWeatherChange(value === 'yes', weatherImpactDescription)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="weather_yes" />
                <Label htmlFor="weather_yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="weather_no" />
                <Label htmlFor="weather_no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {weatherImpactsTraining === true && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
              <Label>Describe how weather impacts training</Label>
              <Textarea
                value={weatherImpactDescription || ''}
                onChange={(e) => onWeatherChange(true, e.target.value)}
                placeholder="Describe the impact of weather on training sessions (e.g., monsoon flooding, extreme heat, winter fog)..."
                rows={3}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
