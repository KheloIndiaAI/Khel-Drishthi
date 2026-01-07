import type { HostelData, RoomTypeBreakup } from './formConfig';

export interface ValidationError {
  field: string;
  message: string;
}

export const HOSTEL_TYPES = ['Rooms', 'Dormitory', 'Mixed'] as const;

export const HOSTEL_AMENITIES = [
  "WiFi",
  "Study Room",
  "AC",
  "TV",
  "Recreation Room",
  "CCTV",
  "Laundry",
  "Power Backup",
  "Other"
] as const;

export const IMPROVEMENT_NEEDS = [
  "Ventilation",
  "AC Installation",
  "Furniture",
  "More Rooms",
  "Minor Renovation",
  "Major Renovation",
  "Safety Upgrades",
  "Other"
] as const;

export const QUALITY_OPTIONS = [
  "Excellent",
  "Good",
  "Needs Minor Repair",
  "Needs Major Renovation"
] as const;

export const WATER_SUPPLY_OPTIONS = ['Municipal', 'Borewell', 'Tanker', 'Mixed'] as const;

export const TOILET_TYPES = ['Common', 'Individual', 'Mixed'] as const;

export const SEGREGATION_TYPES = [
  'Separate buildings',
  'Same building separate wings-floors',
  'Controlled shared common areas',
  'Other'
] as const;

/**
 * Calculate total beds from room type breakup
 */
export function calculateRoomBeds(breakup?: RoomTypeBreakup): number {
  if (!breakup) return 0;
  return (
    (breakup.single_bed_count || 0) * 1 +
    (breakup.two_bed_count || 0) * 2 +
    (breakup.three_bed_count || 0) * 3 +
    (breakup.four_bed_count || 0) * 4
  );
}

/**
 * Calculate total room count from breakup
 */
export function calculateTotalRooms(breakup?: RoomTypeBreakup): number {
  if (!breakup) return 0;
  return (
    (breakup.single_bed_count || 0) +
    (breakup.two_bed_count || 0) +
    (breakup.three_bed_count || 0) +
    (breakup.four_bed_count || 0)
  );
}

/**
 * Validate hostel data and return errors
 */
