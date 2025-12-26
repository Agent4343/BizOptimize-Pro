// Contractor pricing data for Canadian construction estimates
// Prices in CAD - Updated December 2024
// These are typical contractor costs (not retail) from major suppliers

export interface PartPrice {
  name: string;
  unit: string;
  costLow: number;    // Budget/economy
  costMid: number;    // Standard
  costHigh: number;   // Premium
  laborMinutes: number; // Time to install
}

export interface LaborRate {
  trade: string;
  hourlyLow: number;
  hourlyMid: number;
  hourlyHigh: number;
}

// Labor rates by trade (CAD per hour)
export const LABOR_RATES: Record<string, LaborRate> = {
  electrical: { trade: 'Electrical', hourlyLow: 75, hourlyMid: 95, hourlyHigh: 125 },
  plumbing: { trade: 'Plumbing', hourlyLow: 80, hourlyMid: 100, hourlyHigh: 130 },
  hvac: { trade: 'HVAC', hourlyLow: 85, hourlyMid: 105, hourlyHigh: 135 },
  framing: { trade: 'Framing', hourlyLow: 55, hourlyMid: 70, hourlyHigh: 90 },
  roofing: { trade: 'Roofing', hourlyLow: 60, hourlyMid: 75, hourlyHigh: 95 },
  foundation: { trade: 'Foundation', hourlyLow: 65, hourlyMid: 80, hourlyHigh: 100 },
  drywall: { trade: 'Drywall', hourlyLow: 50, hourlyMid: 65, hourlyHigh: 85 },
  flooring: { trade: 'Flooring', hourlyLow: 55, hourlyMid: 70, hourlyHigh: 90 },
  painting: { trade: 'Painting', hourlyLow: 45, hourlyMid: 60, hourlyHigh: 80 },
};

