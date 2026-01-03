import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConversationalStep, FormQuestion } from './ConversationalStep';
import { ProgressTracker, Section } from './ProgressTracker';
import { SectionTransition } from './SectionTransition';
import { 
  Building2, Users, Dumbbell, Bed, Stethoscope, 
  AlertTriangle, Award, Home 
} from 'lucide-react';
import { toast } from 'sonner';

// Define all sections with their questions
const createSections = (prefilledData: any): { sections: Section[]; questions: FormQuestion[][] } => {
  const sections: Section[] = [
    { id: 'identity', title: 'Centre Identity', icon: <Building2 />, questionCount: 5 },
    { id: 'infrastructure', title: 'Infrastructure', icon: <Home />, questionCount: 6 },
    { id: 'staff', title: 'Staff & Coaches', icon: <Users />, questionCount: 5 },
    { id: 'athletes', title: 'Athletes', icon: <Award />, questionCount: 4 },
    { id: 'equipment', title: 'Equipment', icon: <Dumbbell />, questionCount: 5 },
    { id: 'hostel', title: 'Hostel & Amenities', icon: <Bed />, questionCount: 5 },
    { id: 'medical', title: 'Medical & Support', icon: <Stethoscope />, questionCount: 4 },
    { id: 'challenges', title: 'Challenges & Needs', icon: <AlertTriangle />, questionCount: 3 },
  ];

  const questions: FormQuestion[][] = [
    // Section 1: Centre Identity
    [
      {
        id: 'centre_name_confirm',
        type: 'text',
        question: 'Is the centre name correct?',
        description: 'You can edit if the official name is different.',
        prefilled: true,
        prefilledValue: prefilledData?.centre_name || '',
        placeholder: 'Enter centre name',
        required: true,
      },
      {
        id: 'state_confirm',
        type: 'text',
        question: 'Confirm the state',
        prefilled: true,
        prefilledValue: prefilledData?.state || '',
        placeholder: 'Enter state name',
        required: true,
      },
      {
        id: 'disciplines',
        type: 'multiselect',
        question: 'Confirm the disciplines offered at this centre',
        description: 'Select all that apply. These have been pre-selected from our records.',
        options: [
          'Archery', 'Athletics', 'Badminton', 'Basketball', 'Boxing', 
          'Cricket', 'Cycling', 'Fencing', 'Football', 'Gymnastics',
          'Handball', 'Hockey', 'Judo', 'Kabaddi', 'Kho-Kho',
          'Lawn Tennis', 'Rowing', 'Shooting', 'Swimming', 'Table Tennis',
          'Taekwondo', 'Volleyball', 'Weightlifting', 'Wrestling', 'Yoga'
        ],
        prefilled: true,
        prefilledValue: prefilledData?.disciplines || [],
        required: true,
      },
      {
        id: 'year_established',
        type: 'year',
        question: 'Year of establishment',
        description: 'When was this STC officially established?',
        placeholder: 'e.g., 2015',
      },
      {
        id: 'operational_status',
        type: 'radio',
        question: 'Current operational status',
        options: ['Fully Operational', 'Partially Operational', 'Under Renovation', 'Temporarily Closed'],
        required: true,
      },
    ],
    // Section 2: Infrastructure
    [
      {
        id: 'total_area',
        type: 'text',
        question: 'Total area of the centre (in acres)',
        placeholder: 'e.g., 25 acres',
      },
      {
        id: 'indoor_facilities',
        type: 'multiselect',
        question: 'What indoor facilities are available?',
        options: [
          'Indoor Stadium', 'Gymnasium', 'Swimming Pool (Indoor)', 
          'Badminton Courts', 'Table Tennis Hall', 'Wrestling Hall',
          'Boxing Ring', 'Weightlifting Area', 'Multi-purpose Hall'
        ],
      },
      {
        id: 'outdoor_facilities',
        type: 'multiselect',
        question: 'What outdoor facilities are available?',
        options: [
          'Athletics Track', 'Football Ground', 'Hockey Turf', 
          'Cricket Ground', 'Tennis Courts', 'Basketball Courts',
          'Volleyball Courts', 'Shooting Range', 'Archery Range',
          'Swimming Pool (Outdoor)', 'Cycling Track'
        ],
      },
      {
        id: 'facility_condition',
        type: 'radio',
        question: 'Overall condition of facilities',
        options: ['Excellent', 'Good', 'Fair', 'Needs Improvement', 'Poor'],
        required: true,
      },
      {
        id: 'last_renovation',
        type: 'year',
        question: 'When was the last major renovation?',
        placeholder: 'e.g., 2022',
      },
      {
        id: 'infrastructure_notes',
        type: 'textarea',
        question: 'Any additional notes about infrastructure?',
        placeholder: 'Describe any unique features or current infrastructure projects...',
      },
    ],
    // Section 3: Staff & Coaches
    [
      {
        id: 'total_coaches',
        type: 'number',
        question: 'Total number of coaches',
        placeholder: 'Enter number',
        required: true,
      },
      {
        id: 'certified_coaches',
        type: 'number',
        question: 'Number of nationally/internationally certified coaches',
        placeholder: 'Enter number',
      },
      {
        id: 'support_staff',
        type: 'number',
        question: 'Total support staff (admin, maintenance, etc.)',
        placeholder: 'Enter number',
      },
      {
        id: 'coaching_quality',
        type: 'radio',
        question: 'How would you rate the coaching quality?',
        options: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
      },
      {
        id: 'staff_notes',
        type: 'textarea',
        question: 'Notable achievements of coaching staff',
        placeholder: 'E.g., coaches who trained national/international athletes...',
      },
    ],
    // Section 4: Athletes
    [
      {
        id: 'current_athletes',
        type: 'number',
        question: 'Current number of athletes training at this centre',
        prefilled: true,
        prefilledValue: prefilledData?.existing_athletes || 0,
        required: true,
      },
      {
        id: 'sanctioned_capacity',
        type: 'number',
        question: 'Sanctioned athlete capacity',
        prefilled: true,
        prefilledValue: prefilledData?.sanctioned_capacity || 0,
        required: true,
      },
      {
        id: 'athlete_selection',
        type: 'radio',
        question: 'How are athletes selected for this centre?',
        options: ['State-level Trials', 'District Recommendations', 'National Camps', 'Other'],
      },
      {
        id: 'notable_athletes',
        type: 'textarea',
        question: 'List any notable athletes from this centre',
        placeholder: 'Names of athletes who represented at national/international level...',
      },
    ],
    // Section 5: Equipment
    [
      {
        id: 'equipment_quality',
        type: 'radio',
        question: 'Overall quality of sports equipment',
        options: ['Excellent - International Standard', 'Good - National Standard', 'Average', 'Below Average', 'Poor'],
        required: true,
      },
      {
        id: 'equipment_age',
        type: 'radio',
        question: 'Age of major equipment',
        options: ['Less than 2 years', '2-5 years', '5-10 years', 'More than 10 years'],
      },
      {
        id: 'equipment_needs',
        type: 'multiselect',
        question: 'What equipment upgrades are needed?',
        options: [
          'Training Equipment', 'Competition Equipment', 'Safety Gear',
          'Timing/Scoring Systems', 'Video Analysis Equipment', 'Gym Equipment',
          'Rehabilitation Equipment', 'None - Well Equipped'
        ],
      },
      {
        id: 'last_equipment_purchase',
        type: 'year',
        question: 'When was major equipment last purchased?',
        placeholder: 'e.g., 2023',
      },
      {
        id: 'equipment_notes',
        type: 'textarea',
        question: 'Any specific equipment requirements or concerns?',
        placeholder: 'Describe any urgent equipment needs...',
      },
    ],
    // Section 6: Hostel & Amenities
    [
      {
        id: 'hostel_capacity',
        type: 'number',
        question: 'Total hostel bed capacity',
        prefilled: true,
        prefilledValue: prefilledData?.residential_capacity || 0,
      },
      {
        id: 'current_occupancy',
        type: 'number',
        question: 'Current hostel occupancy',
        placeholder: 'Enter number',
      },
      {
        id: 'hostel_amenities',
        type: 'multiselect',
        question: 'What amenities are available in the hostel?',
        options: [
          'AC Rooms', 'Attached Bathrooms', 'Common Room', 'TV Room',
          'Study Room', 'WiFi', 'Laundry Service', 'Kitchen/Mess',
          '24/7 Security', 'CCTV Surveillance'
        ],
      },
      {
        id: 'food_quality',
        type: 'radio',
        question: 'Quality of food/mess facilities',
        options: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
      },
      {
        id: 'hostel_notes',
        type: 'textarea',
        question: 'Any concerns about hostel facilities?',
        placeholder: 'Describe any issues or improvement needs...',
      },
    ],
    // Section 7: Medical & Support
    [
      {
        id: 'medical_facilities',
        type: 'multiselect',
        question: 'What medical facilities are available?',
        options: [
          'First Aid Room', 'Physiotherapy Room', 'Sports Medicine Doctor',
          'Nutritionist', 'Psychologist', 'Full-time Medical Staff',
          'Tie-up with Hospital', 'Ambulance on Call'
        ],
      },
      {
        id: 'injury_management',
        type: 'radio',
        question: 'How is injury management handled?',
        options: ['In-house Treatment', 'Referral to Hospital', 'Both In-house and Referral', 'Limited Facilities'],
      },
      {
        id: 'diet_monitoring',
        type: 'radio',
        question: 'Is there regular diet/nutrition monitoring?',
        options: ['Yes - Regular Monitoring', 'Occasional', 'No'],
      },
      {
        id: 'medical_notes',
        type: 'textarea',
        question: 'Any medical support concerns or requirements?',
        placeholder: 'Describe any medical support gaps...',
      },
    ],
    // Section 8: Challenges & Needs
    [
      {
        id: 'main_challenges',
        type: 'multiselect',
        question: 'What are the main challenges faced by this centre?',
        options: [
          'Funding/Budget', 'Infrastructure', 'Equipment', 'Coaching Staff',
          'Athlete Retention', 'Administrative Support', 'Transport',
          'Location/Accessibility', 'Weather/Climate', 'None - No Major Issues'
        ],
        required: true,
      },
      {
        id: 'priority_needs',
        type: 'textarea',
        question: 'What are the top 3 priority needs for this centre?',
        placeholder: '1. \n2. \n3. ',
        required: true,
      },
      {
        id: 'additional_comments',
        type: 'textarea',
        question: 'Any additional comments or suggestions?',
        placeholder: 'Share any other relevant information...',
      },
    ],
  ];

  return { sections, questions };
};

