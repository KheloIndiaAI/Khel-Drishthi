// Discipline-specific FOP field configurations
// Each sport_id maps to an array of fields to collect

export type FOPFieldType = 'select' | 'multiselect' | 'number' | 'boolean' | 'text';

export interface FOPFieldConfig {
  key: string;
  label: string;
  type: FOPFieldType;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
}

// Map sport names to their configurations for flexibility
export const DISCIPLINE_FOP_CONFIG: Record<string, FOPFieldConfig[]> = {
  // Athletics with field events
  'Athletics': [
    { key: 'surface', label: 'Track Surface', type: 'select', 
      options: ['Synthetic (IAAF Certified)', 'Cinder', 'Grassy', 'Mud'] },
    { key: 'lanes', label: 'Number of Lanes', type: 'select', 
      options: ['8-Lane', '6-Lane', '4-Lane'] },
    { key: 'long_jump_pits', label: 'Long Jump Pit Count', type: 'number', min: 0 },
    { key: 'high_jump_bed', label: 'High Jump Bed Available', type: 'boolean' },
    { key: 'shot_put_circles', label: 'Shot Put Circle Count', type: 'number', min: 0 },
    { key: 'discus_circles', label: 'Discus Circle Count', type: 'number', min: 0 },
    { key: 'hammer_circles', label: 'Hammer Circle Count', type: 'number', min: 0 },
    { key: 'javelin_runways', label: 'Javelin Runway Count', type: 'number', min: 0 },
  ],
  
  // Hockey
  'Hockey': [
    { key: 'surface', label: 'Turf Surface', type: 'select',
      options: ['Global Elite AstroTurf', 'National Grade Turf', 'Grassy', 'Mud'] },
    { key: 'integrated_sprinklers', label: 'Integrated Sprinklers', type: 'boolean' },
  ],
  
  // Swimming/Aquatics
  'Swimming': [
    { key: 'pool_type', label: 'Pool Type', type: 'select',
      options: ['Olympic (50m)', 'Semi-Olympic (25m)', 'Diving Pool'] },
    { key: 'lanes', label: 'Number of Lanes', type: 'select',
      options: ['6', '8', '10'] },
    { key: 'temperature_controlled', label: 'Temperature Controlled', type: 'boolean' },
  ],
  'Aquatics': [
    { key: 'pool_type', label: 'Pool Type', type: 'select',
      options: ['Olympic (50m)', 'Semi-Olympic (25m)', 'Diving Pool'] },
    { key: 'lanes', label: 'Number of Lanes', type: 'select',
      options: ['6', '8', '10'] },
    { key: 'temperature_controlled', label: 'Temperature Controlled', type: 'boolean' },
  ],
  
  // Badminton
  'Badminton': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 1 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['BWF Synthetic Mat', 'Wooden', 'Cement'] },
    { key: 'clear_height_meters', label: 'Clear Height (meters)', type: 'number', min: 0, unit: 'm' },
  ],
  
  // Gymnastics
  'Gymnastics': [
    { key: 'area_type', label: 'Area Type', type: 'select',
      options: ['Indoor Hall', 'Outdoor'] },
    { key: 'foam_pit', label: 'Foam Pit Available', type: 'boolean' },
    { key: 'apparatus_vault', label: 'Vault Available', type: 'boolean' },
    { key: 'apparatus_bars', label: 'Bars Available', type: 'boolean' },
    { key: 'apparatus_beam', label: 'Beam Available', type: 'boolean' },
    { key: 'apparatus_floor', label: 'Floor Available', type: 'boolean' },
    { key: 'apparatus_pommel_horse', label: 'Pommel Horse Available', type: 'boolean' },
    { key: 'apparatus_rings', label: 'Rings Available', type: 'boolean' },
  ],
  
  // Cycling
  'Cycling': [
    { key: 'type', label: 'Cycling Type', type: 'select',
      options: ['Velodrome (Track)', 'Road Cycling', 'BMX Track'] },
    { key: 'track_surface', label: 'Track Surface', type: 'select',
      options: ['Wooden', 'Concrete', 'Asphalt'] },
  ],
  
  // Archery - Outdoor only (indoor removed as requested)
  'Archery': [
    { key: 'field_type', label: 'Field Type', type: 'select',
      options: ['Outdoor Range'] },
    { key: 'distance_30m', label: '30m Distance Available', type: 'boolean' },
    { key: 'distance_50m', label: '50m Distance Available', type: 'boolean' },
    { key: 'distance_70m', label: '70m Distance Available', type: 'boolean' },
    { key: 'distance_90m', label: '90m Distance Available', type: 'boolean' },
    { key: 'target_butts', label: 'Number of Target Butts', type: 'number', min: 0 },
  ],
  
  // Boxing
  'Boxing': [
    { key: 'ring_count', label: 'Number of Rings', type: 'number', min: 0 },
    { key: 'ring_type', label: 'Ring Type', type: 'select',
      options: ['Elevated', 'Floor Level'] },
  ],
  
  // Weightlifting
  'Weightlifting': [
    { key: 'platform_count', label: 'Number of Training Platforms', type: 'number', min: 0 },
    { key: 'iwf_certified', label: 'IWF Certified Equipment', type: 'boolean' },
  ],
  
  // Combat Sports - Interlocking Mats (updated as requested)
  'Judo': [
    { key: 'mat_type', label: 'Mat Type', type: 'select',
      options: ['Interlocking Mats', 'Wrestling Mat', 'Octagon'] },
    { key: 'mat_area_sqm', label: 'Total Mat Area (sq m)', type: 'number', min: 0, unit: 'sq m' },
    { key: 'mat_count', label: 'Number of Full Mats', type: 'number', min: 0 },
  ],
  'Karate': [
    { key: 'mat_type', label: 'Mat Type', type: 'select',
      options: ['Interlocking Mats', 'Wrestling Mat', 'Octagon'] },
    { key: 'mat_area_sqm', label: 'Total Mat Area (sq m)', type: 'number', min: 0, unit: 'sq m' },
    { key: 'mat_count', label: 'Number of Full Mats', type: 'number', min: 0 },
  ],
  'Taekwondo': [
    { key: 'mat_type', label: 'Mat Type', type: 'select',
      options: ['Interlocking Mats', 'Wrestling Mat', 'Octagon'] },
    { key: 'mat_area_sqm', label: 'Total Mat Area (sq m)', type: 'number', min: 0, unit: 'sq m' },
    { key: 'mat_count', label: 'Number of Full Mats', type: 'number', min: 0 },
  ],
  'Wrestling': [
    { key: 'mat_type', label: 'Mat Type', type: 'select',
      options: ['Interlocking Mats', 'Wrestling Mat', 'Octagon'] },
    { key: 'mat_area_sqm', label: 'Total Mat Area (sq m)', type: 'number', min: 0, unit: 'sq m' },
    { key: 'mat_count', label: 'Number of Full Mats', type: 'number', min: 0 },
  ],
  'Wushu': [
    { key: 'mat_type', label: 'Mat Type', type: 'select',
      options: ['Interlocking Mats', 'Wrestling Mat', 'Octagon'] },
    { key: 'mat_area_sqm', label: 'Total Mat Area (sq m)', type: 'number', min: 0, unit: 'sq m' },
    { key: 'mat_count', label: 'Number of Full Mats', type: 'number', min: 0 },
  ],
  
  // Ball Games
  'Basketball': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['Indoor Wooden', 'Indoor Synthetic', 'Outdoor Concrete', 'Outdoor Asphalt'] },
    { key: 'standard', label: 'Court Standard', type: 'select',
      options: ['Professional', 'Local Grade'] },
  ],
  'Volleyball': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['Indoor Wooden', 'Indoor Synthetic', 'Outdoor Sand', 'Outdoor Concrete'] },
    { key: 'standard', label: 'Court Standard', type: 'select',
      options: ['Professional', 'Local Grade'] },
  ],
  'Handball': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['Indoor Wooden', 'Indoor Synthetic', 'Outdoor Concrete'] },
    { key: 'standard', label: 'Court Standard', type: 'select',
      options: ['Professional', 'Local Grade'] },
  ],
  'Kho-Kho': [
    { key: 'court_count', label: 'Number of Fields', type: 'number', min: 0 },
    { key: 'surface', label: 'Field Surface', type: 'select',
      options: ['Clay', 'Mud', 'Synthetic', 'Grass'] },
  ],
  'Kabaddi': [
    { key: 'mat_count', label: 'Number of Mats/Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Surface Type', type: 'select',
      options: ['Synthetic Mat', 'Clay', 'Mud'] },
  ],
  'Sepaktakraw': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['Indoor Wooden', 'Indoor Synthetic', 'Outdoor Concrete'] },
  ],
  'Softball': [
    { key: 'field_count', label: 'Number of Fields', type: 'number', min: 0 },
    { key: 'surface', label: 'Field Surface', type: 'select',
      options: ['Natural Grass', 'Artificial Turf', 'Clay/Dirt'] },
  ],
  
  // Water Sports
  'Rowing': [
    { key: 'water_body', label: 'Body of Water', type: 'select',
      options: ['Natural Lake', 'Artificial Channel', 'River', 'Reservoir'] },
    { key: 'pontoons', label: 'Number of Embarkation Pontoons', type: 'number', min: 0 },
    { key: 'course_length', label: 'Course Length (m)', type: 'number', min: 0, unit: 'm' },
  ],
  'Kayaking': [
    { key: 'water_body', label: 'Body of Water', type: 'select',
      options: ['Natural Lake', 'Artificial Channel', 'River', 'Reservoir'] },
    { key: 'pontoons', label: 'Number of Embarkation Pontoons', type: 'number', min: 0 },
  ],
  'Canoeing': [
    { key: 'water_body', label: 'Body of Water', type: 'select',
      options: ['Natural Lake', 'Artificial Channel', 'River', 'Reservoir'] },
    { key: 'pontoons', label: 'Number of Embarkation Pontoons', type: 'number', min: 0 },
  ],
  
  // Shooting
  'Shooting': [
    { key: 'range_10m', label: '10m Air Range Available', type: 'boolean' },
    { key: 'range_25m', label: '25m Range Available', type: 'boolean' },
    { key: 'range_50m', label: '50m Range Available', type: 'boolean' },
    { key: 'range_skeet', label: 'Skeet Range Available', type: 'boolean' },
    { key: 'range_trap', label: 'Trap Range Available', type: 'boolean' },
    { key: 'target_type', label: 'Target System', type: 'select',
      options: ['Electronic Scoring (EST)', 'Paper Targets', 'Both'] },
  ],
  
  // Table Tennis
  'Table Tennis': [
    { key: 'table_count', label: 'Number of Tables', type: 'number', min: 0 },
    { key: 'flooring', label: 'Flooring Type', type: 'select',
      options: ['Gerflor/Synthetic Mat', 'Wooden', 'Cement'] },
  ],
  
  // Tennis
  'Tennis': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'surface', label: 'Court Surface', type: 'select',
      options: ['Hard Court', 'Clay', 'Grass', 'Synthetic'] },
    { key: 'floodlights', label: 'Floodlights Available', type: 'boolean' },
  ],
  
  // Football
  'Football': [
    { key: 'pitch_type', label: 'Pitch Type', type: 'select',
      options: ['Natural Grass', 'Artificial Turf', 'Hybrid'] },
    { key: 'pitch_size', label: 'Pitch Size', type: 'select',
      options: ['Full Size', 'Half Size', '7-a-side'] },
    { key: 'goal_posts', label: 'Number of Goal Posts', type: 'number', min: 0 },
    { key: 'floodlights', label: 'Floodlights Available', type: 'boolean' },
  ],
  
  // Fencing
  'Fencing': [
    { key: 'piste_count', label: 'Number of Pistes', type: 'number', min: 0 },
    { key: 'piste_type', label: 'Piste Type', type: 'select',
      options: ['Metallic', 'Non-metallic'] },
    { key: 'scoring_system', label: 'Scoring System', type: 'select',
      options: ['Electronic', 'Manual'] },
  ],
  
  // Lawn Bowls
  'Lawn Bowls': [
    { key: 'green_count', label: 'Number of Greens', type: 'number', min: 0 },
    { key: 'green_type', label: 'Green Type', type: 'select',
      options: ['Natural Grass', 'Synthetic'] },
  ],
  
  // Squash
  'Squash': [
    { key: 'court_count', label: 'Number of Courts', type: 'number', min: 0 },
    { key: 'court_type', label: 'Court Type', type: 'select',
      options: ['Glass Back', 'Solid Back'] },
  ],
};

