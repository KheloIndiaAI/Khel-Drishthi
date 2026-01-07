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

// Legacy interface - kept for backward compatibility
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

// ============= NEW HR INTERFACES =============

export interface CoachRoster {
  staff_name: string;
  designation: string;  // High Performance Coach, Senior Coach, Coach, Assistant Coach
  sport_discipline: string;
  employment_nature: string;  // Permanent, Contractual, Deputation
  posted_since_date?: string;
  last_training_course_year?: number;
  course_level_completed?: string;
}

export interface GroundsmanRoster {
  staff_name: string;
  employment_nature: string;  // Permanent, Contractual, Outsourced, Casual
  assigned_fop?: string;  // Which FoP they maintain
}

export interface AdminRoster {
  staff_name: string;
  designation: string;  // LDC, UDC, Assistant, Superintendent
  employment_nature: string;  // Permanent, Contractual, Outsourced, Casual
  posted_since_date?: string;
}

export type AwarenessLevel = 'Fully Aware' | 'Partially Aware' | 'Not Aware' | 'Training Needed';
export type KnowledgeLevel = 'Expert' | 'Proficient' | 'Basic' | 'Needs Training';

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

// ============= NEW INFRASTRUCTURE INTERFACES =============

export type LandOwnershipType = 'Owned by SAI' | 'Lease' | 'Shared';
export type ConditionRating = 'Excellent' | 'Good' | 'Needs Minor Repair' | 'Needs Major Renovation';
export type RenovationStatus = 'Not Required' | 'Planned' | 'Ongoing' | 'Recently Completed';
export type FOPType = 'Indoor' | 'Outdoor';
export type TravelMode = 'By Walk' | 'Hired Vehicle' | 'SAI Vehicle' | 'Public Transport' | 'Other';

export interface LandOwnershipData {
  land_area_acres?: number;
  land_ownership?: LandOwnershipType;
  // MOU fields (only if NOT owned by SAI)
  mou_signed?: boolean;
  mou_tenure_years?: number;
  mou_renewal_year?: number;
  mou_not_signed_reason?: string;
}

export interface DisciplineFOPDetails {
  discipline_code: string;
  discipline_name: string;
  fop_exclusive_to_sai?: boolean;
  
  // If exclusive to SAI
  fop_type?: FOPType;
  fop_construction_year?: number;
  fop_condition?: ConditionRating;
  fop_renovation_status?: RenovationStatus;
  
  // If NOT exclusive
  fop_owned_by?: string;
  fop_distance_km?: number;
  fop_travel_mode?: TravelMode;
  
  // Discipline-specific fields stored as dynamic object
  discipline_specific?: Record<string, unknown>;
}

export interface NonSanctionedFOP {
  id?: string;
  sport_name: string;
  fop_condition?: ConditionRating;
  renovation_status?: RenovationStatus;
  consider_for_sanction: boolean;
  notes?: string;
}

export interface IndoorFacilityDetails {
  has_indoor_facilities?: boolean;
  description?: string;
  area_sqft?: number;
  construction_year?: number;
  condition?: ConditionRating;
  renovation_status?: RenovationStatus;
}

export interface InfrastructureData {
  // NEW: Land & Ownership
  land?: LandOwnershipData;
  
  // NEW: Discipline-wise FOP
  discipline_fops?: DisciplineFOPDetails[];
  
  // NEW: Non-sanctioned FOPs
  has_non_sanctioned_fop?: boolean;
  non_sanctioned_fops?: NonSanctionedFOP[];
  
  // NEW: Warm-up Area
  warmup_area_available?: boolean;
  warmup_area_description?: string;
  
  // NEW: S&C / Gym
  snc_gym_description?: string;
  
  // NEW: Indoor Facilities
  indoor_facilities?: IndoorFacilityDetails;
  
  // NEW: Surplus Land
  surplus_land_available?: boolean;
  surplus_land_acres?: number;
  surplus_land_potential_use?: string;
  
  // NEW: Weather Impact
  weather_impacts_training?: boolean;
  weather_impact_description?: string;