export function validateHostelData(
  hostel: HostelData,
  hasResidentialAthletes: boolean = false
): ValidationError[] {
  const errors: ValidationError[] = [];

  // hostel_available is always required
  if (hostel.hostel_available === undefined) {
    errors.push({ field: 'hostel_available', message: 'Please indicate if hostel is available' });
  }

  // If no hostel but has residential athletes, need explanation
  if (hostel.hostel_available === false && hasResidentialAthletes) {
    if (!hostel.residential_arrangement_note?.trim()) {
      errors.push({ 
        field: 'residential_arrangement_note', 
        message: 'Please explain residential arrangement for athletes' 
      });
    }
  }

  // Rest of validation only applies if hostel is available
  if (hostel.hostel_available !== true) {
    return errors;
  }

  // Hostel type required
  if (!hostel.hostel_type) {
    errors.push({ field: 'hostel_type', message: 'Hostel type is required' });
  }

  // Bed capacity required and must be > 0
  if (!hostel.hostel_bed_capacity || hostel.hostel_bed_capacity <= 0) {
    errors.push({ field: 'hostel_bed_capacity', message: 'Bed capacity must be greater than 0' });
  }

  // Occupancy required
  if (hostel.current_hostel_occupancy === undefined) {
    errors.push({ field: 'current_hostel_occupancy', message: 'Current occupancy is required' });
  }

  // Occupancy cannot exceed capacity
  if (
    hostel.current_hostel_occupancy !== undefined &&
    hostel.hostel_bed_capacity !== undefined &&
    hostel.current_hostel_occupancy > hostel.hostel_bed_capacity
  ) {
    errors.push({ 
      field: 'occupancy_exceeds', 
      message: `Current occupancy (${hostel.current_hostel_occupancy}) cannot exceed bed capacity (${hostel.hostel_bed_capacity})` 
    });
  }

  // Building year validation
  if (hostel.hostel_building_year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (hostel.hostel_building_year < 1900 || hostel.hostel_building_year > currentYear) {
      errors.push({ 
        field: 'hostel_building_year', 
        message: `Building year must be between 1900 and ${currentYear}` 
      });
    }
  }

  // Gender capacity validation
  if (hostel.gender_capacity && hostel.hostel_bed_capacity) {
    const genderTotal = (hostel.gender_capacity.male_beds || 0) + (hostel.gender_capacity.female_beds || 0);
    if (genderTotal !== hostel.hostel_bed_capacity) {
      errors.push({ 
        field: 'gender_capacity_mismatch', 
        message: `Gender-wise beds (${genderTotal}) must equal total capacity (${hostel.hostel_bed_capacity})` 
      });
    }
  }

  // Room details validation for Rooms or Mixed type
  if (hostel.hostel_type === 'Rooms' || hostel.hostel_type === 'Mixed') {
    if (!hostel.number_of_rooms || hostel.number_of_rooms <= 0) {
      errors.push({ field: 'number_of_rooms', message: 'Number of rooms is required for this hostel type' });
    }

    // Room type breakup must match total rooms
    if (hostel.number_of_rooms && hostel.room_type_breakup) {
      const totalRooms = calculateTotalRooms(hostel.room_type_breakup);
      if (totalRooms !== hostel.number_of_rooms) {
        errors.push({ 
          field: 'room_type_mismatch', 
          message: `Room type breakup (${totalRooms}) must equal total rooms (${hostel.number_of_rooms})` 
        });
      }
    }
  }

  // Dormitory details validation
  if (hostel.hostel_type === 'Dormitory' || hostel.hostel_type === 'Mixed') {
    if (!hostel.number_of_dormitories || hostel.number_of_dormitories <= 0) {
      errors.push({ field: 'number_of_dormitories', message: 'Number of dormitories is required for this hostel type' });
    }
  }

  // Calculated beds validation
  if (hostel.hostel_bed_capacity) {
    const roomBeds = calculateRoomBeds(hostel.room_type_breakup);
    const dormBeds = hostel.dormitory_total_beds || 0;
    const totalCalculatedBeds = roomBeds + dormBeds;
    
    if (totalCalculatedBeds > hostel.hostel_bed_capacity) {
      errors.push({ 
        field: 'capacity_mismatch', 
        message: `Calculated beds (${totalCalculatedBeds}) exceed total capacity (${hostel.hostel_bed_capacity})` 
      });
    }
  }

  // Toilet sufficiency note required if not sufficient
  if (hostel.toilets_sufficient === false && !hostel.toilets_insufficiency_note?.trim()) {
    errors.push({ 
      field: 'toilets_insufficiency_note', 
      message: 'Please explain what toilet improvements are needed' 
    });
  }

  // Mess contractor name required if outsourced
  if (hostel.mess_operator === 'Outsourced' && !hostel.mess_contractor_name?.trim()) {
    errors.push({ 
      field: 'mess_contractor_name', 
      message: 'Contractor name is required for outsourced mess' 
    });
  }

  // Other amenity note required if Other is selected
  if (hostel.hostel_amenities?.includes('Other') && !hostel.hostel_amenities_other_note?.trim()) {
    errors.push({ 
      field: 'hostel_amenities_other_note', 
      message: 'Please specify other amenities' 
    });
  }

  // Other improvement note required if Other is selected
  if (hostel.hostel_improvement_needs?.includes('Other') && !hostel.improvement_other_note?.trim()) {
    errors.push({ 
      field: 'improvement_other_note', 
      message: 'Please specify other improvements needed' 
    });
  }

  // New hostel requirement validation
  if (hostel.new_hostel_requirement?.new_hostel_needed) {
    if (!hostel.new_hostel_requirement.beds_needed || hostel.new_hostel_requirement.beds_needed <= 0) {
      errors.push({ 
        field: 'new_hostel_beds_needed', 
        message: 'Number of beds needed is required' 
      });
    }
    if (!hostel.new_hostel_requirement.justification?.trim()) {
      errors.push({ 
        field: 'new_hostel_justification', 
        message: 'Justification for new hostel is required' 
      });
    }
  }

  // Overall quality required
  if (!hostel.overall_hostel_quality) {
    errors.push({ field: 'overall_hostel_quality', message: 'Overall hostel quality rating is required' });
  }

  return errors;
}

/**
 * Check if hostel section is complete enough for submission
 */
export function isHostelSectionComplete(hostel: HostelData, hasResidentialAthletes: boolean): boolean {
  const errors = validateHostelData(hostel, hasResidentialAthletes);
  return errors.length === 0;
}

/**
 * Get hostel utilization percentage
 */
export function getHostelUtilization(hostel: HostelData): number | null {
  if (!hostel.hostel_bed_capacity || hostel.current_hostel_occupancy === undefined) {
    return null;
  }
  return Math.round((hostel.current_hostel_occupancy / hostel.hostel_bed_capacity) * 100);
}
