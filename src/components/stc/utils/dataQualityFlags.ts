import type { FormData } from "./formConfig";

export interface DataQualityFlag {
  key: string;
  severity: 'warning' | 'error';
  message: string;
  section?: number;
}

export function computeDataQualityFlags(
  formData: FormData, 
  disciplines: string[]
): Record<string, DataQualityFlag> {
  const flags: Record<string, DataQualityFlag> = {};

  // Check for surplus (existing > sanctioned)
  const hasSurplus = formData.disciplines.some(d => {
    const sanctioned = (d.sanctioned_res_boys || 0) + (d.sanctioned_res_girls || 0) + 
                       (d.sanctioned_nonres_boys || 0) + (d.sanctioned_nonres_girls || 0);
    const existing = (d.existing_res_boys || 0) + (d.existing_res_girls || 0) + 
                     (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0);
    return existing > sanctioned;
  });

  if (hasSurplus) {
    flags.existing_gt_sanctioned = {
      key: 'existing_gt_sanctioned',
      severity: 'warning',
      message: 'Some disciplines have more athletes than sanctioned capacity',
      section: 1,
    };
  }

  // Check origin mismatch
  const totalExisting = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0) +
    (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0), 0);
  
  const originTotal = (formData.talent.local_athletes_count || 0) + 
                      (formData.talent.other_state_athletes_count || 0);
  
  if (totalExisting > 0 && originTotal > 0) {
    const mismatchPercent = Math.abs(totalExisting - originTotal) / totalExisting;
    if (mismatchPercent > 0.1) {
      flags.origin_mismatch = {
        key: 'origin_mismatch',
        severity: 'warning',
        message: 'Athlete origin counts don\'t match total existing athletes (>10% difference)',
        section: 7,
      };
    }
  }

  // Check admin roster mismatch
  const adminRosterCount = formData.staff.admin_roster?.length || 0;
  const adminStaffCount = formData.staff.admin_staff_count_total || 0;
  if (adminStaffCount > 0 && adminRosterCount !== adminStaffCount) {
    flags.admin_roster_mismatch = {
      key: 'admin_roster_mismatch',
      severity: 'error',
      message: `Admin staff roster (${adminRosterCount}) doesn't match total count (${adminStaffCount})`,
      section: 4,
    };
  }

  // Check hostel inconsistency
  const totalResAthletes = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0), 0);
  
  if (totalResAthletes > 0 && formData.hostel.hostel_available === false) {
    flags.hostel_residential_inconsistency = {
      key: 'hostel_residential_inconsistency',
      severity: 'warning',
      message: 'Residential athletes exist but no hostel is available',
      section: 3,
    };
  }

  // Check MoU missing
  if (formData.infrastructure.mou_signed === false) {
    flags.mou_missing = {
      key: 'mou_missing',
      severity: 'warning',
      message: 'MoU with facility partner is not signed',
      section: 2,
    };
  }

  // Check facility not available majority
  const facilityNotAvailable = formData.disciplines.filter(d => 
    d.facility_availability_status === 'Not available').length;
  
  if (disciplines.length > 0 && facilityNotAvailable > disciplines.length * 0.5) {
    flags.facility_not_available_majority = {
      key: 'facility_not_available_majority',
      severity: 'error',
      message: 'More than 50% of disciplines have no facility available',
      section: 2,
    };
  }

  // Check FoP not usable majority
  const fopNotUsable = formData.disciplines.filter(d => 
    d.fop_maintenance_status === 'Not usable').length;
  
  if (disciplines.length > 0 && fopNotUsable > disciplines.length * 0.5) {
    flags.fop_not_usable_majority = {
      key: 'fop_not_usable_majority',
      severity: 'error',
      message: 'More than 50% of disciplines have unusable field of play',
      section: 2,
    };
  }

  // Check offsite dependency
  const offsiteCount = formData.disciplines.filter(d => 
    d.facility_availability_status === 'Shared-Offsite').length;
  
  if (disciplines.length > 0 && offsiteCount > disciplines.length * 0.5) {
    flags.offsite_dependency_high = {
      key: 'offsite_dependency_high',
      severity: 'warning',
      message: 'More than 50% of disciplines rely on off-site facilities',
      section: 2,
    };
  }

  // Check hostel gender segregation
  if (formData.hostel.hostel_available === true && 
      formData.hostel.hostel_gender_segregation_present === undefined) {
    flags.hostel_gender_segregation_missing = {
      key: 'hostel_gender_segregation_missing',
      severity: 'warning',
      message: 'Hostel gender segregation status is not specified',
      section: 3,
    };
  }

  return flags;
}