// ==========================================
// ELECTRICAL PARTS PRICING
// ==========================================
export const ELECTRICAL_PARTS: Record<string, PartPrice> = {
  // Panels & Breakers
  'panel_100a': { name: '100A Main Panel', unit: 'each', costLow: 180, costMid: 280, costHigh: 450, laborMinutes: 180 },
  'panel_200a': { name: '200A Main Panel', unit: 'each', costLow: 350, costMid: 550, costHigh: 850, laborMinutes: 240 },
  'subpanel_60a': { name: '60A Subpanel', unit: 'each', costLow: 120, costMid: 180, costHigh: 280, laborMinutes: 120 },
  'subpanel_100a': { name: '100A Subpanel', unit: 'each', costLow: 180, costMid: 280, costHigh: 420, laborMinutes: 150 },
  'breaker_15a': { name: '15A Breaker', unit: 'each', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 10 },
  'breaker_20a': { name: '20A Breaker', unit: 'each', costLow: 9, costMid: 14, costHigh: 20, laborMinutes: 10 },
  'breaker_30a_2pole': { name: '30A 2-Pole Breaker', unit: 'each', costLow: 18, costMid: 28, costHigh: 45, laborMinutes: 15 },
  'breaker_50a_2pole': { name: '50A 2-Pole Breaker', unit: 'each', costLow: 25, costMid: 40, costHigh: 65, laborMinutes: 15 },
  'breaker_afci': { name: 'AFCI Breaker', unit: 'each', costLow: 45, costMid: 55, costHigh: 75, laborMinutes: 15 },
  'breaker_gfci': { name: 'GFCI Breaker', unit: 'each', costLow: 40, costMid: 50, costHigh: 70, laborMinutes: 15 },

  // Wire & Cable
  'wire_14_2_nm': { name: '14/2 NM-B Wire', unit: 'per 75m', costLow: 85, costMid: 110, costHigh: 140, laborMinutes: 0 },
  'wire_12_2_nm': { name: '12/2 NM-B Wire', unit: 'per 75m', costLow: 120, costMid: 155, costHigh: 195, laborMinutes: 0 },
  'wire_10_3_nm': { name: '10/3 NM-B Wire', unit: 'per 30m', costLow: 110, costMid: 145, costHigh: 185, laborMinutes: 0 },
  'wire_6_3_nm': { name: '6/3 NM-B Wire', unit: 'per 30m', costLow: 180, costMid: 240, costHigh: 320, laborMinutes: 0 },
  'wire_8_3_uf': { name: '8/3 UF-B Underground', unit: 'per 30m', costLow: 220, costMid: 290, costHigh: 380, laborMinutes: 0 },
  'conduit_emt_3/4': { name: '3/4" EMT Conduit', unit: 'per 3m', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 20 },
  'conduit_pvc_3/4': { name: '3/4" PVC Conduit', unit: 'per 3m', costLow: 5, costMid: 8, costHigh: 12, laborMinutes: 15 },

  // Outlets & Switches
  'outlet_std': { name: 'Standard Outlet', unit: 'each', costLow: 2, costMid: 4, costHigh: 8, laborMinutes: 20 },
  'outlet_gfci': { name: 'GFCI Outlet', unit: 'each', costLow: 18, costMid: 25, costHigh: 40, laborMinutes: 25 },
  'outlet_usb': { name: 'USB Outlet', unit: 'each', costLow: 22, costMid: 32, costHigh: 55, laborMinutes: 20 },
  'outlet_240v_30a': { name: '240V 30A Outlet (Dryer)', unit: 'each', costLow: 12, costMid: 20, costHigh: 35, laborMinutes: 30 },
  'outlet_240v_50a': { name: '240V 50A Outlet (Range)', unit: 'each', costLow: 18, costMid: 30, costHigh: 50, laborMinutes: 35 },
  'switch_std': { name: 'Standard Switch', unit: 'each', costLow: 2, costMid: 4, costHigh: 8, laborMinutes: 15 },
  'switch_3way': { name: '3-Way Switch', unit: 'each', costLow: 5, costMid: 8, costHigh: 15, laborMinutes: 20 },
  'switch_dimmer': { name: 'Dimmer Switch', unit: 'each', costLow: 18, costMid: 35, costHigh: 75, laborMinutes: 20 },
  'switch_smart': { name: 'Smart Switch', unit: 'each', costLow: 35, costMid: 55, costHigh: 120, laborMinutes: 25 },

  // Boxes & Covers
  'box_single': { name: 'Single Gang Box', unit: 'each', costLow: 1.50, costMid: 2.50, costHigh: 5, laborMinutes: 10 },
  'box_double': { name: 'Double Gang Box', unit: 'each', costLow: 2.50, costMid: 4, costHigh: 8, laborMinutes: 12 },
  'box_4x4': { name: '4x4 Junction Box', unit: 'each', costLow: 3, costMid: 5, costHigh: 10, laborMinutes: 15 },
  'cover_plate_std': { name: 'Standard Cover Plate', unit: 'each', costLow: 0.75, costMid: 2, costHigh: 8, laborMinutes: 2 },

  // Lighting
  'light_led_4ft': { name: '4ft LED Shop Light', unit: 'each', costLow: 25, costMid: 45, costHigh: 85, laborMinutes: 30 },
  'light_pot_4in': { name: '4" Pot Light (LED)', unit: 'each', costLow: 18, costMid: 35, costHigh: 75, laborMinutes: 30 },
  'light_pot_6in': { name: '6" Pot Light (LED)', unit: 'each', costLow: 22, costMid: 45, costHigh: 95, laborMinutes: 35 },
  'light_fixture_basic': { name: 'Basic Ceiling Fixture', unit: 'each', costLow: 25, costMid: 55, costHigh: 150, laborMinutes: 30 },
  'light_exterior_wall': { name: 'Exterior Wall Light', unit: 'each', costLow: 35, costMid: 75, costHigh: 200, laborMinutes: 40 },
  'light_motion_sensor': { name: 'Motion Sensor Light', unit: 'each', costLow: 45, costMid: 85, costHigh: 180, laborMinutes: 45 },

  // Specialty
  'ev_charger_l2': { name: 'Level 2 EV Charger', unit: 'each', costLow: 450, costMid: 750, costHigh: 1500, laborMinutes: 180 },
  'smoke_detector_hardwired': { name: 'Hardwired Smoke Detector', unit: 'each', costLow: 25, costMid: 40, costHigh: 75, laborMinutes: 30 },
  'co_detector_hardwired': { name: 'Hardwired CO Detector', unit: 'each', costLow: 35, costMid: 55, costHigh: 95, laborMinutes: 30 },
  'exhaust_fan_bath': { name: 'Bathroom Exhaust Fan', unit: 'each', costLow: 45, costMid: 85, costHigh: 180, laborMinutes: 60 },
  'garage_door_opener': { name: 'Garage Door Opener Outlet', unit: 'each', costLow: 15, costMid: 25, costHigh: 45, laborMinutes: 45 },
  'disconnect_60a': { name: '60A Disconnect', unit: 'each', costLow: 45, costMid: 75, costHigh: 120, laborMinutes: 45 },
};

