import type { FormData } from "./formConfig";
import type { DerivedKPIs } from "./derivedMetrics";
import type { DataQualityFlag } from "./dataQualityFlags";

export interface ScoringResult {
  raw_score: number;
  final_score: number;
  sub_scores: {
    infrastructure: number;
    staffing: number;
    equipment: number;
    utilization: number;
    medical: number;
    competitions: number;
  };
  critical_fail_reason?: string;
  decision_flags: {
    upgrade_candidate: boolean;
    good_stc: boolean;
    watchlist: boolean;
    merge_denotify_review: boolean;
  };
}

export function computeScoring(
  formData: FormData,
  kpis: DerivedKPIs,
  flags: Record<string, DataQualityFlag>
): ScoringResult {
  // Sub-score A: Infrastructure (max 20)
  let infrastructureScore = 0;
  if (formData.infrastructure.facility_condition_rating_overall) {
    infrastructureScore += formData.infrastructure.facility_condition_rating_overall * 2; // max 10
  }
  if (formData.infrastructure.floodlights_anywhere_on_campus) {
    infrastructureScore += 3;
  }
  if (formData.infrastructure.mou_signed) {
    infrastructureScore += 4;
  }
  const facilitiesOnsite = formData.disciplines.filter(d => 
    d.facility_availability_status === 'On-site').length;
  infrastructureScore += Math.min(3, facilitiesOnsite);
  infrastructureScore = Math.min(20, infrastructureScore);

  // Sub-score B: Staffing (max 15)
  let staffingScore = 0;
  if (formData.staff.coaching_quality_rating) {
    staffingScore += formData.staff.coaching_quality_rating * 2; // max 10
  }
  if (kpis.coach_athlete_ratio && kpis.coach_athlete_ratio <= 15) {
    staffingScore += 3; // Good ratio
  } else if (kpis.coach_athlete_ratio && kpis.coach_athlete_ratio <= 25) {
    staffingScore += 1;
  }
  if (formData.staff.certified_coaches_count && formData.staff.certified_coaches_count > 0) {
    staffingScore += 2;
  }
  staffingScore = Math.min(15, staffingScore);

  // Sub-score C: Equipment (max 15)
  let equipmentScore = 0;
  if (formData.equipment.overall_equipment_quality_rating) {
    equipmentScore += formData.equipment.overall_equipment_quality_rating * 2; // max 10
  }
  if (formData.equipment.competition_grade_equipment_available) {
    equipmentScore += 3;
  }
  if (formData.equipment.video_analysis_system_available) {
    equipmentScore += 2;
  }
  equipmentScore = Math.min(15, equipmentScore);

  // Sub-score D: Utilization (max 20)
  let utilizationScore = 0;
  if (kpis.overall_utilization_rate !== null) {
    if (kpis.overall_utilization_rate >= 0.8) {
      utilizationScore = 20;
    } else if (kpis.overall_utilization_rate >= 0.6) {
      utilizationScore = 15;
    } else if (kpis.overall_utilization_rate >= 0.4) {
      utilizationScore = 10;
    } else if (kpis.overall_utilization_rate >= 0.2) {
      utilizationScore = 5;
    }
  }

  // Sub-score E: Medical (max 15)
  let medicalScore = 0;
  const medicalFacilities = formData.medical.medical_facilities_available?.length || 0;
  medicalScore += Math.min(5, medicalFacilities);
  if (formData.medical.physiotherapy_room_available) {
    medicalScore += 3;
  }
  if (formData.medical.sports_psychologist_available) {
    medicalScore += 2;
  }
  if (formData.medical.nutritionist_dietitian_available) {
    medicalScore += 2;
  }
  if (formData.medical.hospital_tie_up) {
    medicalScore += 3;
  }
  medicalScore = Math.min(15, medicalScore);

  // Sub-score F: Competitions (max 15)
  let competitionsScore = 0;
  if (kpis.competition_participation_rate !== null) {
    if (kpis.competition_participation_rate >= 0.5) {
      competitionsScore = 10;
    } else if (kpis.competition_participation_rate >= 0.25) {
      competitionsScore = 6;
    } else if (kpis.competition_participation_rate > 0) {
      competitionsScore = 3;
    }
  }
  if (formData.talent.competition_levels?.includes('National')) {
    competitionsScore += 3;
  }
  if (formData.talent.competition_levels?.includes('International')) {
    competitionsScore += 2;
  }
  competitionsScore = Math.min(15, competitionsScore);

  // Calculate raw score
  const raw_score = infrastructureScore + staffingScore + equipmentScore + 
                    utilizationScore + medicalScore + competitionsScore;

  // Apply critical fail overrides
  let final_score = raw_score;
  let critical_fail_reason: string | undefined;

  if (flags.fop_not_usable_majority) {
    final_score = Math.min(final_score, 60);
    critical_fail_reason = 'Majority of FoP not usable';
  }

  if (flags.facility_not_available_majority) {
    final_score = Math.min(final_score, 55);
    critical_fail_reason = 'Majority of facilities not available';
  }

  if (flags.mou_missing && flags.offsite_dependency_high) {
    final_score = Math.min(final_score, 55);
    critical_fail_reason = 'MoU unsigned with high offsite dependency';
  }

  // Decision flags
  const decision_flags = {
    upgrade_candidate: final_score >= 75 && !critical_fail_reason,
    good_stc: final_score >= 60 && final_score < 75,
    watchlist: final_score >= 40 && final_score < 60,
    merge_denotify_review: final_score < 40 || !!critical_fail_reason,
  };

  return {
    raw_score,
    final_score,
    sub_scores: {
      infrastructure: infrastructureScore,
      staffing: staffingScore,
      equipment: equipmentScore,
      utilization: utilizationScore,
      medical: medicalScore,
      competitions: competitionsScore,
    },
    critical_fail_reason,
    decision_flags,
  };
}
