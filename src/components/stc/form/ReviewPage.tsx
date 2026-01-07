import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FORM_SECTIONS } from "../utils/formConfig";
import { computeDerivedKPIs } from "../utils/derivedMetrics";
import { computeDataQualityFlags } from "../utils/dataQualityFlags";
import { computeScoring } from "../utils/scoringEngine";
import { exportFormToPDF } from "../utils/pdfExport";
import {
  CheckCircle2, AlertTriangle, AlertCircle, Send, ArrowRight,
  Users, Building2, Dumbbell, Trophy, Download
} from "lucide-react";
import type { FormData, RespondentData } from "../utils/formConfig";
import confetti from "canvas-confetti";

interface ReviewPageProps {
  formData: FormData;
  respondent: RespondentData;
  disciplines: string[];
  centreId: string;
  centreName: string;
  onJumpToSection: (index: number) => void;
}

export function ReviewPage({
  formData,
  respondent,
  disciplines,
  centreId,
  centreName,
  onJumpToSection,
}: ReviewPageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute derived data
  const derivedKPIs = computeDerivedKPIs(formData, disciplines);
  const dataQualityFlags = computeDataQualityFlags(formData, disciplines);
  const scoring = computeScoring(formData, derivedKPIs, dataQualityFlags);

  // Count flags by severity
  const criticalFlags = Object.values(dataQualityFlags).filter(f => f.severity === 'error').length;
  const warningFlags = Object.values(dataQualityFlags).filter(f => f.severity === 'warning').length;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('stc_detailed_data')
        .update({
          centre_name: centreName,
          is_submitted: true,
          submitted_at: now,
          submitted_by: session.session.user.id,
          centre_identity: JSON.parse(JSON.stringify({
            ...formData.core,
            respondent,
          })),
          infrastructure: JSON.parse(JSON.stringify(formData.infrastructure)),
          hostel_facilities: JSON.parse(JSON.stringify(formData.hostel)),
          staff_details: JSON.parse(JSON.stringify(formData.staff)),
          medical_facilities: JSON.parse(JSON.stringify(formData.medical)),
          equipment_inventory: JSON.parse(JSON.stringify(formData.equipment)),
          athlete_details: JSON.parse(JSON.stringify(formData.talent)),
          challenges: JSON.parse(JSON.stringify({
            disciplineSpecific: formData.disciplineSpecific,
            attachments: formData.attachments,
            derived_kpis: derivedKPIs,
            data_quality_flags: dataQualityFlags,
            scoring,
          })),
          updated_at: now,
        })
        .eq('centre_id', centreId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Form Submitted Successfully!",
        description: "Thank you for completing the STC data collection.",
      });

      queryClient.invalidateQueries({ queryKey: ['stc-data', centreId] });
      
      // Navigate to report after a short delay
      setTimeout(() => {
        navigate(`/infrastructure/stc/${centreId}/report`);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canSubmit = consentAccuracy && 
    respondent.respondent_name && 
    respondent.respondent_mobile && 
    respondent.respondent_email &&
    respondent.respondent_role;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportFormToPDF({
        formData,
        respondent,
        centreName,
        centreId,
        disciplines,
      });
      toast({
        title: "PDF Exported",
        description: "Your STC report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground">
          Review & Submit
        </h2>
        <p className="mt-2 text-muted-foreground">
          Please review your responses before submitting
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Athletes</p>
                <p className="text-2xl font-bold text-foreground">
                  {derivedKPIs.total_existing || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-foreground">
                  {derivedKPIs.overall_utilization_rate ? 
                    `${Math.round(derivedKPIs.overall_utilization_rate * 100)}%` : 
                    'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Dumbbell className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disciplines</p>
                <p className="text-2xl font-bold text-foreground">
                  {disciplines.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Trophy className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {scoring.final_score || 0}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Flags */}
      {(criticalFlags > 0 || warningFlags > 0) && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Data Quality Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dataQualityFlags).map(([key, flag]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  {flag.severity === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{flag.message}</p>
                    {flag.section !== undefined && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => onJumpToSection(flag.section!)}
                      >
                        Jump to fix <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                  <Badge variant={flag.severity === 'error' ? 'destructive' : 'secondary'}>
                    {flag.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Section Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {FORM_SECTIONS.map((section, index) => (
              <button
                key={section.id}
                onClick={() => onJumpToSection(index)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{section.title}</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export to PDF */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Export Report</h3>
              <p className="text-sm text-muted-foreground">
                Download your form data as a PDF document
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent & Submit */}
      <Card className="border-primary/50">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Consent Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consentAccuracy}
                onCheckedChange={(checked) => setConsentAccuracy(checked === true)}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the information provided in this form is accurate to the best of my knowledge.
                I understand that this data will be used for planning and assessment purposes.
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit || submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Form
                </>
              )}
            </Button>

            {!canSubmit && (
              <p className="text-sm text-center text-muted-foreground">
                Please complete all required respondent fields and consent to submit.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