// ==========================================
// PLUMBING PARTS PRICING
// ==========================================
export const PLUMBING_PARTS: Record<string, PartPrice> = {
  // Fixtures
  'toilet_std': { name: 'Standard Toilet', unit: 'each', costLow: 150, costMid: 280, costHigh: 550, laborMinutes: 90 },
  'toilet_elongated': { name: 'Elongated Toilet', unit: 'each', costLow: 200, costMid: 350, costHigh: 700, laborMinutes: 90 },
  'sink_bathroom': { name: 'Bathroom Sink', unit: 'each', costLow: 80, costMid: 180, costHigh: 450, laborMinutes: 60 },
  'sink_kitchen': { name: 'Kitchen Sink (Double)', unit: 'each', costLow: 150, costMid: 350, costHigh: 800, laborMinutes: 90 },
  'sink_utility': { name: 'Utility/Laundry Sink', unit: 'each', costLow: 100, costMid: 200, costHigh: 400, laborMinutes: 60 },
  'faucet_bathroom': { name: 'Bathroom Faucet', unit: 'each', costLow: 45, costMid: 120, costHigh: 350, laborMinutes: 30 },
  'faucet_kitchen': { name: 'Kitchen Faucet', unit: 'each', costLow: 85, costMid: 200, costHigh: 550, laborMinutes: 45 },
  'showerhead_std': { name: 'Standard Showerhead', unit: 'each', costLow: 25, costMid: 75, costHigh: 250, laborMinutes: 20 },
  'tub_std': { name: 'Standard Bathtub', unit: 'each', costLow: 250, costMid: 500, costHigh: 1500, laborMinutes: 180 },
  'shower_base': { name: 'Shower Base', unit: 'each', costLow: 200, costMid: 400, costHigh: 900, laborMinutes: 120 },

  // Water Heaters
  'water_heater_40gal_gas': { name: '40 Gal Gas Water Heater', unit: 'each', costLow: 650, costMid: 950, costHigh: 1400, laborMinutes: 180 },
  'water_heater_50gal_gas': { name: '50 Gal Gas Water Heater', unit: 'each', costLow: 750, costMid: 1100, costHigh: 1650, laborMinutes: 180 },
  'water_heater_40gal_elec': { name: '40 Gal Electric Water Heater', unit: 'each', costLow: 450, costMid: 650, costHigh: 950, laborMinutes: 150 },
  'water_heater_tankless_gas': { name: 'Tankless Gas Water Heater', unit: 'each', costLow: 1200, costMid: 1800, costHigh: 3000, laborMinutes: 300 },

  // Pipes & Fittings
  'pipe_pex_1/2': { name: '1/2" PEX Pipe', unit: 'per 30m', costLow: 35, costMid: 50, costHigh: 75, laborMinutes: 0 },
  'pipe_pex_3/4': { name: '3/4" PEX Pipe', unit: 'per 30m', costLow: 55, costMid: 80, costHigh: 120, laborMinutes: 0 },
  'pipe_copper_1/2': { name: '1/2" Copper Pipe', unit: 'per 3m', costLow: 25, costMid: 35, costHigh: 50, laborMinutes: 30 },
  'pipe_abs_3': { name: '3" ABS Drain Pipe', unit: 'per 3m', costLow: 18, costMid: 28, costHigh: 45, laborMinutes: 25 },
  'pipe_abs_4': { name: '4" ABS Drain Pipe', unit: 'per 3m', costLow: 25, costMid: 38, costHigh: 55, laborMinutes: 30 },

  // Valves & Connections
  'shutoff_valve': { name: 'Shut-off Valve', unit: 'each', costLow: 12, costMid: 22, costHigh: 45, laborMinutes: 20 },
  'backwater_valve': { name: 'Backwater Valve', unit: 'each', costLow: 180, costMid: 350, costHigh: 600, laborMinutes: 180 },
  'sump_pump': { name: 'Sump Pump', unit: 'each', costLow: 150, costMid: 280, costHigh: 500, laborMinutes: 120 },
  'floor_drain': { name: 'Floor Drain', unit: 'each', costLow: 35, costMid: 65, costHigh: 120, laborMinutes: 60 },
};

