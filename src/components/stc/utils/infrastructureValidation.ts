import type { InfrastructureData, DisciplineStrength } from './formConfig';

export interface InfrastructureValidationError {
  field: string;
  section: string;
  message: string;
}

export function validateInfrastructure(
  data: InfrastructureData, 
  disciplines: DisciplineStrength[]
): InfrastructureValidationError[] {
  const errors: InfrastructureValidationError[] = [];
  
  // ============= 1. LAND & OWNERSHIP VALIDATION =============
  
  if (!data.land?.land_area_acres || data.land.land_area_acres <= 0) {
    errors.push({ 
      field: 'land_area_acres', 
      section: 'land',
      message: 'Land area is required' 
    });
  }
  
  if (!data.land?.land_ownership) {
    errors.push({ 
      field: 'land_ownership', 
      section: 'land',
      message: 'Land ownership type is required' 
    });
  }
  
  // MOU validation (only if not owned by SAI)
  if (data.land?.land_ownership && data.land.land_ownership !== 'Owned by SAI') {
    if (data.land?.mou_signed === undefined || data.land?.mou_signed === null) {
      errors.push({ 
        field: 'mou_signed', 
        section: 'land',
        message: 'MOU signing status is required for leased/shared land' 
      });
    }
    
    if (data.land?.mou_signed === true) {
      if (!data.land?.mou_tenure_years || data.land.mou_tenure_years <= 0) {
        errors.push({ 
          field: 'mou_tenure_years', 
          section: 'land',
          message: 'MOU tenure is required when MOU is signed' 
        });
      }
      if (!data.land?.mou_renewal_year) {
        errors.push({ 
          field: 'mou_renewal_year', 
          section: 'land',
          message: 'MOU renewal year is required when MOU is signed' 
        });
      }
    }
    
    if (data.land?.mou_signed === false) {
      if (!data.land?.mou_not_signed_reason || data.land.mou_not_signed_reason.trim() === '') {
        errors.push({ 
          field: 'mou_not_signed_reason', 
          section: 'land',
          message: 'Reason for not signing MOU is required' 
        });
      }
    }
  }
  
  // ============= 2. DISCIPLINE FOP VALIDATION =============
  
  if (disciplines.length > 0) {
    disciplines.forEach((disc) => {
      const fop = data.discipline_fops?.find(f => f.discipline_code === disc.discipline_code);
      
      if (!fop) {
        errors.push({ 
          field: `fop_${disc.discipline_code}`, 
          section: 'discipline_fops',
          message: `FOP details required for ${disc.discipline_name}` 
        });
        return;
      }
      
      // SAI Exclusivity check
      if (fop.fop_exclusive_to_sai === undefined || fop.fop_exclusive_to_sai === null) {
        errors.push({ 
          field: `fop_exclusive_${disc.discipline_code}`, 
          section: 'discipline_fops',
          message: `SAI exclusivity status required for ${disc.discipline_name}` 
        });
      }
      
      // If exclusive to SAI - require type, condition, renovation status
      if (fop.fop_exclusive_to_sai === true) {
        if (!fop.fop_type) {
          errors.push({ 
            field: `fop_type_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `FOP type (Indoor/Outdoor) required for ${disc.discipline_name}` 
          });
        }
        if (!fop.fop_condition) {
          errors.push({ 
            field: `fop_condition_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `FOP condition required for ${disc.discipline_name}` 
          });
        }
        if (!fop.fop_renovation_status) {
          errors.push({ 
            field: `fop_renovation_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `Renovation status required for ${disc.discipline_name}` 
          });
        }
      }
      
      // If NOT exclusive - require owner, distance, travel mode
      if (fop.fop_exclusive_to_sai === false) {
        if (!fop.fop_owned_by || fop.fop_owned_by.trim() === '') {
          errors.push({ 
            field: `fop_owner_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `FOP owner required for ${disc.discipline_name}` 
          });
        }
        if (fop.fop_distance_km === undefined || fop.fop_distance_km === null) {
          errors.push({ 
            field: `fop_distance_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `Distance from STC required for ${disc.discipline_name}` 
          });
        }
        if (!fop.fop_travel_mode) {
          errors.push({ 
            field: `fop_travel_${disc.discipline_code}`, 
            section: 'discipline_fops',
            message: `Travel mode required for ${disc.discipline_name}` 
          });
        }
      }
    });
  }
  
  // ============= 3. WARM-UP AREA VALIDATION =============
  
  if (data.warmup_area_available === undefined || data.warmup_area_available === null) {
    errors.push({ 
      field: 'warmup_area_available', 
      section: 'general',
      message: 'Warm-up area availability is required' 
    });
  }
  
  // ============= 4. INDOOR FACILITIES VALIDATION =============
  
  if (data.indoor_facilities?.has_indoor_facilities === undefined || 
      data.indoor_facilities?.has_indoor_facilities === null) {
    errors.push({ 
      field: 'has_indoor_facilities', 
      section: 'general',
      message: 'Indoor facilities availability is required' 
    });
  }
  
  // If has indoor facilities, validate conditional fields
  if (data.indoor_facilities?.has_indoor_facilities === true) {
    if (!data.indoor_facilities.condition) {
      errors.push({ 
        field: 'indoor_condition', 
        section: 'general',
        message: 'Indoor facility condition is required' 
      });
    }
    if (!data.indoor_facilities.renovation_status) {
      errors.push({ 
        field: 'indoor_renovation', 
        section: 'general',
        message: 'Indoor facility renovation status is required' 
      });
    }
  }
  
  // ============= 5. NON-SANCTIONED FOP VALIDATION (if applicable) =============
  
  if (data.has_non_sanctioned_fop === true && data.non_sanctioned_fops) {
    data.non_sanctioned_fops.forEach((nsFop, index) => {
      if (!nsFop.sport_name || nsFop.sport_name.trim() === '') {
        errors.push({ 
          field: `ns_fop_sport_${index}`, 
          section: 'non_sanctioned',
          message: `Sport name required for non-sanctioned FOP #${index + 1}` 
        });
      }
      if (!nsFop.fop_condition) {
        errors.push({ 
          field: `ns_fop_condition_${index}`, 
          section: 'non_sanctioned',
          message: `Condition required for non-sanctioned FOP #${index + 1}` 
        });
      }
    });
  }
  
  return errors;
}

// Helper to check if infrastructure section is complete
export function isInfrastructureComplete(
  data: InfrastructureData, 
  disciplines: DisciplineStrength[]
): boolean {
  const errors = validateInfrastructure(data, disciplines);
  return errors.length === 0;
}

// Calculate infrastructure section progress (0-100)
export function calculateInfrastructureProgress(
  data: InfrastructureData, 
  disciplines: DisciplineStrength[]
): number {
  let totalFields = 0;
  let completedFields = 0;
  
  // Land section (4 base fields)
  totalFields += 2; // land_area, land_ownership
  if (data.land?.land_area_acres) completedFields++;
  if (data.land?.land_ownership) completedFields++;
  
  // MOU fields if applicable
  if (data.land?.land_ownership && data.land.land_ownership !== 'Owned by SAI') {
    totalFields += 1; // mou_signed
    if (data.land?.mou_signed !== undefined) completedFields++;
    
    if (data.land?.mou_signed === true) {
      totalFields += 2;
      if (data.land?.mou_tenure_years) completedFields++;
      if (data.land?.mou_renewal_year) completedFields++;
    }
    if (data.land?.mou_signed === false) {
      totalFields += 1;
      if (data.land?.mou_not_signed_reason) completedFields++;
    }
  }
  
  // Discipline FOPs
  disciplines.forEach((disc) => {
    const fop = data.discipline_fops?.find(f => f.discipline_code === disc.discipline_code);
    totalFields += 1; // exclusivity
    if (fop?.fop_exclusive_to_sai !== undefined) completedFields++;
    
    if (fop?.fop_exclusive_to_sai === true) {
      totalFields += 3;
      if (fop?.fop_type) completedFields++;
      if (fop?.fop_condition) completedFields++;
      if (fop?.fop_renovation_status) completedFields++;
    }
    if (fop?.fop_exclusive_to_sai === false) {
      totalFields += 3;
      if (fop?.fop_owned_by) completedFields++;
      if (fop?.fop_distance_km !== undefined) completedFields++;
      if (fop?.fop_travel_mode) completedFields++;
    }
  });
  
  // General facilities
  totalFields += 2;
  if (data.warmup_area_available !== undefined) completedFields++;
  if (data.indoor_facilities?.has_indoor_facilities !== undefined) completedFields++;
  
  if (totalFields === 0) return 0;
  return Math.round((completedFields / totalFields) * 100);
}
