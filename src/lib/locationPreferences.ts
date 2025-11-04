/**
 * Location Preferences - Single Source of Truth
 * 
 * This constant defines the canonical list of location preference options
 * used across the entire application (Wizard and Profile Editor).
 */

export interface LocationOption {
  value: string;
  label: string;
  description: string;
}

export const LOCATION_PREFERENCES: LocationOption[] = [
  {
    value: 'east-africa',
    label: 'East Africa',
    description: 'Kenya, Uganda, Tanzania, Rwanda, etc.'
  },
  {
    value: 'west-africa',
    label: 'West Africa',
    description: 'Nigeria, Ghana, Senegal, Ivory Coast, etc.'
  },
  {
    value: 'southern-africa',
    label: 'Southern Africa',
    description: 'South Africa, Botswana, Zimbabwe, etc.'
  },
  {
    value: 'north-africa',
    label: 'North Africa',
    description: 'Egypt, Morocco, Tunisia, Algeria, etc.'
  },
  {
    value: 'outside-africa',
    label: 'Outside Africa',
    description: 'Opportunities outside the African continent'
  },
  {
    value: 'global-remote',
    label: 'Global Remote',
    description: 'Remote work from anywhere in the world'
  }
];

// Extract just the values for validation
export const LOCATION_VALUES = LOCATION_PREFERENCES.map(opt => opt.value);
