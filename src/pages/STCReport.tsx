import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageSEO } from '@/components/seo/PageSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Building2, MapPin, Users, Award, Dumbbell, 
  Bed, Stethoscope, AlertTriangle, Download, Share2, 
  CheckCircle2, Calendar, User, Home, Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STCReport: React.FC = () => {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();

  // Fetch detailed STC data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['stc-report', centreId],
    queryFn: async () => {
      // Get detailed data
      const { data: detailed } = await supabase
        .from('stc_detailed_data')
        .select('*')
        .eq('centre_id', centreId)
        .single();

      // Get capacity data
      const { data: capacity } = await supabase
        .from('stc_capacity')
        .select('*')
        .eq('centre_id', centreId);

      // Get disciplines
      const { data: links } = await supabase
        .from('centre_sport_links')
        .select('discipline_name, sport_name')
        .eq('centre_id', centreId);

      const disciplines = [...new Set(links?.map(l => l.discipline_name || l.sport_name).filter(Boolean))];
      const totalAthletes = capacity?.reduce((sum, c) => sum + (c.ex_grand_total || 0), 0) || 0;
      const sanctionedCapacity = capacity?.reduce((sum, c) => sum + (c.san_grand_total || 0), 0) || 0;

      return {
        detailed,
        capacity,
        disciplines,
        totalAthletes,
        sanctionedCapacity,
      };
    },
    enabled: !!centreId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData?.detailed) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Report Not Available</h2>
          <p className="text-muted-foreground mb-6">
            The data collection form for this STC has not been completed yet.
          </p>
          <Button onClick={() => navigate(`/infrastructure/stc/${centreId}/form`)}>
            Complete the Form
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { detailed, disciplines, totalAthletes, sanctionedCapacity } = reportData;
  const identity = (detailed.centre_identity as Record<string, any>) || {};
  const infrastructure = (detailed.infrastructure as Record<string, any>) || {};
  const staff = (detailed.staff_details as Record<string, any>) || {};
  const athletes = (detailed.athlete_details as Record<string, any>) || {};
  const equipment = (detailed.equipment_inventory as Record<string, any>) || {};
  const hostel = (detailed.hostel_facilities as Record<string, any>) || {};
  const medical = (detailed.medical_facilities as Record<string, any>) || {};
  const challenges = (detailed.challenges as Record<string, any>) || {};

  const capacityUtilization = sanctionedCapacity > 0 
    ? Math.round((totalAthletes / sanctionedCapacity) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <PageSEO
        title={`${detailed.centre_name} Report | SAI STC`}
        description={`Comprehensive report for ${detailed.centre_name}, ${detailed.state}`}
      />

      <div className="container mx-auto py-6 space-y-8 print:py-2">
        {/* Header Actions - Hide on print */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => navigate('/infrastructure/stc')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to STC List
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-2xl p-8 print:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Badge className="mb-2 bg-primary text-primary-foreground">
                SAI Sports Training Centre
              </Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {detailed.centre_name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{detailed.state}</span>
                {detailed.region && (
                  <>
                    <span className="text-border">•</span>
                    <span>{detailed.region}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-primary">{detailed.form_progress}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              {detailed.submitted_at && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Submitted</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(detailed.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{totalAthletes}</p>
              <p className="text-sm text-muted-foreground">Current Athletes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{disciplines.length}</p>
              <p className="text-sm text-muted-foreground">Disciplines</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{staff.total_coaches || '-'}</p>
              <p className="text-sm text-muted-foreground">Coaches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="relative mx-auto w-16 h-16 mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${capacityUtilization * 1.76} 176`}
                    className="text-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {capacityUtilization}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Capacity Utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Disciplines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Disciplines Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(identity.disciplines || disciplines).map((d: string) => (
                <Badge key={d} variant="secondary" className="text-sm">
                  {d}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout for Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {infrastructure.total_area && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Area</span>
                  <span className="font-medium">{infrastructure.total_area}</span>
                </div>
              )}
              {infrastructure.facility_condition && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <Badge variant={
                    infrastructure.facility_condition === 'Excellent' ? 'default' :
                    infrastructure.facility_condition === 'Good' ? 'secondary' : 'outline'
                  }>
                    {infrastructure.facility_condition}
                  </Badge>
                </div>
              )}
              {infrastructure.indoor_facilities?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Indoor Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {infrastructure.indoor_facilities.map((f: string) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.outdoor_facilities?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Outdoor Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {infrastructure.outdoor_facilities.map((f: string) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff & Coaching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Staff & Coaching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-display font-bold">{staff.total_coaches || '-'}</p>
                  <p className="text-sm text-muted-foreground">Total Coaches</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{staff.certified_coaches || '-'}</p>
                  <p className="text-sm text-muted-foreground">Certified</p>
                </div>
              </div>
              {staff.coaching_quality && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coaching Quality</span>
                  <Badge variant="secondary">{staff.coaching_quality}</Badge>
                </div>
              )}
              {staff.support_staff && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support Staff</span>
                  <span className="font-medium">{staff.support_staff}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hostel & Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Hostel & Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-display font-bold">{hostel.hostel_capacity || '-'}</p>
                  <p className="text-sm text-muted-foreground">Bed Capacity</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{hostel.current_occupancy || '-'}</p>
                  <p className="text-sm text-muted-foreground">Current Occupancy</p>
                </div>
              </div>
              {hostel.hostel_amenities?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {hostel.hostel_amenities.map((a: string) => (
                      <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {hostel.food_quality && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Food Quality</span>
                  <Badge variant="secondary">{hostel.food_quality}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Medical & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medical.medical_facilities?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Available Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {medical.medical_facilities.map((f: string) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {medical.injury_management && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Injury Management</span>
                  <span className="font-medium text-sm">{medical.injury_management}</span>
                </div>
              )}
              {medical.diet_monitoring && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diet Monitoring</span>
                  <Badge variant={medical.diet_monitoring.includes('Yes') ? 'default' : 'secondary'}>
                    {medical.diet_monitoring}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Equipment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            {equipment.equipment_quality && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quality</p>
                <Badge variant="secondary" className="text-sm">{equipment.equipment_quality}</Badge>
              </div>
            )}
            {equipment.equipment_age && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Equipment Age</p>
                <span className="font-medium">{equipment.equipment_age}</span>
              </div>
            )}
            {equipment.last_equipment_purchase && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Purchase</p>
                <span className="font-medium">{equipment.last_equipment_purchase}</span>
              </div>
            )}
            {equipment.equipment_needs?.length > 0 && (
              <div className="md:col-span-3">
                <p className="text-sm text-muted-foreground mb-2">Upgrade Needs</p>
                <div className="flex flex-wrap gap-2">
                  {equipment.equipment_needs.map((n: string) => (
                    <Badge key={n} variant="outline">{n}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Challenges & Needs */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Challenges & Priority Needs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.main_challenges?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Main Challenges</p>
                <div className="flex flex-wrap gap-2">
                  {challenges.main_challenges.map((c: string) => (
                    <Badge key={c} variant="destructive" className="bg-destructive/10 text-destructive">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {challenges.priority_needs && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority Needs</p>
                <p className="whitespace-pre-line text-foreground">{challenges.priority_needs}</p>
              </div>
            )}
            {challenges.additional_comments && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Additional Comments</p>
                <p className="text-foreground">{challenges.additional_comments}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-6 print:py-2">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">SAI Sports Training Centre Data Collection System</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default STCReport;