// ==========================================
// HVAC PARTS PRICING
// ==========================================
export const HVAC_PARTS: Record<string, PartPrice> = {
  // Furnaces
  'furnace_60k_btu': { name: '60,000 BTU Gas Furnace', unit: 'each', costLow: 1200, costMid: 1800, costHigh: 2800, laborMinutes: 480 },
  'furnace_80k_btu': { name: '80,000 BTU Gas Furnace', unit: 'each', costLow: 1400, costMid: 2100, costHigh: 3200, laborMinutes: 480 },
  'furnace_100k_btu': { name: '100,000 BTU Gas Furnace', unit: 'each', costLow: 1600, costMid: 2400, costHigh: 3800, laborMinutes: 540 },

  // Air Conditioning
  'ac_2ton': { name: '2 Ton AC Unit', unit: 'each', costLow: 1800, costMid: 2800, costHigh: 4500, laborMinutes: 480 },
  'ac_3ton': { name: '3 Ton AC Unit', unit: 'each', costLow: 2200, costMid: 3400, costHigh: 5500, laborMinutes: 540 },
  'ac_4ton': { name: '4 Ton AC Unit', unit: 'each', costLow: 2800, costMid: 4200, costHigh: 6800, laborMinutes: 600 },

  // Heat Pumps
  'heat_pump_2ton': { name: '2 Ton Heat Pump', unit: 'each', costLow: 2500, costMid: 4000, costHigh: 6500, laborMinutes: 540 },
  'heat_pump_3ton': { name: '3 Ton Heat Pump', unit: 'each', costLow: 3200, costMid: 5000, costHigh: 8000, laborMinutes: 600 },
  'mini_split_12k': { name: '12,000 BTU Mini Split', unit: 'each', costLow: 800, costMid: 1400, costHigh: 2500, laborMinutes: 300 },
  'mini_split_18k': { name: '18,000 BTU Mini Split', unit: 'each', costLow: 1100, costMid: 1800, costHigh: 3200, laborMinutes: 360 },

  // Ductwork
  'duct_6in_flex': { name: '6" Flex Duct', unit: 'per 7.5m', costLow: 35, costMid: 55, costHigh: 85, laborMinutes: 30 },
  'duct_8in_flex': { name: '8" Flex Duct', unit: 'per 7.5m', costLow: 45, costMid: 70, costHigh: 100, laborMinutes: 35 },
  'duct_10in_rigid': { name: '10" Rigid Duct', unit: 'per 1.5m', costLow: 25, costMid: 40, costHigh: 65, laborMinutes: 45 },
  'register_4x10': { name: '4x10 Floor Register', unit: 'each', costLow: 8, costMid: 18, costHigh: 45, laborMinutes: 15 },
  'register_6x12': { name: '6x12 Floor Register', unit: 'each', costLow: 12, costMid: 25, costHigh: 55, laborMinutes: 15 },

  // Thermostats
  'thermostat_basic': { name: 'Basic Thermostat', unit: 'each', costLow: 25, costMid: 50, costHigh: 100, laborMinutes: 30 },
  'thermostat_programmable': { name: 'Programmable Thermostat', unit: 'each', costLow: 50, costMid: 100, costHigh: 180, laborMinutes: 45 },
  'thermostat_smart': { name: 'Smart Thermostat', unit: 'each', costLow: 150, costMid: 250, costHigh: 400, laborMinutes: 60 },

  // Ventilation
  'hrv_unit': { name: 'HRV Unit', unit: 'each', costLow: 800, costMid: 1400, costHigh: 2500, laborMinutes: 360 },
  'erv_unit': { name: 'ERV Unit', unit: 'each', costLow: 1000, costMid: 1800, costHigh: 3200, laborMinutes: 360 },
  'bath_fan_50cfm': { name: '50 CFM Bath Fan', unit: 'each', costLow: 35, costMid: 65, costHigh: 130, laborMinutes: 60 },
  'bath_fan_80cfm': { name: '80 CFM Bath Fan', unit: 'each', costLow: 55, costMid: 95, costHigh: 180, laborMinutes: 60 },
  'range_hood_30in': { name: '30" Range Hood', unit: 'each', costLow: 150, costMid: 350, costHigh: 800, laborMinutes: 90 },
};

