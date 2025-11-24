// Input validation utilities for construction estimates

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validate project type
export function validateProjectType(projectType: string): ValidationResult {
  const validTypes = ['garage', 'house', 'commercial', 'addition', 'renovation', 'repair'];
  
  if (!projectType) {
    return { valid: false, errors: ['Project type is required'] };
  }
  
  if (!validTypes.includes(projectType.toLowerCase())) {
    return { valid: false, errors: [`Invalid project type. Must be one of: ${validTypes.join(', ')}`] };
  }
  
  return { valid: true, errors: [] };
}

// Validate location
export function validateLocation(location: string): ValidationResult {
  if (!location || location.trim().length === 0) {
    return { valid: false, errors: ['Location is required'] };
  }
  
  if (location.trim().length < 3) {
    return { valid: false, errors: ['Location must be at least 3 characters'] };
  }
  
  return { valid: true, errors: [] };
}

// Validate square footage
export function validateSquareFootage(sqft: string | number): ValidationResult {
  const num = typeof sqft === 'string' ? parseFloat(sqft) : sqft;
  
  if (isNaN(num) || num <= 0) {
    return { valid: false, errors: ['Square footage must be a positive number'] };
  }
  
  if (num < 50) {
    return { valid: false, errors: ['Square footage seems too small. Minimum 50 sq ft'] };
  }
  
  if (num > 100000) {
    return { valid: false, errors: ['Square footage seems too large. Maximum 100,000 sq ft'] };
  }
  
  return { valid: true, errors: [] };
}

// Validate trade selection
export function validateTrade(trade: string): ValidationResult {
  const validTrades = ['electrical', 'plumbing', 'hvac', 'framing', 'roofing', 'foundation', 'drywall', 'flooring', 'painting'];
  
  if (!trade) {
    return { valid: false, errors: ['Trade selection is required'] };
  }
  
  if (!validTrades.includes(trade.toLowerCase())) {
    return { valid: false, errors: [`Invalid trade. Must be one of: ${validTrades.join(', ')}`] };
  }
  
  return { valid: true, errors: [] };
}

// Validate electrical inputs
export function validateElectricalInputs(inputs: {
  panelSize?: string | number;
  circuits?: string | number;
  outlets?: string | number;
  switches?: string | number;
}): ValidationResult {
  const errors: string[] = [];
  
  if (inputs.panelSize) {
    const panel = typeof inputs.panelSize === 'string' ? parseInt(inputs.panelSize) : inputs.panelSize;
    if (isNaN(panel) || panel < 60 || panel > 400) {
      errors.push('Panel size must be between 60 and 400 Amps');
    }
  }
  
  if (inputs.circuits) {
    const circuits = typeof inputs.circuits === 'string' ? parseInt(inputs.circuits) : inputs.circuits;
    if (isNaN(circuits) || circuits < 1 || circuits > 100) {
      errors.push('Number of circuits must be between 1 and 100');
    }
  }
  
  if (inputs.outlets) {
    const outlets = typeof inputs.outlets === 'string' ? parseInt(inputs.outlets) : inputs.outlets;
    if (isNaN(outlets) || outlets < 0 || outlets > 200) {
      errors.push('Number of outlets must be between 0 and 200');
    }
  }
  
  if (inputs.switches) {
    const switches = typeof inputs.switches === 'string' ? parseInt(inputs.switches) : inputs.switches;
    if (isNaN(switches) || switches < 0 || switches > 100) {
      errors.push('Number of switches must be between 0 and 100');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate estimate result for sanity
export function validateEstimate(estimate: {
  totalCost: number;
  trade: string;
  projectType: string;
  squareFootage: number;
}): ValidationResult {
  const errors: string[] = [];
  
  if (estimate.totalCost <= 0) {
    errors.push('Total cost must be greater than zero');
  }
  
  if (estimate.totalCost > 10000000) {
    errors.push('Total cost seems unreasonably high. Please verify inputs.');
  }
  
  // Cost per sq ft sanity check
  const costPerSqft = estimate.totalCost / estimate.squareFootage;
  
  if (estimate.projectType === 'garage') {
    if (costPerSqft > 200) {
      errors.push(`Cost per sq ft ($${costPerSqft.toFixed(2)}) seems high for a garage. Typical range: $20-$150/sq ft`);
    }
    if (costPerSqft < 5) {
      errors.push(`Cost per sq ft ($${costPerSqft.toFixed(2)}) seems low for a garage. Please verify inputs.`);
    }
  } else if (estimate.projectType === 'house') {
    if (costPerSqft > 500) {
      errors.push(`Cost per sq ft ($${costPerSqft.toFixed(2)}) seems high for a house. Typical range: $100-$400/sq ft`);
    }
    if (costPerSqft < 50) {
      errors.push(`Cost per sq ft ($${costPerSqft.toFixed(2)}) seems low for a house. Please verify inputs.`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate province
export function validateProvince(province: string): ValidationResult {
  const validProvinces = [
    'Newfoundland and Labrador', 'Nova Scotia', 'Prince Edward Island', 'New Brunswick',
    'Quebec', 'Ontario', 'Manitoba', 'Saskatchewan', 'Alberta', 'British Columbia',
    'Yukon', 'Northwest Territories', 'Nunavut'
  ];
  
  if (!province || province.trim().length === 0) {
    return { valid: false, errors: ['Province/territory is required'] };
  }
  
  if (!validProvinces.includes(province)) {
    return { valid: false, errors: [`Invalid province. Must be one of: ${validProvinces.join(', ')}`] };
  }
  
  return { valid: true, errors: [] };
}

// Comprehensive form validation
export function validateConstructionForm(data: {
  projectType: string;
  location: string;
  squareFootage: string | number;
  trade: string;
  province?: string;
  [key: string]: any;
}): ValidationResult {
  const errors: string[] = [];
  
  const projectTypeResult = validateProjectType(data.projectType);
  if (!projectTypeResult.valid) errors.push(...projectTypeResult.errors);
  
  const locationResult = validateLocation(data.location);
  if (!locationResult.valid) errors.push(...locationResult.errors);
  
  const sqftResult = validateSquareFootage(data.squareFootage);
  if (!sqftResult.valid) errors.push(...sqftResult.errors);
  
  const tradeResult = validateTrade(data.trade);
  if (!tradeResult.valid) errors.push(...tradeResult.errors);
  
  // Validate province if provided
  if (data.province) {
    const provinceResult = validateProvince(data.province);
    if (!provinceResult.valid) errors.push(...provinceResult.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

