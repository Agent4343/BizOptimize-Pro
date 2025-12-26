// Centralized pricing configuration for construction estimates
// All prices are in CAD (Canadian Dollars)
// Last updated: December 2025

export interface TradePricing {
  // Base costs
  baseCosts: Record<string, number>;
  // Unit costs (per item, per sq ft, etc.)
  unitCosts: Record<string, number>;
  // Overhead and permits
  overheadPercentage: number;
  permitCost: number;
  inspectionCost: number;
  // Garage-specific adjustments
  garagePricing?: {
    permitCost: number;
    inspectionCost: number;
  };
}

// Electrical trade pricing
export const ELECTRICAL_PRICING: TradePricing = {
  baseCosts: {
    panelInstall200A: 2500,
    panelInstall150A: 2000,
    panelInstallUnder150A: 1500,
  },
  unitCosts: {
    circuitCost: 150,
    outletCost: 85,
    switchCost: 65,
    wireCostPerUnit: 25,
  },
  overheadPercentage: 0.20,
  permitCost: 350,
  inspectionCost: 200,
  garagePricing: {
    permitCost: 250,
    inspectionCost: 150,
  },
};

// Plumbing trade pricing
export const PLUMBING_PRICING: TradePricing = {
  baseCosts: {
    waterHeaterTank: 2500,
    waterHeaterTankless: 3500,
    waterHeaterHeatPump: 4500,
  },
  unitCosts: {
    fixtureCost: 450,
    garageFixtureCost: 300,
    pipeCostPerFixture: 180,
    garagePipeCostPerFixture: 120,
    drainCostPerFixture: 120,
    garageDrainCostPerFixture: 80,
  },
  overheadPercentage: 0.20,
  permitCost: 300,
  inspectionCost: 150,
  garagePricing: {
    permitCost: 150,
    inspectionCost: 100,
  },
};

// HVAC trade pricing
export const HVAC_PRICING: TradePricing = {
  baseCosts: {
    forcedAirLarge: 8500,
    forcedAirSmall: 6500,
    garageHeater: 1200,
    ductwork: 3500,
    installationLabor: 2500,
    garageInstallationLabor: 600,
  },
  unitCosts: {},
  overheadPercentage: 0.20,
  permitCost: 400,
  inspectionCost: 200,
  garagePricing: {
    permitCost: 200,
    inspectionCost: 100,
  },
};

// Roofing trade pricing (per sq ft)
export const ROOFING_PRICING: TradePricing = {
  baseCosts: {
    flashing: 800,
  },
  unitCosts: {
    asphaltPerSqft: 4,
    metalPerSqft: 8,
    tilePerSqft: 12,
    slatePerSqft: 15,
    rubberPerSqft: 6,
    laborPerSqft: 3,
    underlaymentPerSqft: 1.5,
  },
  overheadPercentage: 0.20,
  permitCost: 250,
  inspectionCost: 0,
};

// Foundation trade pricing (per sq ft)
export const FOUNDATION_PRICING: TradePricing = {
  baseCosts: {},
  unitCosts: {
    excavationPerSqft: 8,
    slabPerSqft: 20,
    crawlspacePerSqft: 25,
    basementPerSqft: 45,
    rebarPerSqft: 3,
    waterproofingPerSqft: 2,
  },
  overheadPercentage: 0.20,
  permitCost: 500,
  inspectionCost: 200,
};

// Drywall trade pricing (per sq ft)
export const DRYWALL_PRICING: TradePricing = {
  baseCosts: {},
  unitCosts: {
    materialPerSqft: 1.2,
    laborLevel4PerSqft: 2.5,
    laborLevel3PerSqft: 1.5,
    muddingPerSqft: 1.8,
    sandingPerSqft: 0.8,
  },
  overheadPercentage: 0.20,
  permitCost: 0,
  inspectionCost: 0,
};

// Flooring trade pricing (per sq ft)
export const FLOORING_PRICING: TradePricing = {
  baseCosts: {},
  unitCosts: {
    hardwoodPerSqft: 8,
    laminatePerSqft: 3,
    vinylPerSqft: 4,
    tilePerSqft: 6,
    carpetPerSqft: 5,
    concretePerSqft: 2,
    laborPerSqft: 2,
    underlaymentPerSqft: 0.5,
  },
  overheadPercentage: 0.20,
  permitCost: 0,
  inspectionCost: 0,
};