// ==========================================
// FRAMING & LUMBER PRICING
// ==========================================
export const FRAMING_PARTS: Record<string, PartPrice> = {
  'stud_2x4_8ft': { name: '2x4x8 SPF Stud', unit: 'each', costLow: 4, costMid: 5.50, costHigh: 7.50, laborMinutes: 5 },
  'stud_2x4_10ft': { name: '2x4x10 SPF', unit: 'each', costLow: 6, costMid: 8, costHigh: 11, laborMinutes: 6 },
  'stud_2x6_8ft': { name: '2x6x8 SPF Stud', unit: 'each', costLow: 6, costMid: 8, costHigh: 11, laborMinutes: 6 },
  'stud_2x6_10ft': { name: '2x6x10 SPF', unit: 'each', costLow: 9, costMid: 12, costHigh: 16, laborMinutes: 7 },
  'plywood_1/2': { name: '1/2" Plywood 4x8', unit: 'sheet', costLow: 35, costMid: 48, costHigh: 65, laborMinutes: 15 },
  'plywood_3/4': { name: '3/4" Plywood 4x8', unit: 'sheet', costLow: 55, costMid: 72, costHigh: 95, laborMinutes: 18 },
  'osb_7/16': { name: '7/16" OSB 4x8', unit: 'sheet', costLow: 22, costMid: 32, costHigh: 45, laborMinutes: 15 },
  'osb_3/4': { name: '3/4" OSB T&G 4x8', unit: 'sheet', costLow: 38, costMid: 52, costHigh: 70, laborMinutes: 18 },
  'lvl_beam_1.75x9.5': { name: 'LVL Beam 1.75x9.5"', unit: 'per foot', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 3 },
  'truss_common': { name: 'Common Roof Truss', unit: 'each', costLow: 80, costMid: 120, costHigh: 180, laborMinutes: 30 },
  'joist_hanger': { name: 'Joist Hanger', unit: 'each', costLow: 3, costMid: 5, costHigh: 9, laborMinutes: 5 },
  'simpson_tie': { name: 'Simpson Hurricane Tie', unit: 'each', costLow: 2, costMid: 3.50, costHigh: 6, laborMinutes: 3 },
};

