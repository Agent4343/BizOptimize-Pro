"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAssistant } from "@/components/ui/chat-assistant";
import { hasAccess, isDemoActive, getDemoTimeRemaining, startDemo } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";

type Trade = "electrical" | "plumbing" | "carpentry" | "framing" | "drywall" | "hvac" | "roofing" | "flooring" | "concrete" | "general" | "all";

const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta", costMultiplier: 1.0 },
  { code: "BC", name: "British Columbia", costMultiplier: 1.15 },
  { code: "MB", name: "Manitoba", costMultiplier: 0.95 },
  { code: "NB", name: "New Brunswick", costMultiplier: 0.92 },
  { code: "NL", name: "Newfoundland and Labrador", costMultiplier: 1.05 },
  { code: "NS", name: "Nova Scotia", costMultiplier: 0.98 },
  { code: "NT", name: "Northwest Territories", costMultiplier: 1.25 },
  { code: "NU", name: "Nunavut", costMultiplier: 1.30 },
  { code: "ON", name: "Ontario", costMultiplier: 1.10 },
  { code: "PE", name: "Prince Edward Island", costMultiplier: 0.95 },
  { code: "QC", name: "Quebec", costMultiplier: 1.05 },
  { code: "SK", name: "Saskatchewan", costMultiplier: 0.93 },
  { code: "YT", name: "Yukon", costMultiplier: 1.20 }
];

const TOTAL_STEPS = 8;