interface STCFormContainerProps {
  centreId: string;
}

export const STCFormContainer: React.FC<STCFormContainerProps> = ({ centreId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Fetch STC data
  const { data: stcData, isLoading } = useQuery({
    queryKey: ['stc-capacity', centreId],
    queryFn: async () => {
      // Get basic STC info
      const { data: stcCapacity } = await supabase
        .from('stc_capacity')
        .select('*')
        .eq('centre_id', centreId);

      // Get disciplines for this centre
      const { data: links } = await supabase
        .from('centre_sport_links')
        .select('discipline_name, sport_name')
        .eq('centre_id', centreId);

      // Get existing detailed data if any
      const { data: detailedData } = await supabase
        .from('stc_detailed_data')
        .select('*')
        .eq('centre_id', centreId)
        .single();

      const capacity = stcCapacity?.[0];
      const disciplines = [...new Set(links?.map(l => l.discipline_name || l.sport_name).filter(Boolean))];
      const totalAthletes = stcCapacity?.reduce((sum, c) => sum + (c.ex_grand_total || 0), 0) || 0;
      const sanctionedCapacity = stcCapacity?.reduce((sum, c) => sum + (c.san_grand_total || 0), 0) || 0;
      const residentialCapacity = stcCapacity?.reduce((sum, c) => sum + (c.san_res_total || 0), 0) || 0;

      return {
        centre_id: centreId,
        centre_name: capacity?.centre_name || '',
        state: capacity?.state || '',
        region: capacity?.region || '',
        disciplines,
        existing_athletes: totalAthletes,
        sanctioned_capacity: sanctionedCapacity,
        residential_capacity: residentialCapacity,
        detailedData,
      };
    },
  });

  // Create sections based on prefilled data
  const { sections, questions } = useMemo(() => {
    return createSections(stcData || {});
  }, [stcData]);

  // Calculate totals
  const totalQuestions = questions.flat().length;
  const currentGlobalQuestion = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentSection; i++) {
      count += questions[i].length;
    }
    return count + currentQuestionIndex + 1;
  }, [currentSection, currentQuestionIndex, questions]);

  // Initialize form data with prefilled values
  useEffect(() => {
    if (stcData && Object.keys(formData).length === 0) {
      const initialData: Record<string, any> = {};
      
      // Load from detailed data if exists
      if (stcData.detailedData) {
        const detailed = stcData.detailedData;
        // Merge all section data
        ['centre_identity', 'infrastructure', 'staff_details', 'athlete_details', 
         'equipment_inventory', 'hostel_facilities', 'medical_facilities', 'challenges'].forEach(key => {
          if (detailed[key]) {
            Object.assign(initialData, detailed[key]);
          }
        });
        // Resume from last section
        if (detailed.current_section) {
          setCurrentSection(detailed.current_section - 1);
        }
        setCompletedSections(
          Array.from({ length: detailed.current_section - 1 || 0 }, (_, i) => i)
        );
      }

      // Apply prefilled values for new forms
      questions.flat().forEach(q => {
        if (q.prefilled && q.prefilledValue !== undefined && !initialData[q.id]) {
          initialData[q.id] = q.prefilledValue;
        }
      });

      // Map specific values
      initialData.centre_name_confirm = initialData.centre_name_confirm || stcData.centre_name;
      initialData.state_confirm = initialData.state_confirm || stcData.state;
      initialData.disciplines = initialData.disciplines || stcData.disciplines;
      initialData.current_athletes = initialData.current_athletes || stcData.existing_athletes;
      initialData.sanctioned_capacity = initialData.sanctioned_capacity || stcData.sanctioned_capacity;
      initialData.hostel_capacity = initialData.hostel_capacity || stcData.residential_capacity;

      setFormData(initialData);
    }
  }, [stcData, questions]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { formData: Record<string, any>; complete: boolean }) => {
      const currentQuestion = questions[currentSection][currentQuestionIndex];
      const sectionKeys = ['centre_identity', 'infrastructure', 'staff_details', 'athlete_details',
                          'equipment_inventory', 'hostel_facilities', 'medical_facilities', 'challenges'];

      // Organize data by section
      const organizedData: Record<string, Record<string, any>> = {};
      sectionKeys.forEach((key, idx) => {
        organizedData[key] = {};
        questions[idx].forEach(q => {
          if (data.formData[q.id] !== undefined) {
            organizedData[key][q.id] = data.formData[q.id];
          }
        });
      });

      const progress = data.complete ? 100 : Math.round((currentGlobalQuestion / totalQuestions) * 100);

      const { error } = await supabase
        .from('stc_detailed_data')
        .upsert({
          centre_id: centreId,
          centre_name: stcData?.centre_name,
          state: stcData?.state,
          region: stcData?.region,
          ...organizedData,
          form_progress: progress,
          current_section: currentSection + 1,
          last_section_completed: data.complete ? 'challenges' : sections[currentSection].id,
          submitted_at: data.complete ? new Date().toISOString() : null,
        }, { onConflict: 'centre_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stc-detailed', centreId] });
    },
    onError: (error) => {
      toast.error('Failed to save progress');
      console.error('Save error:', error);
    },
  });

  // Handle value change
  const handleChange = useCallback((value: any) => {
    const currentQuestion = questions[currentSection][currentQuestionIndex];
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  }, [currentSection, currentQuestionIndex, questions]);

  // Handle next
  const handleNext = useCallback(() => {
    // Save progress periodically
    saveMutation.mutate({ formData, complete: false });

    const currentSectionQuestions = questions[currentSection];
    
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      // More questions in current section
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Section complete
      setCompletedSections(prev => [...prev, currentSection]);
      setShowSectionTransition(true);
    }
  }, [currentSection, currentQuestionIndex, questions, formData, saveMutation]);

  // Handle section transition continue
  const handleContinueToNextSection = useCallback(() => {
    setShowSectionTransition(false);
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Form complete - save and redirect to report
      saveMutation.mutate({ formData, complete: true }, {
        onSuccess: () => {
          navigate(`/infrastructure/stc/${centreId}/report`);
        }
      });
    }
  }, [currentSection, sections.length, navigate, centreId, formData, saveMutation]);

  // Handle previous
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCurrentQuestionIndex(questions[currentSection - 1].length - 1);
    }
  }, [currentSection, currentQuestionIndex, questions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading STC data...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentSection]?.[currentQuestionIndex];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <ProgressTracker
        sections={sections}
        currentSection={currentSection}
        currentQuestion={currentGlobalQuestion}
        totalQuestions={totalQuestions}
        completedSections={completedSections}
      />

      <div className="pt-20 pb-12">
        <AnimatePresence mode="wait">
          {showSectionTransition ? (
            <SectionTransition
              key={`transition-${currentSection}`}
              sectionTitle={sections[currentSection].title}
              sectionNumber={currentSection + 1}
              totalSections={sections.length}
              onContinue={handleContinueToNextSection}
              isLastSection={isLastSection}
            />
          ) : currentQuestion ? (
            <ConversationalStep
              key={`question-${currentSection}-${currentQuestionIndex}`}
              question={currentQuestion}
              value={formData[currentQuestion.id]}
              onChange={handleChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={currentSection === 0 && currentQuestionIndex === 0}
              isLast={isLastSection && currentQuestionIndex === questions[currentSection].length - 1}
              questionNumber={currentGlobalQuestion}
              totalQuestions={totalQuestions}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