// ==========================================
// ROOFING MATERIALS PRICING
// ==========================================
export const ROOFING_PARTS: Record<string, PartPrice> = {
  'shingle_3tab': { name: '3-Tab Shingles', unit: 'per bundle', costLow: 28, costMid: 38, costHigh: 55, laborMinutes: 0 },
  'shingle_arch': { name: 'Architectural Shingles', unit: 'per bundle', costLow: 38, costMid: 52, costHigh: 75, laborMinutes: 0 },
  'shingle_premium': { name: 'Premium Shingles', unit: 'per bundle', costLow: 55, costMid: 80, costHigh: 120, laborMinutes: 0 },
  'underlayment_felt': { name: 'Felt Underlayment', unit: 'per roll', costLow: 25, costMid: 35, costHigh: 50, laborMinutes: 0 },
  'underlayment_synthetic': { name: 'Synthetic Underlayment', unit: 'per roll', costLow: 85, costMid: 120, costHigh: 180, laborMinutes: 0 },
  'ice_water_shield': { name: 'Ice & Water Shield', unit: 'per roll', costLow: 120, costMid: 160, costHigh: 220, laborMinutes: 0 },
  'drip_edge': { name: 'Drip Edge', unit: 'per 3m', costLow: 8, costMid: 14, costHigh: 25, laborMinutes: 10 },
  'ridge_vent': { name: 'Ridge Vent', unit: 'per 1.2m', costLow: 12, costMid: 22, costHigh: 40, laborMinutes: 15 },
  'flashing_step': { name: 'Step Flashing', unit: 'per pack', costLow: 18, costMid: 28, costHigh: 45, laborMinutes: 0 },
  'vent_pipe_boot': { name: 'Pipe Boot', unit: 'each', costLow: 12, costMid: 22, costHigh: 45, laborMinutes: 15 },
  'soffit_vinyl': { name: 'Vinyl Soffit', unit: 'per 3.7m', costLow: 18, costMid: 28, costHigh: 45, laborMinutes: 20 },
  'fascia_aluminum': { name: 'Aluminum Fascia', unit: 'per 3m', costLow: 15, costMid: 25, costHigh: 40, laborMinutes: 20 },
};

// ==========================================
// DRYWALL & FINISHING PRICING
// ==========================================
export const DRYWALL_PARTS: Record<string, PartPrice> = {
  'drywall_1/2_4x8': { name: '1/2" Drywall 4x8', unit: 'sheet', costLow: 14, costMid: 18, costHigh: 25, laborMinutes: 20 },
  'drywall_1/2_4x12': { name: '1/2" Drywall 4x12', unit: 'sheet', costLow: 22, costMid: 28, costHigh: 38, laborMinutes: 25 },
  'drywall_5/8_4x8': { name: '5/8" Fire-Rated 4x8', unit: 'sheet', costLow: 18, costMid: 24, costHigh: 35, laborMinutes: 22 },
  'drywall_moisture_1/2': { name: '1/2" Moisture Resistant 4x8', unit: 'sheet', costLow: 18, costMid: 25, costHigh: 38, laborMinutes: 20 },
  'mud_box': { name: 'Drywall Compound (Box)', unit: 'per box', costLow: 18, costMid: 25, costHigh: 38, laborMinutes: 0 },
  'tape_paper': { name: 'Paper Tape', unit: 'per roll', costLow: 4, costMid: 6, costHigh: 10, laborMinutes: 0 },
  'tape_mesh': { name: 'Mesh Tape', unit: 'per roll', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 0 },
  'corner_bead': { name: 'Corner Bead', unit: 'per 3m', costLow: 3, costMid: 5, costHigh: 10, laborMinutes: 10 },
  'screws_drywall': { name: 'Drywall Screws (1lb)', unit: 'per lb', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 0 },
};