export default function ConstructionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [estimateOptions, setEstimateOptions] = useState<{budget: any, value: any, premium: any, buildingCode?: any} | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasModuleAccess, setHasModuleAccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoTimeRemaining, setDemoTimeRemaining] = useState(0);

  useEffect(() => {
    // Check for demo mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    
    if (isDemoMode && !isDemoActive('construction')) {
      startDemo('construction');
    }

    const access = hasAccess('construction');
    const demo = isDemoActive('construction');
    
    setHasModuleAccess(access);
    setIsDemo(demo);

    if (!access) {
      // Redirect to pricing if no access
      window.location.href = '/pricing';
      return;
    }

    // Update demo timer
    if (demo) {
      const updateTimer = () => {
        const remaining = getDemoTimeRemaining('construction');
        setDemoTimeRemaining(remaining);
        if (remaining <= 0) {
          alert('Demo time has expired. Please subscribe to continue using this module.');
          window.location.href = '/pricing';
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  const [formData, setFormData] = useState({
    // Step 1: Project Overview
    projectName: "",
    projectDescription: "",
    constructionType: "new", // new, renovation, addition, repair
    yearBuilt: "",
    province: "",
    city: "",
    
    // Step 2: Work Scope (Trades)
    trades: [] as string[],
    
    // Step 3: Measurements
    squareFootage: "",
    roomMeasurements: "",
    ceilingHeight: "",
    numberOfFloors: "",
    
    // Step 4: Site Conditions
    access: "normal", // easy, normal, difficult, obstructed
    wallCondition: "fully finished", // open framing, partial, fully finished
    hazards: [] as string[], // old wiring, rotten framing, asbestos, mold, water damage
    
    // Step 5: Materials
    materialGrade: "standard", // basic, standard, premium
    preferredBrands: "",
    contractorSuppliesMaterials: "yes", // yes, no, partial
    
    // Step 6: Labor
    numberOfWorkers: "",
    experienceLevel: "journeyperson", // apprentice, journeyperson, red seal, master
    union: "no", // yes, no
    hourlyLaborRate: "",
    overtimeRequired: "no",
    weekendWork: "no",
    
    // Step 7: Timeline
    preferredStartDate: "",
    requiredCompletionDate: "",
    fullAccess: "yes", // yes, no
    
    // Step 8: Permits & Utilities
    permitsRequired: "yes",
    whoPullsPermits: "contractor", // contractor, homeowner
    codeUpgrades: "no",
    panelSize: "200", // 100, 200, 400
    waterSupply: "city", // city, well
    sewerType: "city", // city, septic
    heatingType: "furnace", // furnace, heat pump, boiler
    
    // Additional Details
    photos: "",
    floorplan: "",
    sketches: "",
    budgetPreference: "best value", // lowest cost, best value, premium, no preference
    
    // Company Information (for quote header)
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyLicense: "",
    estimatorName: "",
    clientName: "",
    clientAddress: "",
    projectAddress: "",
    quoteValidity: "90", // days
    overheadPercent: "12",
    profitPercent: "10",
    
    // Old Home Details (if applicable)
    knobAndTubeWiring: "no",
    galvanizedPlumbing: "no",
    rottenFraming: "no",
    oldInsulation: "no",
    pastRenovations: "",
    
    // Trade-specific details (will be populated based on selected trades)
    electricalOutlets: "",
    lightFixtures: "",
    electricalPanel: "",
    hvacSystem: "",
    electricVehicleCharger: "no",
    solarPanels: "no",
    smartHomeFeatures: "no",
    plumbingFixtures: "",
    waterHeater: "",
    sewerConnection: "",
    hotWaterRecirculation: "no",
    waterSoftener: "no",
    rooms: "",
    doors: "",
    windows: "",
    cabinets: "",
    flooring: "",
    customMillwork: "no",
    bedrooms: "",
    bathrooms: "",
  });

  const generateEstimate = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Professional construction estimate for ${formData.constructionType} project in ${formData.province}, Canada. Generate three estimate options: Budget Build, Best Value, and Premium.`,
          businessType: 'construction',
          optimizationType: 'estimate',
          trade: selectedTrades.length === 0 ? 'all' : selectedTrades.join(','),
          details: formData,
          province: formData.province,
          generateThreeOptions: true
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.estimateOptions) {
          setEstimateOptions(data.estimateOptions);
        } else {
          setResult(data.result);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error generating estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrade = (trade: string) => {
    setSelectedTrades(prev => 
      prev.includes(trade) 
        ? prev.filter(t => t !== trade)
        : [...prev, trade]
    );
  };

  const allTrades = [
    { id: "electrical", name: "Electrical", icon: "⚡" },
    { id: "plumbing", name: "Plumbing", icon: "🚿" },
    { id: "carpentry", name: "Carpentry", icon: "🔨" },
    { id: "framing", name: "Framing", icon: "🏗️" },
    { id: "drywall", name: "Drywall", icon: "🧱" },
    { id: "hvac", name: "HVAC", icon: "❄️" },
    { id: "roofing", name: "Roofing", icon: "🏠" },
    { id: "flooring", name: "Flooring", icon: "🪵" },
    { id: "concrete", name: "Concrete/Excavation", icon: "🏗️" },
    { id: "general", name: "General Contracting", icon: "👷" }
  ];

  const hazardsOptions = [
    { id: "old wiring", label: "Old Wiring" },
    { id: "rotten framing", label: "Rotten Framing" },
    { id: "asbestos", label: "Asbestos" },
    { id: "mold", label: "Mold" },
    { id: "water damage", label: "Water Damage" }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Ask your customer these questions to gather accurate information</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name / Customer Name</label>
              <Input
                placeholder="e.g., Smith Family Home or John Smith"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                className="border-2"
              />
              <p className="text-xs text-gray-500">What should we call this project?</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Description <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., Complete renovation of 1950s bungalow including kitchen and bathroom updates"
                value={formData.projectDescription}
                onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                className="border-2"
                required
              />
              <p className="text-xs text-gray-500">Ask customer: "Can you describe what you'd like done?"</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type <span className="text-red-500">*</span></label>
              <select
                value={formData.constructionType}
                onChange={(e) => setFormData({...formData, constructionType: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
                required
              >
                <option value="new">New Build</option>
                <option value="renovation">Renovation</option>
                <option value="addition">Addition</option>
                <option value="repair">Repair on Older Home</option>
              </select>
            </div>

            {formData.constructionType !== "new" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Year the home was built</label>
                <Input
                  type="number"
                  placeholder="1950"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                  className="border-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Province/Territory <span className="text-red-500">*</span></label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Province/Territory</option>
                {CANADIAN_PROVINCES.map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City/Town <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., Toronto, Vancouver, Calgary"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="border-2"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Select All Trades Involved</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Select all trades you'll need for this project. This ensures accurate cost estimation.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allTrades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => toggleTrade(trade.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTrades.includes(trade.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{trade.icon}</div>
                  <div className="font-medium text-sm">{trade.name}</div>
                </button>
              ))}
            </div>
            {selectedTrades.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">Please select at least one trade</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Measurements</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Ask customer for measurements or do a site visit to verify. Accurate measurements = accurate quotes.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Square Footage <span className="text-red-500">*</span></label>
              <Input
                type="number"
                placeholder="2000"
                value={formData.squareFootage}
                onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                className="border-2"
                required
              />
              <p className="text-xs text-gray-500">Ask customer: "What's the total square footage?" or measure yourself</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Room-by-room measurements (optional)</label>
              <textarea
                placeholder="Kitchen: 200 sq ft, Living Room: 300 sq ft, etc."
                value={formData.roomMeasurements}
                onChange={(e) => setFormData({...formData, roomMeasurements: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ceiling Height</label>
                <Input
                  placeholder="8 ft"
                  value={formData.ceilingHeight}
                  onChange={(e) => setFormData({...formData, ceilingHeight: e.target.value})}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Floors</label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.numberOfFloors}
                  onChange={(e) => setFormData({...formData, numberOfFloors: e.target.value})}
                  className="border-2"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Site Conditions</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Document site conditions to avoid surprises. Consider doing a site visit before quoting.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Access</label>
              <select
                value={formData.access}
                onChange={(e) => setFormData({...formData, access: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="difficult">Difficult</option>
                <option value="obstructed">Obstructed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Wall Condition</label>
              <select
                value={formData.wallCondition}
                onChange={(e) => setFormData({...formData, wallCondition: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="open framing">Open Framing</option>
                <option value="partial">Partial</option>
                <option value="fully finished">Fully Finished</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hazards (select all that apply)</label>
              <div className="space-y-2">
                {hazardsOptions.map((hazard) => (
                  <label key={hazard.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hazards.includes(hazard.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, hazards: [...formData.hazards, hazard.id]});
                        } else {
                          setFormData({...formData, hazards: formData.hazards.filter(h => h !== hazard.id)});
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{hazard.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Materials</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Discuss material options with customer. Higher grade = higher cost but better quality.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Material Grade</label>
              <select
                value={formData.materialGrade}
                onChange={(e) => setFormData({...formData, materialGrade: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Brands (optional)</label>
              <Input
                placeholder="e.g., Kohler, Moen, Delta"
                value={formData.preferredBrands}
                onChange={(e) => setFormData({...formData, preferredBrands: e.target.value})}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Will contractor supply materials?</label>
              <select
                value={formData.contractorSuppliesMaterials}
                onChange={(e) => setFormData({...formData, contractorSuppliesMaterials: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="yes">Yes - Contractor supplies all</option>
                <option value="partial">Partial - Some materials provided</option>
                <option value="no">No - Homeowner supplies materials</option>
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Labor</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Plan your crew based on project size and timeline. More workers = faster completion but higher cost.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Workers</label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.numberOfWorkers}
                  onChange={(e) => setFormData({...formData, numberOfWorkers: e.target.value})}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level Needed</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="apprentice">Apprentice</option>
                  <option value="journeyperson">Journeyperson</option>
                  <option value="red seal">Red Seal</option>
                  <option value="master">Master</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Union or Non-Union</label>
                <select
                  value={formData.union}
                  onChange={(e) => setFormData({...formData, union: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="no">Non-Union</option>
                  <option value="yes">Union</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hourly Labor Rate (optional)</label>
                <Input
                  type="number"
                  placeholder="Auto-calculated if blank"
                  value={formData.hourlyLaborRate}
                  onChange={(e) => setFormData({...formData, hourlyLaborRate: e.target.value})}
                  className="border-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Overtime Required?</label>
                <select
                  value={formData.overtimeRequired}
                  onChange={(e) => setFormData({...formData, overtimeRequired: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weekend Work Required?</label>
                <select
                  value={formData.weekendWork}
                  onChange={(e) => setFormData({...formData, weekendWork: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Discuss timeline with customer. Be realistic - rushing can increase costs.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Start Date</label>
                <Input
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => setFormData({...formData, preferredStartDate: e.target.value})}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Completion Date</label>
                <Input
                  type="date"
                  value={formData.requiredCompletionDate}
                  onChange={(e) => setFormData({...formData, requiredCompletionDate: e.target.value})}
                  className="border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Access or Partial Access?</label>
              <select
                value={formData.fullAccess}
                onChange={(e) => setFormData({...formData, fullAccess: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="yes">Full Access</option>
                <option value="no">Partial Access</option>
              </select>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Permits, Codes & Utilities</h3>
            <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">💡 <strong>Tip:</strong> Verify permit requirements with local building department. Include permit costs in quote.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Permits?</label>
              <select
                value={formData.permitsRequired}
                onChange={(e) => setFormData({...formData, permitsRequired: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="not sure">Not Sure</option>
              </select>
            </div>

            {formData.permitsRequired === "yes" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Who Pulls Permits?</label>
                <select
                  value={formData.whoPullsPermits}
                  onChange={(e) => setFormData({...formData, whoPullsPermits: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="contractor">Contractor</option>
                  <option value="homeowner">Homeowner</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Any Code Upgrades Needed?</label>
              <select
                value={formData.codeUpgrades}
                onChange={(e) => setFormData({...formData, codeUpgrades: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="maybe">Maybe - To Be Determined</option>
              </select>
            </div>

            {(selectedTrades.includes("electrical") || selectedTrades.length === 0) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Panel Size (if electrical work)</label>
                <select
                  value={formData.panelSize}
                  onChange={(e) => setFormData({...formData, panelSize: e.target.value})}
                  className="w-full border-2 rounded-md px-3 py-2"
                >
                  <option value="100">100A</option>
                  <option value="200">200A</option>
                  <option value="400">400A</option>
                </select>
              </div>
            )}

            {(selectedTrades.includes("plumbing") || selectedTrades.includes("hvac") || selectedTrades.length === 0) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Water Supply</label>
                    <select
                      value={formData.waterSupply}
                      onChange={(e) => setFormData({...formData, waterSupply: e.target.value})}
                      className="w-full border-2 rounded-md px-3 py-2"
                    >
                      <option value="city">City</option>
                      <option value="well">Well</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sewer Type</label>
                    <select
                      value={formData.sewerType}
                      onChange={(e) => setFormData({...formData, sewerType: e.target.value})}
                      className="w-full border-2 rounded-md px-3 py-2"
                    >
                      <option value="city">City</option>
                      <option value="septic">Septic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Heating Type</label>
                  <select
                    value={formData.heatingType}
                    onChange={(e) => setFormData({...formData, heatingType: e.target.value})}
                    className="w-full border-2 rounded-md px-3 py-2"
                  >
                    <option value="furnace">Furnace</option>
                    <option value="heat pump">Heat Pump</option>
                    <option value="boiler">Boiler</option>
                  </select>
                </div>
              </>
            )}

            {formData.constructionType !== "new" && parseInt(formData.yearBuilt || "2000") < 1980 && (
              <div className="space-y-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800">Old Home Considerations</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.knobAndTubeWiring === "yes"}
                      onChange={(e) => setFormData({...formData, knobAndTubeWiring: e.target.checked ? "yes" : "no"})}
                      className="w-4 h-4"
                    />
                    <span>Knob-and-tube wiring?</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.galvanizedPlumbing === "yes"}
                      onChange={(e) => setFormData({...formData, galvanizedPlumbing: e.target.checked ? "yes" : "no"})}
                      className="w-4 h-4"
                    />
                    <span>Galvanized plumbing?</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.rottenFraming === "yes"}
                      onChange={(e) => setFormData({...formData, rottenFraming: e.target.checked ? "yes" : "no"})}
                      className="w-4 h-4"
                    />
                    <span>Rotten framing?</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.oldInsulation === "yes"}
                      onChange={(e) => setFormData({...formData, oldInsulation: e.target.checked ? "yes" : "no"})}
                      className="w-4 h-4"
                    />
                    <span>Old insulation?</span>
                  </label>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Past renovations that need correction?</label>
                    <Input
                      placeholder="Describe any issues"
                      value={formData.pastRenovations}
                      onChange={(e) => setFormData({...formData, pastRenovations: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Preference</label>
              <select
                value={formData.budgetPreference}
                onChange={(e) => setFormData({...formData, budgetPreference: e.target.value})}
                className="w-full border-2 rounded-md px-3 py-2"
              >
                <option value="lowest cost">Lowest Cost</option>
                <option value="best value">Best Value</option>
                <option value="premium">Premium</option>
                <option value="no preference">No Preference</option>
              </select>
            </div>

            <div className="space-y-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mt-4">
              <h4 className="font-semibold text-blue-800">Company Information</h4>
              <p className="text-xs text-blue-600 mb-3">💡 <strong>Important:</strong> Fill this out to customize your quote header. This information will appear on the customer quote.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Company Name</label>
                  <Input
                    placeholder="Your Construction Co."
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">License #</label>
                  <Input
                    placeholder="License #12345"
                    value={formData.companyLicense}
                    onChange={(e) => setFormData({...formData, companyLicense: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Company Address</label>
                <Input
                  placeholder="123 Main St, City, Province"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                  className="border-2 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Phone</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="info@company.com"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Estimator Name</label>
                <Input
                  placeholder="Your Name"
                  value={formData.estimatorName}
                  onChange={(e) => setFormData({...formData, estimatorName: e.target.value})}
                  className="border-2 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Client Name</label>
                <Input
                  placeholder="Client Name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="border-2 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Project Address</label>
                <Input
                  placeholder="Project location address"
                  value={formData.projectAddress}
                  onChange={(e) => setFormData({...formData, projectAddress: e.target.value})}
                  className="border-2 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Quote Validity (days)</label>
                  <Input
                    type="number"
                    placeholder="90"
                    value={formData.quoteValidity}
                    onChange={(e) => setFormData({...formData, quoteValidity: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Overhead %</label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.overheadPercent}
                    onChange={(e) => setFormData({...formData, overheadPercent: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Profit %</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.profitPercent}
                    onChange={(e) => setFormData({...formData, profitPercent: e.target.value})}
                    className="border-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedProvince = CANADIAN_PROVINCES.find(p => p.code === formData.province);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-blue-50">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🏗️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Professional Construction Estimator
                </h1>
                <p className="text-sm text-gray-600">Generate professional customer quotes quickly and accurately</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Banner */}
        {isDemo && (
          <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <div className="font-semibold text-orange-700">Demo Mode Active</div>
                    <div className="text-sm text-orange-600">
                      Time remaining: {Math.floor(demoTimeRemaining / 60)}:{(demoTimeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Subscribe to Continue →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contractor Guide */}
        {currentStep === 1 && !estimateOptions && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <span>📖</span>
                How to Use This Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">For Contractors:</h4>
                  <ul className="space-y-1 text-gray-700 list-disc list-inside">
                    <li>Use this tool to gather all necessary information from customers</li>
                    <li>Ask customers the questions shown in each step</li>
                    <li>Fill in the form as you gather information</li>
                    <li>Generate professional quotes ready to present to customers</li>
                    <li>Save time with automated calculations and formatting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What You'll Get:</h4>
                  <ul className="space-y-1 text-gray-700 list-disc list-inside">
                    <li>Three pricing options (Budget, Best Value, Premium)</li>
                    <li>Professional quote format with all industry standards</li>
                    <li>Complete cost breakdowns and payment schedules</li>
                    <li>Terms & conditions ready for customer</li>
                    <li>Print-ready quotes you can deliver immediately</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Progress Steps */}
        <div className="mb-6">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between overflow-x-auto">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                  <div key={step} className="flex items-center flex-1 min-w-[80px]">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${
                      currentStep >= step 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? '✓' : step}
                    </div>
                    {step < TOTAL_STEPS && (
                      <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-center text-sm text-gray-600">
                Step {currentStep} of {TOTAL_STEPS}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="border-2 shadow-lg sticky top-24 max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-xl">
                  {currentStep === 1 && "Step 1: Project Overview"}
                  {currentStep === 2 && "Step 2: Work Scope"}
                  {currentStep === 3 && "Step 3: Measurements"}
                  {currentStep === 4 && "Step 4: Site Conditions"}
                  {currentStep === 5 && "Step 5: Materials"}
                  {currentStep === 6 && "Step 6: Labor"}
                  {currentStep === 7 && "Step 7: Timeline"}
                  {currentStep === 8 && "Step 8: Permits & Utilities"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Gather customer project information"}
                  {currentStep === 2 && "Identify all trades needed for this project"}
                  {currentStep === 3 && "Collect accurate measurements from customer"}
                  {currentStep === 4 && "Document site conditions and potential issues"}
                  {currentStep === 5 && "Determine material grade and preferences"}
                  {currentStep === 6 && "Plan crew size and labor requirements"}
                  {currentStep === 7 && "Establish project timeline with customer"}
                  {currentStep === 8 && "Verify permits, codes & configure quote settings"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {renderStepContent()}
                
                <div className="flex gap-2 pt-4">
                  {currentStep > 1 && (
                    <Button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      variant="outline"
                      className="flex-1"
                    >
                      ← Previous
                    </Button>
                  )}
                  <Button 
                    onClick={generateEstimate} 
                    disabled={loading || (currentStep === 1 && (!formData.projectDescription || !formData.province || !formData.city)) || (currentStep === 2 && selectedTrades.length === 0) || (currentStep === 3 && !formData.squareFootage)}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg shadow-lg`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚙️</span>
                        Generating Estimates...
                      </span>
                    ) : currentStep < TOTAL_STEPS ? (
                      "Next Step →"
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>✨</span>
                        Generate Three Estimate Options
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {estimateOptions ? (
              <div className="space-y-6">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <span>📋</span>
                      Professional Customer Quote Ready
                    </CardTitle>
                    <CardDescription>
                      Three estimate options generated. Review and present to your customer. Each quote includes all professional sections ready for customer delivery.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Budget Build */}
                {estimateOptions.budget && (
                  <Card className="border-2 border-gray-300">
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="text-xl">Option A: Budget Build</CardTitle>
                      <CardDescription>Basic materials, minimum required labor, no extras</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-4 rounded border">
                          {estimateOptions.budget}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Best Value */}
                {estimateOptions.value && (
                  <Card className="border-2 border-blue-300">
                    <CardHeader className="bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Option B: Best Value</CardTitle>
                          <CardDescription>Standard materials, balanced durability, reasonable upgrades</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head><title>Construction Estimate - Best Value</title></head>
                                  <body style="font-family: Arial; padding: 20px;">
                                    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace;">${estimateOptions.value}</pre>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                        >
                          🖨️ Print
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-blue-50 p-4 rounded border">
                          {estimateOptions.value}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Premium */}
                {estimateOptions.premium && (
                  <Card className="border-2 border-purple-300">
                    <CardHeader className="bg-purple-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Option C: Premium</CardTitle>
                          <CardDescription>High-end materials, extended warranty options, smart upgrades, full code modernization</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head><title>Construction Estimate - Premium</title></head>
                                  <body style="font-family: Arial; padding: 20px;">
                                    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace;">${estimateOptions.premium}</pre>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                        >
                          🖨️ Print
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-purple-50 p-4 rounded border">
                          {estimateOptions.premium}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shared Building Code Section (shown once) */}
                {estimateOptions.buildingCode && (
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <span>🏛️</span>
                        Building Code Requirements
                      </CardTitle>
                      <CardDescription>Applies to all three estimate options</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-white p-4 rounded border">
                          {estimateOptions.buildingCode}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : result ? (
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-4 rounded border">
                      {result}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 shadow-lg">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="text-8xl mb-6 animate-bounce">🏗️</div>
                    <h3 className="text-2xl font-bold mb-3">Professional Construction Estimator</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Use this tool to gather customer information and generate professional quotes. Answer the questions on the left to create three estimate options (Budget, Best Value, Premium) that you can present to your customer. Each quote includes all industry-standard sections: terms, payment schedule, exclusions, and detailed cost breakdowns.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Chat Assistant */}
      <ChatAssistant 
        businessType="construction" 
        contextData={formData}
      />
    </div>
  );
}
