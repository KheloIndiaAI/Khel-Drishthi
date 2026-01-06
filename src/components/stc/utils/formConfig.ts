export interface FormSection {
  id: string;
  title: string;
  description?: string;
}

export interface RespondentData {
  respondent_name: string;
  respondent_mobile: string;
  respondent_email: string;
  respondent_role: string;
  data_confidence_rating: number;
  consent_accuracy: boolean;
  assessment_year: number;
  form_version: number;
}

export interface DisciplineStrength {
  discipline_code: string;
  discipline_name: string;
  sanctioned_res_boys: number;
  sanctioned_res_girls: number;
  sanctioned_nonres_boys: number;
  sanctioned_nonres_girls: number;
  existing_res_boys: number;
  existing_res_girls: number;
  existing_nonres_boys: number;
  existing_nonres_girls: number;
  age_group?: string;
  boarding_capacity_constraint?: boolean;
  sanctioned_zero_note?: string;
  strength_surplus_note?: string;
  // Notes and catchment area
  discipline_note?: string;
  catchment_area?: string;
  // Facility fields
  facility_availability_status?: string;
  facility_partner_name?: string;
  facility_distance_km?: number;
  facility_access_days_per_week?: number;
  facility_constraint_reason?: string[];
  // FoP fields
  fop_primary_type?: string;
  fop_location?: string;
  fop_surface_type?: string;
  fop_count?: number;
  fop_condition_rating?: number;
  fop_maintenance_status?: string;
  floodlights_available_for_this_fop?: boolean;
  spectator_seating_available?: boolean;
  spectator_seating_capacity?: number;
  warmup_area_available?: boolean;
  // Equipment
  equipment_adequacy_status?: string;
}

export interface PreviouslyOperationalDiscipline {
  discipline_name: string;
  years_operational_from?: number;
  years_operational_to?: number;
  was_residential: boolean;
  was_nonresidential: boolean;
  reason_discontinued?: string;
}

export interface StaffRoster {
  staff_name: string;
  staff_designation: string;
  discipline_code?: string;
  division_responsibility?: string[];
  posted_since_date?: string;
  employment_nature: string;
  employment_other?: string;
  dedicated_to_stc?: boolean;
  last_training_course_year?: number;
  course_level?: string;
}

export interface EquipmentGap {
  discipline_code?: string;
  gap_item_name: string;
  gap_qty_required: number;
  gap_priority: string;
}

export interface CompetitionEntry {
  competition_level: string;
  participations_count: number;
  medals_count: number;
  top8_count: number;
}

export interface CoreData {
  // Section 1: Identity
  stc_id: string;
  stc_name: string;
  verify_stc_name: boolean;
  state: string;
  verify_state: boolean;
  rc_name: string;
  verify_rc_name: boolean;
  year_inclusion?: number;
  year_establishment?: number; // Kept for backward compatibility
  operational_status: string;
  abeyance_since_date?: string;
  abeyance_reasons?: string[];
  abeyance_notes?: string;
  // Kept for backward compatibility
  non_operational_since_date?: string;
  non_operational_reasons?: string[];
  non_operational_notes?: string;
  // Centre In Charge (CIC) fields
  cic_name?: string;
  cic_designation?: string;
  cic_posted_since?: string;
  // Geo coordinates
  latitude?: number;
  longitude?: number;
  // Address
  address_line?: string;
  district?: string;
  pincode?: string;
  geo_location?: string; // Kept for backward compatibility
}

export interface InfrastructureData {
  land_area_acres?: number;
  built_up_area_sqft?: number;
  indoor_facilities_available?: string[];
  outdoor_facilities_available?: string[];
  number_of_training_grounds_or_courts?: number;
  floodlights_anywhere_on_campus?: boolean;
  facility_condition_rating_overall?: number;
  last_renovation_year?: number;
  ongoing_planned_projects?: boolean;
  project_notes?: string;
  fop_sharing_status?: string;
  mou_signed?: boolean;
  mou_tenure_years?: number;
  mou_renewal_year?: number;
  mou_pending_reason?: string[];
  mou_expected_date?: string;
}

export interface HostelData {
  hostel_type: string;
  hostel_bed_capacity?: number;
  current_hostel_occupancy?: number;
  room_types_available?: string[];
  hostel_gender_segregation_present?: boolean;
  hostel_gender_segregation_type?: string;
  hostel_gender_segregation_note?: string;
  toilet_type?: string;
  functional_toilets_count?: number;
  hostel_amenities?: string[];
  mess_quality_rating?: number;
  laundry_facility?: boolean;
  recreation_facilities?: boolean;
  hostel_improvement_needs?: string[];
  residential_arrangement_note?: string;
}

export interface StaffData {
  coach_count_total: number;
  coach_count_by_discipline?: Record<string, number>;
  certified_coaches_count?: number;
  foreign_coaches_count?: number;
  coaching_quality_rating?: number;
  staff_training_programs_last_12m?: boolean;
  staff_training_notes?: string;
  coach_roster?: StaffRoster[];
  admin_staff_count_total: number;
  maintenance_staff_count?: number;
  security_staff_count?: number;
  admin_roster?: StaffRoster[];
}