// ==========================================
// FLOORING PRICING
// ==========================================
export const FLOORING_PARTS: Record<string, PartPrice> = {
  'laminate_economy': { name: 'Economy Laminate', unit: 'per sqft', costLow: 1.50, costMid: 2.50, costHigh: 4, laborMinutes: 3 },
  'laminate_mid': { name: 'Mid-Grade Laminate', unit: 'per sqft', costLow: 2.50, costMid: 4, costHigh: 6, laborMinutes: 3 },
  'lvp_economy': { name: 'Economy LVP', unit: 'per sqft', costLow: 2, costMid: 3.50, costHigh: 5.50, laborMinutes: 3 },
  'lvp_mid': { name: 'Mid-Grade LVP', unit: 'per sqft', costLow: 3.50, costMid: 5.50, costHigh: 8, laborMinutes: 3 },
  'lvp_premium': { name: 'Premium LVP', unit: 'per sqft', costLow: 5.50, costMid: 8, costHigh: 12, laborMinutes: 4 },
  'hardwood_oak': { name: 'Oak Hardwood', unit: 'per sqft', costLow: 6, costMid: 9, costHigh: 14, laborMinutes: 5 },
  'hardwood_maple': { name: 'Maple Hardwood', unit: 'per sqft', costLow: 7, costMid: 11, costHigh: 16, laborMinutes: 5 },
  'tile_ceramic': { name: 'Ceramic Tile', unit: 'per sqft', costLow: 2, costMid: 4, costHigh: 8, laborMinutes: 8 },
  'tile_porcelain': { name: 'Porcelain Tile', unit: 'per sqft', costLow: 4, costMid: 7, costHigh: 14, laborMinutes: 10 },
  'carpet_economy': { name: 'Economy Carpet', unit: 'per sqft', costLow: 2, costMid: 3.50, costHigh: 5.50, laborMinutes: 2 },
  'carpet_mid': { name: 'Mid-Grade Carpet', unit: 'per sqft', costLow: 3.50, costMid: 5.50, costHigh: 9, laborMinutes: 2 },
  'underlayment_foam': { name: 'Foam Underlayment', unit: 'per sqft', costLow: 0.25, costMid: 0.50, costHigh: 1, laborMinutes: 0.5 },
  'underlayment_cork': { name: 'Cork Underlayment', unit: 'per sqft', costLow: 0.75, costMid: 1.25, costHigh: 2, laborMinutes: 0.5 },
  'transition_strip': { name: 'Transition Strip', unit: 'per 3ft', costLow: 8, costMid: 15, costHigh: 30, laborMinutes: 10 },
  'baseboard': { name: 'MDF Baseboard', unit: 'per 8ft', costLow: 4, costMid: 8, costHigh: 18, laborMinutes: 10 },
};

// ==========================================
// PAINTING PRICING
// ==========================================
export const PAINTING_PARTS: Record<string, PartPrice> = {
  'paint_primer': { name: 'Primer', unit: 'per gallon', costLow: 25, costMid: 40, costHigh: 65, laborMinutes: 0 },
  'paint_flat': { name: 'Interior Flat Paint', unit: 'per gallon', costLow: 30, costMid: 50, costHigh: 85, laborMinutes: 0 },
  'paint_eggshell': { name: 'Interior Eggshell Paint', unit: 'per gallon', costLow: 35, costMid: 55, costHigh: 95, laborMinutes: 0 },
  'paint_satin': { name: 'Interior Satin Paint', unit: 'per gallon', costLow: 38, costMid: 60, costHigh: 100, laborMinutes: 0 },
  'paint_semigloss': { name: 'Interior Semi-Gloss Paint', unit: 'per gallon', costLow: 40, costMid: 65, costHigh: 110, laborMinutes: 0 },
  'paint_exterior': { name: 'Exterior Paint', unit: 'per gallon', costLow: 45, costMid: 70, costHigh: 120, laborMinutes: 0 },
  'caulk_painters': { name: 'Painters Caulk', unit: 'tube', costLow: 4, costMid: 7, costHigh: 12, laborMinutes: 0 },
  'tape_painters': { name: 'Painters Tape', unit: 'roll', costLow: 6, costMid: 10, costHigh: 18, laborMinutes: 0 },
  'roller_cover': { name: 'Roller Cover', unit: 'each', costLow: 5, costMid: 10, costHigh: 20, laborMinutes: 0 },
  'drop_cloth': { name: 'Drop Cloth', unit: 'each', costLow: 8, costMid: 15, costHigh: 35, laborMinutes: 0 },
};

