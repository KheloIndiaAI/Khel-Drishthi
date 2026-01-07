import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  AlertTriangle, 
  Eye, 
  Target, 
  Award, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import type { FormData, PrefillData, VisionData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section9Vision({ formData, setFormData, prefillData }: SectionProps) {
  const [openSections, setOpenSections] = useState({
    shortTerm: true,
    mediumTerm: false,
    longTerm: false,
  });

  const vision = formData.vision || {};
  const rawStcName = formData.core.stc_name || prefillData.stc_name || '';
  const stcName = rawStcName ? `STC ${rawStcName}` : 'this STC';

  const updateVision = (updates: Partial<VisionData>) => {
    setFormData({
      ...formData,
      vision: {
        ...vision,
        ...updates,
      },
    });
  };

  const updateStrengths = (field: 'strength_1' | 'strength_2' | 'strength_3', value: string) => {
    updateVision({
      strengths: {
        ...vision.strengths,
        [field]: value,
      },
    });
  };

  const updateChallenges = (field: 'challenge_1' | 'challenge_2' | 'challenge_3', value: string) => {
    updateVision({
      challenges: {
        ...vision.challenges,
        [field]: value,
      },
    });
  };

  const updateActionable = (
    type: 'short_term_actions' | 'medium_term_suggestions' | 'long_term_suggestions',
    field: 'point_1' | 'point_2' | 'point_3',
    value: string
  ) => {
    updateVision({
      [type]: {
        ...vision[type],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
          </div>
          <h2 className="text-xl font-display font-bold uppercase tracking-wide text-foreground">
            Charting the Future
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">
          How <span className="font-semibold text-primary">{stcName}</span> can transform India's sporting landscape
        </p>
      </div>

      {/* Card 1: STC Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Key Strengths of {stcName}
          </CardTitle>
          <CardDescription>
            Identify the 3 most significant strengths that set this STC apart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strength_1" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">1</span>
              Strength 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="strength_1"
              placeholder="e.g., World-class shooting range facilities"
              value={vision.strengths?.strength_1 || ''}
              onChange={(e) => updateStrengths('strength_1', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strength_2" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">2</span>
              Strength 2
            </Label>
            <Input
              id="strength_2"
              placeholder="e.g., Experienced coaching staff with international exposure"
              value={vision.strengths?.strength_2 || ''}
              onChange={(e) => updateStrengths('strength_2', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strength_3" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">3</span>
              Strength 3
            </Label>
            <Input
              id="strength_3"
              placeholder="e.g., Strong athlete pipeline from local talent pool"
              value={vision.strengths?.strength_3 || ''}
              onChange={(e) => updateStrengths('strength_3', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: STC Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Critical Challenges Facing {stcName}
          </CardTitle>
          <CardDescription>
            What are the 3 most important challenges that need to be addressed?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenge_1" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">1</span>
              Challenge 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="challenge_1"
              placeholder="e.g., Aging hostel infrastructure"
              value={vision.challenges?.challenge_1 || ''}
              onChange={(e) => updateChallenges('challenge_1', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenge_2" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">2</span>
              Challenge 2
            </Label>
            <Input
              id="challenge_2"
              placeholder="e.g., Shortage of certified coaches"
              value={vision.challenges?.challenge_2 || ''}
              onChange={(e) => updateChallenges('challenge_2', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenge_3" className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">3</span>
              Challenge 3
            </Label>
            <Input
              id="challenge_3"
              placeholder="e.g., Limited equipment budget"
              value={vision.challenges?.challenge_3 || ''}
              onChange={(e) => updateChallenges('challenge_3', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Vision Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vision for Excellence
          </CardTitle>
          <CardDescription>
            Describe your vision for how {stcName} can enhance its contribution to India's sporting ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="vision_statement">Vision Statement</Label>
            <Textarea
              id="vision_statement"
              placeholder="Describe your aspirational vision for this STC's role in developing elite athletes and contributing to India's sporting success on the global stage..."
              value={vision.vision_statement || ''}
              onChange={(e) => updateVision({ vision_statement: e.target.value })}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {(vision.vision_statement || '').length} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Strategic Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Strategic Roadmap
          </CardTitle>
          <CardDescription>
            Outline actionable suggestions across different time horizons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Short-Term Actions */}
          <Collapsible
            open={openSections.shortTerm}
            onOpenChange={(open) => setOpenSections(prev => ({ ...prev, shortTerm: open }))}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-secondary/50 hover:bg-secondary">
                <div className="text-left">
                  <p className="font-medium">Short-Term Actions (6 Months - 1 Year)</p>
                  <p className="text-sm text-muted-foreground">Immediate actionable points</p>
                </div>
                {openSections.shortTerm ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="short_1">Action 1</Label>
                <Textarea
                  id="short_1"
                  placeholder="e.g., Procure essential training equipment for priority disciplines"
                  value={vision.short_term_actions?.point_1 || ''}
                  onChange={(e) => updateActionable('short_term_actions', 'point_1', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_2">Action 2</Label>
                <Textarea
                  id="short_2"
                  placeholder="e.g., Organize coaching certification workshop"
                  value={vision.short_term_actions?.point_2 || ''}
                  onChange={(e) => updateActionable('short_term_actions', 'point_2', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_3">Action 3</Label>
                <Textarea
                  id="short_3"
                  placeholder="e.g., Establish athlete nutrition monitoring system"
                  value={vision.short_term_actions?.point_3 || ''}
                  onChange={(e) => updateActionable('short_term_actions', 'point_3', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Medium-Term Suggestions */}
          <Collapsible
            open={openSections.mediumTerm}
            onOpenChange={(open) => setOpenSections(prev => ({ ...prev, mediumTerm: open }))}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-secondary/50 hover:bg-secondary">
                <div className="text-left">
                  <p className="font-medium">Medium-Term Suggestions (1 - 3 Years)</p>
                  <p className="text-sm text-muted-foreground">Capacity building initiatives</p>
                </div>
                {openSections.mediumTerm ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medium_1">Suggestion 1</Label>
                <Textarea
                  id="medium_1"
                  placeholder="e.g., Upgrade hostel facilities with modern amenities"
                  value={vision.medium_term_suggestions?.point_1 || ''}
                  onChange={(e) => updateActionable('medium_term_suggestions', 'point_1', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium_2">Suggestion 2</Label>
                <Textarea
                  id="medium_2"
                  placeholder="e.g., Develop sports science support infrastructure"
                  value={vision.medium_term_suggestions?.point_2 || ''}
                  onChange={(e) => updateActionable('medium_term_suggestions', 'point_2', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium_3">Suggestion 3</Label>
                <Textarea
                  id="medium_3"
                  placeholder="e.g., Establish partnership with state sports federation"
                  value={vision.medium_term_suggestions?.point_3 || ''}
                  onChange={(e) => updateActionable('medium_term_suggestions', 'point_3', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Long-Term Suggestions */}
          <Collapsible
            open={openSections.longTerm}
            onOpenChange={(open) => setOpenSections(prev => ({ ...prev, longTerm: open }))}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-secondary/50 hover:bg-secondary">
                <div className="text-left">
                  <p className="font-medium">Long-Term Suggestions (3 - 5 Years)</p>
                  <p className="text-sm text-muted-foreground">Transformational goals</p>
                </div>
                {openSections.longTerm ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="long_1">Suggestion 1</Label>
                <Textarea
                  id="long_1"
                  placeholder="e.g., Transform into a multi-discipline center of excellence"
                  value={vision.long_term_suggestions?.point_1 || ''}
                  onChange={(e) => updateActionable('long_term_suggestions', 'point_1', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_2">Suggestion 2</Label>
                <Textarea
                  id="long_2"
                  placeholder="e.g., Build world-class indoor training complex"
                  value={vision.long_term_suggestions?.point_2 || ''}
                  onChange={(e) => updateActionable('long_term_suggestions', 'point_2', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_3">Suggestion 3</Label>
                <Textarea
                  id="long_3"
                  placeholder="e.g., Establish international training partnerships"
                  value={vision.long_term_suggestions?.point_3 || ''}
                  onChange={(e) => updateActionable('long_term_suggestions', 'point_3', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Card 5: NCOE Upgrade Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            National Centre of Excellence Potential
          </CardTitle>
          <CardDescription>
            Assess whether {stcName} is suitable for upgrade to NCOE status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Is {stcName} fit for upgradation into NCOE?</Label>
            <RadioGroup
              value={vision.fit_for_ncoe_upgrade || ''}
              onValueChange={(value) => updateVision({ fit_for_ncoe_upgrade: value as 'yes' | 'no' | 'not_sure' })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="ncoe_yes" />
                <Label htmlFor="ncoe_yes" className="font-normal cursor-pointer">
                  Yes - Ready for upgrade
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="ncoe_no" />
                <Label htmlFor="ncoe_no" className="font-normal cursor-pointer">
                  No - Not ready at this time
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="not_sure" id="ncoe_not_sure" />
                <Label htmlFor="ncoe_not_sure" className="font-normal cursor-pointer">
                  Potentially - With improvements
                </Label>
              </div>
            </RadioGroup>
          </div>

          {(vision.fit_for_ncoe_upgrade === 'yes' || vision.fit_for_ncoe_upgrade === 'not_sure') && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="ncoe_justification">
                Please provide justification for your assessment
              </Label>
              <Textarea
                id="ncoe_justification"
                placeholder="Explain the specific reasons and evidence supporting your assessment..."
                value={vision.ncoe_upgrade_justification || ''}
                onChange={(e) => updateVision({ ncoe_upgrade_justification: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 6: Additional Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Additional Observations
          </CardTitle>
          <CardDescription>
            Any other specific comments, concerns, or recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="other_comments"
              placeholder="Share any additional observations that haven't been covered above..."
              value={vision.other_comments || ''}
              onChange={(e) => updateVision({ other_comments: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
