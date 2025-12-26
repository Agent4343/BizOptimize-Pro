// Comprehensive province and city data for accurate location detection

export interface ProvinceData {
  name: string;
  code: string;
  cities: string[];
  costMultiplier: number; // Cost adjustment factor (1.0 = average, >1.0 = higher cost, <1.0 = lower cost)
}

export const PROVINCE_DATA: Record<string, ProvinceData> = {
  'Newfoundland and Labrador': {
    name: 'Newfoundland and Labrador',
    code: 'NL',
    cities: [
      "st. john's", "st john's", "st. johns", "st johns",
      "corner brook", "grand falls-windsor", "mount pearl",
      "conception bay south", "happy valley-goose bay", "labrador city"
    ],
    costMultiplier: 1.05, // Slightly higher due to remote location
  },
  'Nova Scotia': {
    name: 'Nova Scotia',
    code: 'NS',
    cities: [
      "halifax", "dartmouth", "sydney", "truro", "new glasgow",
      "glace bay", "amherst", "bridgewater", "kentville", "yarmouth"
    ],
    costMultiplier: 0.95, // Slightly lower
  },
  'Prince Edward Island': {
    name: 'Prince Edward Island',
    code: 'PE',
    cities: [
      "charlottetown", "summerside", "stratford", "cornwall",
      "montague", "souris", "alberton", "kensington"
    ],
    costMultiplier: 0.98,
  },
  'New Brunswick': {
    name: 'New Brunswick',
    code: 'NB',
    cities: [
      "moncton", "saint john", "fredericton", "dieppe", "riverview",
      "quispamsis", "miramichi", "edmundston", "campbellton", "bathurst"
    ],
    costMultiplier: 0.97,
  },
  'Quebec': {
    name: 'Quebec',
    code: 'QC',
    cities: [
      "montreal", "quebec city", "laval", "gatineau", "longueuil",
      "sherbrooke", "saguenay", "lévis", "trois-rivières", "terrebonne",
      "saint-jean-sur-richelieu", "repmont", "brossard", "drummondville", "granby"
    ],
    costMultiplier: 1.02,
  },
  'Ontario': {
    name: 'Ontario',
    code: 'ON',
    cities: [
      "toronto", "ottawa", "mississauga", "brampton", "hamilton",
      "london", "markham", "vaughan", "kitchener", "windsor",
      "richmond hill", "oakville", "burlington", "greater sudbury", "oshawa"
    ],
    costMultiplier: 1.10, // Higher cost in major urban centers
  },
  'Manitoba': {
    name: 'Manitoba',
    code: 'MB',
    cities: [
      "winnipeg", "brandon", "steinbach", "thompson", "portage la prairie",
      "winkler", "selkirk", "morden", "dauphin", "flin flon"
    ],
    costMultiplier: 0.96,
  },
  'Saskatchewan': {
    name: 'Saskatchewan',
    code: 'SK',
    cities: [
      "saskatoon", "regina", "prince albert", "moose jaw", "swift current",
      "yorkton", "north battleford", "estevan", "weyburn", "lloydminster"
    ],
    costMultiplier: 0.94,
  },
  'Alberta': {
    name: 'Alberta',
    code: 'AB',
    cities: [
      "calgary", "edmonton", "red deer", "lethbridge", "st. albert",
      "medicine hat", "grande prairie", "airdrie", "spruce grove", "fort mcmurray"
    ],
    costMultiplier: 1.03,
  },
  'British Columbia': {
    name: 'British Columbia',
    code: 'BC',
    cities: [
      "vancouver", "victoria", "surrey", "burnaby", "richmond",
      "abbotsford", "coquitlam", "kelowna", "langley", "saanich",
      "delta", "north vancouver", "kamloops", "nanaimo", "prince george"
    ],
    costMultiplier: 1.15, // Highest cost due to high demand and labor costs
  },
  'Yukon': {
    name: 'Yukon',
    code: 'YT',
    cities: [
      "whitehorse", "dawson city", "watson lake", "haines junction", "mayo"
    ],
    costMultiplier: 1.20, // Much higher due to remote location
  },
  'Northwest Territories': {
    name: 'Northwest Territories',
    code: 'NT',
    cities: [
      "yellowknife", "hay river", "inuvik", "fort smith", "norman wells"
    ],
    costMultiplier: 1.25, // Very high due to extreme remoteness
  },
  'Nunavut': {
    name: 'Nunavut',
    code: 'NU',
    cities: [
      "iqaluit", "rankin inlet", "arviat", "baker lake", "cambridge bay"
    ],
    costMultiplier: 1.30, // Highest due to extreme remoteness and logistics
  },
};

// Enhanced province extraction with city matching
export function extractProvinceEnhanced(location: string): { province: string; costMultiplier: number } {
  const locationLower = location.toLowerCase().trim();

  // First, check for exact province name match (highest priority)
  for (const [provinceName, data] of Object.entries(PROVINCE_DATA)) {
    if (locationLower === provinceName.toLowerCase()) {
      return { province: provinceName, costMultiplier: data.costMultiplier };
    }
  }

  // Second, check for province code with word boundary (e.g., "ON" but not "london")
  for (const [provinceName, data] of Object.entries(PROVINCE_DATA)) {
    // Use word boundary regex to match province codes
    const codePattern = new RegExp(`\\b${data.code}\\b`, 'i');
    if (codePattern.test(location)) {
      return { province: provinceName, costMultiplier: data.costMultiplier };
    }
  }

  // Third, check for city matches (most common case)
  for (const [provinceName, data] of Object.entries(PROVINCE_DATA)) {
    for (const city of data.cities) {
      // Use word boundary for city matching to avoid partial matches
      const cityPattern = new RegExp(`\\b${escapeRegExp(city)}\\b`, 'i');
      if (cityPattern.test(location)) {
        return { province: provinceName, costMultiplier: data.costMultiplier };
      }
    }
  }

  // Fourth, check for province name parts (e.g., "British Columbia" matches "british")
  for (const [provinceName, data] of Object.entries(PROVINCE_DATA)) {
    // Only match significant parts (length > 3) to avoid false positives
    const nameParts = provinceName.toLowerCase().split(' ').filter(part => part.length > 3);
    if (nameParts.some(part => {
      const partPattern = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'i');
      return partPattern.test(location);
    })) {
      return { province: provinceName, costMultiplier: data.costMultiplier };
    }
  }

  // Fallback: return Canada average
  return { province: 'Canada', costMultiplier: 1.0 };
}

// Helper to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get province-specific cost adjustment
export function getProvinceCostMultiplier(province: string): number {
  const data = PROVINCE_DATA[province];
  return data ? data.costMultiplier : 1.0;
}