  // Legacy fields for backward compatibility
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

// ============= HOSTEL INTERFACES =============

export type HostelType = 'Rooms' | 'Dormitory' | 'Mixed' | 'Not Available';
export type MessOperator = 'SAI' | 'Outsourced';
export type WaterSupply = 'Municipal' | 'Borewell' | 'Tanker' | 'Mixed';
export type OverallQuality = 'Excellent' | 'Good' | 'Needs Minor Repair' | 'Needs Major Renovation';

export interface RoomTypeBreakup {
  single_bed_count?: number;
  two_bed_count?: number;
  three_bed_count?: number;
  four_bed_count?: number;
  dormitory_count?: number;
}

export interface GenderCapacity {
  male_beds?: number;
  female_beds?: number;
}

export interface NewHostelRequirement {
  new_hostel_needed: boolean;
  land_available_for_new_hostel?: boolean;
  land_area_for_new_hostel_acres?: number;
  beds_needed?: number;
  justification?: string;
}

export interface HostelData {
  // Basic Availability
  hostel_available: boolean;
  residential_arrangement_note?: string;
  
  // Building Details
  hostel_building_year?: number;
  number_of_floors?: number;
  
  // Capacity & Type
  hostel_type?: HostelType;
  hostel_bed_capacity?: number;
  current_hostel_occupancy?: number;
  
  // Gender-wise Capacity
  gender_capacity?: GenderCapacity;
  
  // Room/Dormitory Details
  number_of_rooms?: number;
  number_of_dormitories?: number;
  dormitory_total_beds?: number;
  room_type_breakup?: RoomTypeBreakup;
  
  // Gender Segregation
  hostel_gender_segregation_present?: boolean;
  hostel_gender_segregation_type?: string;
  hostel_gender_segregation_note?: string;
  
  // Amenities
  hostel_amenities?: string[];
  hostel_amenities_other_note?: string;
  water_supply?: WaterSupply;
  water_supply_issue_note?: string;
  power_backup_available?: boolean;
  fire_safety_equipment?: boolean;
  
  // Toilet & Sanitation
  toilet_type?: string;
  functional_toilets_count?: number;
  toilets_sufficient?: boolean;
  toilets_insufficiency_note?: string;
  bathroom_ratio?: number;
  
  // Dining & Mess
  mess_operator?: MessOperator;
  mess_contractor_name?: string;
  dining_seating_capacity?: number;
  dining_area_quality?: OverallQuality;
  
  // Overall Quality
  overall_hostel_quality?: OverallQuality;
  hostel_improvement_needs?: string[];
  improvement_other_note?: string;
  
  // New Hostel Construction Requirement
  new_hostel_requirement?: NewHostelRequirement;
  
  // Legacy fields for backward compatibility
  hostel_type_legacy?: string;
  room_types_available?: string[];
  mess_quality_rating?: number;
  laundry_facility?: boolean;
  recreation_facilities?: boolean;
}

export interface StaffData {
  // ===== COACHING STAFF =====
  coach_count_total: number;
  coach_roster?: CoachRoster[];
  
  // ===== GROUNDSMEN =====
  groundsmen_count_total?: number;
  groundsmen_roster?: GroundsmanRoster[];
  
  // ===== ADMINISTRATIVE STAFF =====
  admin_staff_count_total: number;
  admin_roster?: AdminRoster[];
  
  // ===== AWARENESS & KNOWLEDGE =====
  ams_nsrs_awareness?: AwarenessLevel;
  pocso_posh_awareness?: AwarenessLevel;
  procurement_accounting_knowledge?: KnowledgeLevel;
  
  // ===== SUPPORT STAFF =====
  security_staff_count?: number;
  
  // Legacy fields (kept for backward compatibility)
  coach_count_by_discipline?: Record<string, number>;
  certified_coaches_count?: number;
  foreign_coaches_count?: number;
  coaching_quality_rating?: number;
  staff_training_programs_last_12m?: boolean;
  staff_training_notes?: string;
  maintenance_staff_count?: number;
  legacy_coach_roster?: StaffRoster[];
  legacy_admin_roster?: StaffRoster[];
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
    description: 'Land ownership, field of play specifications, and facility details',
  },
  {
    id: 'hostel',
    title: 'Hostel & Amenities',
    description: 'Residential facilities, capacity, and amenities',
  },
  {
    id: 'staff',
    title: 'Human Resources',
    description: 'Coaching staff, groundsmen, administrative personnel, and support staff',
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
  infrastructure: {
    land: {},
    discipline_fops: [],
    non_sanctioned_fops: [],
    indoor_facilities: {},
  },
  hostel: {
    hostel_available: false,
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