// ==========================================
// FOUNDATION PRICING
// ==========================================
export const FOUNDATION_PARTS: Record<string, PartPrice> = {
  'concrete_ready_mix': { name: 'Ready Mix Concrete', unit: 'per cubic meter', costLow: 180, costMid: 220, costHigh: 280, laborMinutes: 0 },
  'rebar_10m': { name: '10M Rebar', unit: 'per 6m', costLow: 8, costMid: 12, costHigh: 18, laborMinutes: 10 },
  'rebar_15m': { name: '15M Rebar', unit: 'per 6m', costLow: 14, costMid: 20, costHigh: 30, laborMinutes: 12 },
  'wire_mesh': { name: 'Wire Mesh 4x8', unit: 'sheet', costLow: 35, costMid: 50, costHigh: 75, laborMinutes: 5 },
  'form_rental': { name: 'Form Rental', unit: 'per day', costLow: 50, costMid: 100, costHigh: 200, laborMinutes: 0 },
  'waterproofing_membrane': { name: 'Waterproofing Membrane', unit: 'per sqft', costLow: 1.50, costMid: 2.50, costHigh: 4.50, laborMinutes: 2 },
  'dimple_board': { name: 'Dimple Board', unit: 'per 4x8 sheet', costLow: 25, costMid: 40, costHigh: 65, laborMinutes: 10 },
  'weeping_tile': { name: 'Weeping Tile', unit: 'per 30m', costLow: 80, costMid: 120, costHigh: 180, laborMinutes: 60 },
  'gravel_drainage': { name: 'Drainage Gravel', unit: 'per cubic yard', costLow: 45, costMid: 65, costHigh: 95, laborMinutes: 0 },
  'sill_gasket': { name: 'Sill Gasket', unit: 'per 50ft roll', costLow: 12, costMid: 20, costHigh: 35, laborMinutes: 0 },
  'anchor_bolts': { name: 'Anchor Bolts', unit: 'each', costLow: 3, costMid: 5, costHigh: 9, laborMinutes: 5 },
  'sump_pit': { name: 'Sump Pit', unit: 'each', costLow: 45, costMid: 80, costHigh: 140, laborMinutes: 45 },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getPartPrice(trade: string, partKey: string): PartPrice | undefined {
  const tradePartsMap: Record<string, Record<string, PartPrice>> = {
    electrical: ELECTRICAL_PARTS,
    plumbing: PLUMBING_PARTS,
    hvac: HVAC_PARTS,
    framing: FRAMING_PARTS,
    roofing: ROOFING_PARTS,
    drywall: DRYWALL_PARTS,
    flooring: FLOORING_PARTS,
    painting: PAINTING_PARTS,
    foundation: FOUNDATION_PARTS,
  };

  return tradePartsMap[trade]?.[partKey];
}

export function getLaborRate(trade: string): LaborRate {
  return LABOR_RATES[trade] || LABOR_RATES.electrical;
}

export function calculatePartCost(
  part: PartPrice,
  quantity: number,
  qualityLevel: 'low' | 'mid' | 'high' = 'mid'
): { materialCost: number; laborMinutes: number } {
  const cost = qualityLevel === 'low' ? part.costLow : qualityLevel === 'high' ? part.costHigh : part.costMid;
  return {
    materialCost: cost * quantity,
    laborMinutes: part.laborMinutes * quantity,
  };
}

export function calculateLaborCost(
  trade: string,
  laborMinutes: number,
  qualityLevel: 'low' | 'mid' | 'high' = 'mid'
): number {
  const rate = getLaborRate(trade);
  const hourlyRate = qualityLevel === 'low' ? rate.hourlyLow : qualityLevel === 'high' ? rate.hourlyHigh : rate.hourlyMid;
  return (laborMinutes / 60) * hourlyRate;
}