export interface MedicalData {
  medical_facilities_available?: string[];
  full_time_medical_staff_count?: number;
  physiotherapy_room_available?: boolean;
  sports_psychologist_available?: boolean;
  nutritionist_dietitian_available?: boolean;
  hospital_tie_up?: boolean;
  hospital_tieup_details?: string;
  injury_management_protocol_present?: boolean;
}

export interface EquipmentData {
  overall_equipment_quality_rating?: number;
  equipment_age_category?: string;
  equipment_procurement_year?: number;
  training_equipment_condition_rating?: number;
  competition_grade_equipment_available?: boolean;
  video_analysis_system_available?: boolean;
  equipment_adequacy_by_discipline?: Record<string, string>;
  equipment_utilization_understood?: boolean;
  equipment_upgrade_needs?: string[];
  equipment_gaps?: EquipmentGap[];
  snc_setup_level?: string;
  snc_equipment_categories?: string[];
  snc_utilization_understood?: boolean;
}

export interface TalentData {
  local_athletes_count?: number;
  other_state_athletes_count?: number;
  origin_mismatch_note?: string;
  athlete_selection_process?: string;
  trials_publicity_methods?: string[];
  trial_events_last_12m?: number;
  athletes_participated_count?: number;
  competition_levels?: string[];
  competition_matrix?: CompetitionEntry[];
}

export interface AttachmentFile {
  file_id: string;
  url: string;
  file_type: string;
  discipline_code?: string;
  caption?: string;
  uploaded_at: string;
}

export interface FormData {
  core: CoreData;
  disciplines: DisciplineStrength[];
  infrastructure: InfrastructureData;
  hostel: HostelData;
  staff: StaffData;
  medical: MedicalData;
  equipment: EquipmentData;
  talent: TalentData;
  disciplineSpecific: Record<string, Record<string, unknown>>;
  attachments: AttachmentFile[];
  // Section 2 additional fields
  had_previous_disciplines?: boolean;
  previous_disciplines?: PreviouslyOperationalDiscipline[];
  new_discipline_suggestions?: string;
}

export interface PrefillData {
  stc_id: string;
  stc_name: string;
  state: string;
  region: string;
  disciplines: Array<{
    discipline_code: string;
    discipline_name: string;
    san_res_boys: number;
    san_res_girls: number;
    san_nonres_boys: number;
    san_nonres_girls: number;
    ex_res_boys: number;
    ex_res_girls: number;
    ex_nonres_boys: number;
    ex_nonres_girls: number;
  }>;
}

export const FORM_SECTIONS: FormSection[] = [
  {
    id: 'identity',
    title: 'Centre Identity & Status',
    description: 'Basic information about the STC including location and operational status',
  },
  {
    id: 'disciplines',
    title: 'Disciplines & Athlete Strength',
    description: 'Sports disciplines offered and current athlete capacity',
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure & FoP',
    description: 'Facilities, field of play specifications, and maintenance status',
  },
  {
    id: 'hostel',
    title: 'Hostel & Amenities',
    description: 'Residential facilities, capacity, and amenities',
  },
  {
    id: 'staff',
    title: 'Coaches & Staff',
    description: 'Coaching staff and administrative personnel details',
  },
  {
    id: 'medical',
    title: 'Medical & Support Services',
    description: 'Healthcare facilities and support services available',
  },
  {
    id: 'equipment',
    title: 'Equipment & S&C',
    description: 'Training equipment inventory and strength & conditioning setup',
  },
  {
    id: 'talent',
    title: 'Talent ID & Competitions',
    description: 'Athlete selection process and competition participation',
  },
  {
    id: 'discipline-specific',
    title: 'Discipline-Specific Questions',
    description: 'Additional questions specific to each discipline offered',
  },
  {
    id: 'attachments',
    title: 'Attachments',
    description: 'Upload facility photos and supporting documents (optional)',
  },
];

export const getDefaultFormData = (): FormData => ({
  core: {
    stc_id: '',
    stc_name: '',
    verify_stc_name: false,
    state: '',
    verify_state: false,
    rc_name: '',
    verify_rc_name: false,
    operational_status: 'Operational',
  },
  disciplines: [],
  infrastructure: {},
  hostel: {
    hostel_type: '',
  },
  staff: {
    coach_count_total: 0,
    admin_staff_count_total: 0,
  },
  medical: {},
  equipment: {},
  talent: {},
  disciplineSpecific: {},
  attachments: [],
});

export const getDefaultRespondent = (): RespondentData => ({
  respondent_name: '',
  respondent_mobile: '',
  respondent_email: '',
  respondent_role: '',
  data_confidence_rating: 3,
  consent_accuracy: false,
  assessment_year: new Date().getFullYear(),
  form_version: 4,
});