// Painting trade pricing (per sq ft)
export const PAINTING_PRICING: TradePricing = {
  baseCosts: {},
  unitCosts: {
    paintPerSqft: 0.8,
    laborPerCoatPerSqft: 1.2,
    prepPerSqft: 0.5,
  },
  overheadPercentage: 0.20,
  permitCost: 0,
  inspectionCost: 0,
};

// General construction pricing (per sq ft)
export const GENERAL_CONSTRUCTION_PRICING = {
  // Garage pricing
  garage: {
    foundationPerSqft: 8,
    framingPerSqft: 12,
    roofingPerSqft: 6,
    sidingPerSqft: 5,
    electricalPerSqft: 3,
    insulationPerSqft: 2,
    drywallPerSqft: 3,
    flooringPerSqft: 2,
    doorsWindowsPerSqft: 3,
    paintPerSqft: 1,
    permitsPerSqft: 2,
    costPerSqft: 50,
  },
  // House pricing
  house: {
    foundationPerSqft: 15,
    framingPerSqft: 25,
    roofingPerSqft: 12,
    sidingPerSqft: 10,
    electricalPerSqft: 8,
    plumbingPerSqft: 6,
    hvacPerSqft: 8,
    insulationPerSqft: 4,
    drywallPerSqft: 6,
    flooringPerSqft: 8,
    doorsWindowsPerSqft: 10,
    paintPerSqft: 3,
    permitsPerSqft: 2,
    costPerSqft: 200,
  },
  // Commercial pricing
  commercial: {
    costPerSqft: 150,
  },
  // Overhead percentage
  overheadPercentage: 0.15,
  // Potential savings percentage
  savingsPercentage: 0.20,
};

// Timeline estimates (weeks per 1000 sq ft)
export const TIMELINE_ESTIMATES = {
  garage: {
    weeksPer1000Sqft: 2,
    foundationPercent: 0.20,
    framingPercent: 0.35,
    roofingPercent: 0.15,
    mechanicalsPercent: 0.10,
    finishingPercent: 0.25,
    finalInspection: 1,
  },
  house: {
    weeksPer1000Sqft: 3,
    foundationPercent: 0.20,
    framingPercent: 0.35,
    roofingPercent: 0.15,
    mechanicalsPercent: 0.20,
    finishingPercent: 0.25,
    finalInspection: 1,
  },
};

// Savings breakdown percentages
export const SAVINGS_BREAKDOWN = {
  localSourcing: 0.15,      // 15% of total savings
  seasonalTiming: 0.25,     // 25% of total savings
  rebates: 0.10,            // 10% of total savings
  valueEngineering: 0.35,   // 35% of total savings
  ownerSupplied: 0.15,      // 15% of total savings
};

// Get material cost lookup for roofing
export function getRoofingMaterialCost(material: string): number {
  const materialCosts: Record<string, number> = {
    'asphalt': ROOFING_PRICING.unitCosts.asphaltPerSqft,
    'metal': ROOFING_PRICING.unitCosts.metalPerSqft,
    'tile': ROOFING_PRICING.unitCosts.tilePerSqft,
    'slate': ROOFING_PRICING.unitCosts.slatePerSqft,
    'rubber': ROOFING_PRICING.unitCosts.rubberPerSqft,
  };
  return materialCosts[material.toLowerCase()] || ROOFING_PRICING.unitCosts.asphaltPerSqft;
}

// Get material cost lookup for flooring
export function getFlooringMaterialCost(material: string): number {
  const materialCosts: Record<string, number> = {
    'hardwood': FLOORING_PRICING.unitCosts.hardwoodPerSqft,
    'laminate': FLOORING_PRICING.unitCosts.laminatePerSqft,
    'vinyl': FLOORING_PRICING.unitCosts.vinylPerSqft,
    'tile': FLOORING_PRICING.unitCosts.tilePerSqft,
    'carpet': FLOORING_PRICING.unitCosts.carpetPerSqft,
    'concrete': FLOORING_PRICING.unitCosts.concretePerSqft,
  };
  return materialCosts[material.toLowerCase()] || FLOORING_PRICING.unitCosts.laminatePerSqft;
}
