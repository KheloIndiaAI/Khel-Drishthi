// State to Regional Centre (SAI Regional Unit) mapping
// Based on SAI administrative structure for NCOE and STC centres
// KIC and KISCE centres are mapped to regions via their state

// Using exact state names as they appear in the database
export const REGION_TO_STATES: Record<string, string[]> = {
  "RC Bangalore": ["Andhra Pradesh", "Karnataka", "Telangana"],
  "RC Bhopal": ["Chhattisgarh", "Madhya Pradesh"],
  "RC Gandhinagar": ["Goa", "Gujarat", "Rajasthan"],
  "RC Guwahati": ["Arunachal Pradesh", "Assam", "Meghalaya", "Nagaland", "Sikkim"],
  "RC Imphal": ["Manipur", "Mizoram", "Tripura"],
  "RC Kolkata": ["Bihar", "Jharkhand", "Odisha", "West Bengal"],
  "RC LNCPE": ["Kerala", "Lakshadweep", "Puducherry", "Tamil Nadu"],
  "RC Lucknow": ["Uttar Pradesh", "Uttarakhand"],
  "RC Mumbai": ["DNH & DD", "Maharashtra"],
  "RC NIS Patiala": ["Jammu & Kashmir", "Ladakh"],
  "RC New Delhi": ["Andaman & Nicobar", "Delhi"],
  // User requirement: Chandigarh mapped to Zirakpur
  "RC Zirakpur": ["Chandigarh", "Haryana", "Himachal Pradesh", "Punjab"],
};

// Create reverse mapping: state -> region
export const STATE_TO_REGION: Record<string, string> = {};

// Normalize state names for matching
const normalizeStateName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Build the reverse mapping with both original and normalized keys
Object.entries(REGION_TO_STATES).forEach(([region, states]) => {
  states.forEach(state => {
    // Add exact match
    STATE_TO_REGION[state.toLowerCase()] = region;
    // Add normalized match
    STATE_TO_REGION[normalizeStateName(state)] = region;
  });
});

// Additional state name variations for better matching
const STATE_ALIASES: Record<string, string> = {
  // Andaman & Nicobar variations
  "andaman and nicobar islands": "RC New Delhi",
  "andaman & nicobar islands": "RC New Delhi",
  "a&n islands": "RC New Delhi",
  "andaman and nicobar": "RC New Delhi",
  
  // DNH & DD variations
  "dadra and nagar haveli and daman and diu": "RC Mumbai",
  "dadra & nagar haveli and daman & diu": "RC Mumbai",
  "dnh and dd": "RC Mumbai",
  "d&n haveli": "RC Mumbai",
  "dadra and nagar haveli": "RC Mumbai",
  "daman and diu": "RC Mumbai",
  
  // J&K variations
  "jammu and kashmir": "RC NIS Patiala",
  "j&k": "RC NIS Patiala",
  
  // Delhi variations
  "nct delhi": "RC New Delhi",
  "nct of delhi": "RC New Delhi",
  "new delhi": "RC New Delhi",
  
  // Other common variations
  "pondicherry": "RC LNCPE",
  "orissa": "RC Kolkata",
  "uttaranchal": "RC Lucknow",
};

// Add aliases to the mapping
Object.entries(STATE_ALIASES).forEach(([alias, region]) => {
  STATE_TO_REGION[alias.toLowerCase()] = region;
  STATE_TO_REGION[normalizeStateName(alias)] = region;
});

/**
 * Get the regional centre for a given state name
 * @param stateName - The state name to look up
 * @returns The regional centre name or null if not found
 */
export const getRegionForState = (stateName: string | null | undefined): string | null => {
  if (!stateName) return null;
  
  const lowerName = stateName.toLowerCase().trim();
  
  // Direct lowercase lookup
  if (STATE_TO_REGION[lowerName]) {
    return STATE_TO_REGION[lowerName];
  }
  
  // Normalized lookup
  const normalized = normalizeStateName(stateName);
  if (STATE_TO_REGION[normalized]) {
    return STATE_TO_REGION[normalized];
  }
  
  // Partial match for edge cases
  for (const [key, region] of Object.entries(STATE_TO_REGION)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return region;
    }
  }
  
  return null;
};

const REGION_UNIT_ALIASES: Record<string, string> = {
  "head office": "RC New Delhi",
  "sonepat": "RC Zirakpur",
  "nsnis": "RC NIS Patiala",
};

/**
 * Get the regional centre name from a centre's region_unit field.
 * The database stores region_unit like "Kolkata" (no RC prefix).
 */
export const getRegionForRegionUnit = (regionUnit: string | null | undefined): string | null => {
  if (!regionUnit) return null;

  const trimmed = regionUnit.trim();
  const normalized = trimmed.toLowerCase();

  if (REGION_UNIT_ALIASES[normalized]) return REGION_UNIT_ALIASES[normalized];

  // Already in RC format
  if (/^RC\s+/i.test(trimmed)) {
    const rc = trimmed.replace(/^rc\s+/i, "RC ");
    return REGION_TO_STATES[rc] ? rc : null;
  }

  // Convert "Kolkata" -> "RC Kolkata"
  const rc = `RC ${trimmed}`;
  return REGION_TO_STATES[rc] ? rc : null;
};

/**
 * Get all states for a given regional centre
 * @param regionName - The regional centre name
 * @returns Array of state names or empty array if not found
 */
export const getStatesForRegion = (regionName: string): string[] => {
  return REGION_TO_STATES[regionName] || [];
};

/**
 * Get all regional centre names
 * @returns Array of all regional centre names
 */
export const getAllRegions = (): string[] => {
  return Object.keys(REGION_TO_STATES).sort();
};

/**
 * Get region display name (without "RC " prefix)
 */
export const getRegionDisplayName = (regionName: string): string => {
  return regionName.replace(/^RC\s+/, '');
};

// Color mapping for regional centres
export const REGION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "RC Bangalore": { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
  "RC Bhopal": { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-700" },
  "RC Chandigarh": { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  "RC Gandhinagar": { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700" },
  "RC Guwahati": { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-700 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700" },
  "RC Imphal": { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
  "RC Kolkata": { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700" },
  "RC LNCPE": { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-700" },
  "RC Lucknow": { bg: "bg-lime-100 dark:bg-lime-950", text: "text-lime-700 dark:text-lime-300", border: "border-lime-300 dark:border-lime-700" },
  "RC Mumbai": { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700" },
  "RC NIS Patiala": { bg: "bg-pink-100 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300", border: "border-pink-300 dark:border-pink-700" },
  "RC New Delhi": { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-300 dark:border-red-700" },
  "RC Zirakpur": { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-700 dark:text-sky-300", border: "border-sky-300 dark:border-sky-700" },
};