// Helper function to get config for a discipline
export function getDisciplineFOPConfig(disciplineName: string): FOPFieldConfig[] {
  // Try exact match first
  if (DISCIPLINE_FOP_CONFIG[disciplineName]) {
    return DISCIPLINE_FOP_CONFIG[disciplineName];
  }
  
  // Try partial match (case-insensitive)
  const lowerName = disciplineName.toLowerCase();
  for (const [key, config] of Object.entries(DISCIPLINE_FOP_CONFIG)) {
    if (key.toLowerCase() === lowerName || 
        lowerName.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(lowerName)) {
      return config;
    }
  }
  
  // Return empty array if no match
  return [];
}

// Condition and Renovation options for dropdowns
export const CONDITION_OPTIONS: string[] = [
  'Excellent',
  'Good',
  'Needs Minor Repair',
  'Needs Major Renovation',
];

// UPDATED: Added 'Need to be Planned' option
export const RENOVATION_STATUS_OPTIONS: string[] = [
  'Not Required',
  'Planned',
  'Need to be Planned',
  'Ongoing',
  'Recently Completed',
];

// UPDATED: Changed 'Shared' to 'Other'
export const LAND_OWNERSHIP_OPTIONS: string[] = [
  'Owned by SAI',
  'Lease',
  'Other',
];

export const TRAVEL_MODE_OPTIONS: string[] = [
  'By Walk',
  'Hired Vehicle',
  'SAI Vehicle',
  'Public Transport',
  'Other',
];
