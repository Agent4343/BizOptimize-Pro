// Province and territory list for dropdowns

export interface ProvinceOption {
  value: string;
  label: string;
  code: string;
}

export const PROVINCES_AND_TERRITORIES: ProvinceOption[] = [
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador', code: 'NL' },
  { value: 'Nova Scotia', label: 'Nova Scotia', code: 'NS' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island', code: 'PE' },
  { value: 'New Brunswick', label: 'New Brunswick', code: 'NB' },
  { value: 'Quebec', label: 'Quebec', code: 'QC' },
  { value: 'Ontario', label: 'Ontario', code: 'ON' },
  { value: 'Manitoba', label: 'Manitoba', code: 'MB' },
  { value: 'Saskatchewan', label: 'Saskatchewan', code: 'SK' },
  { value: 'Alberta', label: 'Alberta', code: 'AB' },
  { value: 'British Columbia', label: 'British Columbia', code: 'BC' },
  { value: 'Yukon', label: 'Yukon', code: 'YT' },
  { value: 'Northwest Territories', label: 'Northwest Territories', code: 'NT' },
  { value: 'Nunavut', label: 'Nunavut', code: 'NU' },
];

// Helper to get province from code
export function getProvinceByCode(code: string): ProvinceOption | undefined {
  return PROVINCES_AND_TERRITORIES.find(p => p.code.toLowerCase() === code.toLowerCase());
}

// Helper to get province from name
export function getProvinceByName(name: string): ProvinceOption | undefined {
  return PROVINCES_AND_TERRITORIES.find(p => 
    p.value.toLowerCase() === name.toLowerCase() || 
    p.label.toLowerCase() === name.toLowerCase()
  );
}

