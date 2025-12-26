"use client";

import { Input } from "@/components/ui/input";
import type { ConstructionFormData } from "@/lib/construction-types";

interface TradeSpecificFieldsProps {
  trade: string;
  formData: ConstructionFormData;
  setFormData: (data: ConstructionFormData) => void;
}

export function TradeSpecificFields({ trade, formData, setFormData }: TradeSpecificFieldsProps) {
  const isGarage = formData.projectType === 'garage';

  switch (trade.toLowerCase()) {
    case 'electrical':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Panel Size (Amps)</label>
              <Input
                placeholder="200"
                type="number"
                value={formData.electricalPanelSize}
                onChange={(e) => setFormData({ ...formData, electricalPanelSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Circuits</label>
              <Input
                placeholder="20"
                type="number"
                value={formData.electricalCircuits}
                onChange={(e) => setFormData({ ...formData, electricalCircuits: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outlets</label>
              <Input
                placeholder="30"
                type="number"
                value={formData.electricalOutlets}
                onChange={(e) => setFormData({ ...formData, electricalOutlets: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Switches</label>
              <Input
                placeholder="15"
                type="number"
                value={formData.electricalSwitches}
                onChange={(e) => setFormData({ ...formData, electricalSwitches: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lighting Fixtures</label>
            <Input
              placeholder="Recessed, pendant, chandelier, etc."
              value={formData.electricalLighting}
              onChange={(e) => setFormData({ ...formData, electricalLighting: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="EV charger, generator, smart home, etc."
              value={formData.electricalSpecial}
              onChange={(e) => setFormData({ ...formData, electricalSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'plumbing':
      return (
        <div className="space-y-4">
          {!isGarage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Fixtures</label>
              <Input
                placeholder="Toilets, sinks, showers, etc."
                value={formData.plumbingFixtures}
                onChange={(e) => setFormData({ ...formData, plumbingFixtures: e.target.value })}
              />
            </div>
          )}
          {isGarage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Garages typically don&apos;t require plumbing fixtures. If you need water service for a utility sink or other use, please specify in &quot;Special Requirements&quot; below.
              </p>
            </div>
          )}
          {!isGarage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Water Heater Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.plumbingWaterHeater}
                onChange={(e) => setFormData({ ...formData, plumbingWaterHeater: e.target.value })}
              >
                <option value="">Select water heater...</option>
                <option value="tank">Tank</option>
                <option value="tankless">Tankless</option>
                <option value="heat-pump">Heat Pump</option>
                <option value="none">No Water Heater</option>
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Drains/Water Lines</label>
            <Input
              placeholder="Number of drains, water lines needed"
              value={formData.plumbingDrains}
              onChange={(e) => setFormData({ ...formData, plumbingDrains: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Garbage disposal, water softener, etc."
              value={formData.plumbingSpecial}
              onChange={(e) => setFormData({ ...formData, plumbingSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'hvac':
      return (
        <div className="space-y-4">
          {isGarage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Garages typically don&apos;t require full HVAC systems. If you need heating/cooling, specify the type below.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">System Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.hvacSystemType}
              onChange={(e) => setFormData({ ...formData, hvacSystemType: e.target.value })}
            >
              <option value="">Select system type...</option>
              {!isGarage && (
                <>
                  <option value="forced-air">Forced Air</option>
                  <option value="heat-pump">Heat Pump</option>
                  <option value="boiler">Boiler</option>
                  <option value="ductless-mini-split">Ductless Mini-Split</option>
                  <option value="radiant">Radiant</option>
                </>
              )}
              {isGarage && (
                <>
                  <option value="none">No HVAC Required</option>
                  <option value="space-heater">Space Heater</option>
                  <option value="ductless-mini-split">Ductless Mini-Split</option>
                  <option value="radiant-floor">Radiant Floor Heating</option>
                </>
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity (BTU/Tons)</label>
              <Input
                placeholder="36,000 BTU / 3 Tons"
                value={formData.hvacCapacity}
                onChange={(e) => setFormData({ ...formData, hvacCapacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ductwork Required</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.hvacDuctwork}
                onChange={(e) => setFormData({ ...formData, hvacDuctwork: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="new">New Ductwork</option>
                <option value="existing">Use Existing</option>
                <option value="modify">Modify Existing</option>
                <option value="none">No Ductwork</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Zoning, smart thermostat, air quality, etc."
              value={formData.hvacSpecial}
              onChange={(e) => setFormData({ ...formData, hvacSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'framing':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Material Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.framingMaterial}
              onChange={(e) => setFormData({ ...formData, framingMaterial: e.target.value })}
            >
              <option value="">Select material...</option>
              <option value="wood-2x4">Wood 2x4</option>
              <option value="wood-2x6">Wood 2x6</option>
              <option value="steel">Steel Framing</option>
              <option value="engineered">Engineered Lumber</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Complexity</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.framingComplexity}
              onChange={(e) => setFormData({ ...formData, framingComplexity: e.target.value })}
            >
              <option value="standard">Standard</option>
              <option value="complex">Complex</option>
              <option value="custom">Custom Design</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Vaulted ceilings, load-bearing walls, etc."
              value={formData.framingSpecial}
              onChange={(e) => setFormData({ ...formData, framingSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'roofing':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Roofing Material</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.roofingMaterial}
              onChange={(e) => setFormData({ ...formData, roofingMaterial: e.target.value })}
            >
              <option value="">Select material...</option>
              <option value="asphalt-shingles">Asphalt Shingles</option>
              <option value="metal">Metal</option>
              <option value="tile">Tile</option>
              <option value="slate">Slate</option>
              <option value="flat-rubber">Flat/Rubber</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Roof Pitch</label>
              <Input
                placeholder="4/12, 6/12, etc."
                value={formData.roofingPitch}
                onChange={(e) => setFormData({ ...formData, roofingPitch: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Roof Size (sq ft)</label>
              <Input
                placeholder="2000"
                type="number"
                value={formData.roofingSize}
                onChange={(e) => setFormData({ ...formData, roofingSize: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Skylights, chimneys, valleys, etc."
              value={formData.roofingSpecial}
              onChange={(e) => setFormData({ ...formData, roofingSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'foundation':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Foundation Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.foundationType}
              onChange={(e) => setFormData({ ...formData, foundationType: e.target.value })}
            >
              <option value="">Select type...</option>
              <option value="slab">Slab</option>
              <option value="crawlspace">Crawlspace</option>
              <option value="full-basement">Full Basement</option>
              <option value="partial-basement">Partial Basement</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Foundation Size</label>
              <Input
                placeholder="30x40 ft"
                value={formData.foundationSize}
                onChange={(e) => setFormData({ ...formData, foundationSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Depth</label>
              <Input
                placeholder="4 ft"
                value={formData.foundationDepth}
                onChange={(e) => setFormData({ ...formData, foundationDepth: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Waterproofing, drainage, etc."
              value={formData.foundationSpecial}
              onChange={(e) => setFormData({ ...formData, foundationSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'drywall':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Area to Cover (sq ft)</label>
            <Input
              placeholder="2000"
              type="number"
              value={formData.drywallArea}
              onChange={(e) => setFormData({ ...formData, drywallArea: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Finish Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.drywallFinish}
              onChange={(e) => setFormData({ ...formData, drywallFinish: e.target.value })}
            >
              <option value="">Select finish...</option>
              <option value="level-1">Level 1 (Fire-rated)</option>
              <option value="level-2">Level 2 (Utility)</option>
              <option value="level-3">Level 3 (Light texture)</option>
              <option value="level-4">Level 4 (Flat paint)</option>
              <option value="level-5">Level 5 (Smooth finish)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Soundproofing, moisture-resistant, etc."
              value={formData.drywallSpecial}
              onChange={(e) => setFormData({ ...formData, drywallSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'flooring':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Flooring Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.flooringType}
              onChange={(e) => setFormData({ ...formData, flooringType: e.target.value })}
            >
              <option value="">Select type...</option>
              <option value="hardwood">Hardwood</option>
              <option value="laminate">Laminate</option>
              <option value="vinyl">Vinyl</option>
              <option value="tile">Tile</option>
              <option value="carpet">Carpet</option>
              <option value="concrete">Concrete</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Area (sq ft)</label>
            <Input
              placeholder="2000"
              type="number"
              value={formData.flooringArea}
              onChange={(e) => setFormData({ ...formData, flooringArea: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Underlayment, subfloor prep, etc."
              value={formData.flooringSpecial}
              onChange={(e) => setFormData({ ...formData, flooringSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'painting':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Area to Paint (sq ft)</label>
              <Input
                placeholder="2000"
                type="number"
                value={formData.paintingArea}
                onChange={(e) => setFormData({ ...formData, paintingArea: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Coats</label>
              <Input
                placeholder="2"
                type="number"
                value={formData.paintingCoats}
                onChange={(e) => setFormData({ ...formData, paintingCoats: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Primer needed, high ceilings, exterior, etc."
              value={formData.paintingSpecial}
              onChange={(e) => setFormData({ ...formData, paintingSpecial: e.target.value })}
            />
          </div>
        </div>
      );

    case 'construction':
      return (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              <strong>Full Construction Estimate:</strong> This will generate a comprehensive estimate covering all trades (foundation, framing, roofing, electrical, plumbing, HVAC, drywall, flooring, and painting).
            </p>
          </div>

          {isGarage ? (
            // Garage-specific fields
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Garage Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.garageType}
                    onChange={(e) => setFormData({ ...formData, garageType: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="detached">Detached</option>
                    <option value="attached">Attached</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Finish Level</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.garageFinished}
                    onChange={(e) => setFormData({ ...formData, garageFinished: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="unfinished">Unfinished (no insulation/drywall)</option>
                    <option value="insulated">Insulated Only</option>
                    <option value="finished">Fully Finished (insulated + drywalled)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foundation Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.foundationType}
                    onChange={(e) => setFormData({ ...formData, foundationType: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="slab">Concrete Slab</option>
                    <option value="frost-wall">Frost Wall</option>
                    <option value="full-foundation">Full Foundation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Garage Door Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.garageDoorSize}
                    onChange={(e) => setFormData({ ...formData, garageDoorSize: e.target.value })}
                  >
                    <option value="">Select size...</option>
                    <option value="single">Single (8-10 ft)</option>
                    <option value="double">Double (16 ft)</option>
                    <option value="both">Single + Double</option>
                    <option value="two-single">Two Single Doors</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roofing Material</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.roofingMaterial}
                  onChange={(e) => setFormData({ ...formData, roofingMaterial: e.target.value })}
                >
                  <option value="">Select material...</option>
                  <option value="asphalt-shingles">Asphalt Shingles</option>
                  <option value="metal">Metal</option>
                  <option value="match-house">Match Existing House</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Electrical Needed?</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.electricalSpecial}
                    onChange={(e) => setFormData({ ...formData, electricalSpecial: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="basic">Basic (lights + outlets)</option>
                    <option value="standard">Standard (+ 240V outlet)</option>
                    <option value="full">Full (+ subpanel, EV charger)</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">HVAC/Heating?</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.hvacSystemType}
                    onChange={(e) => setFormData({ ...formData, hvacSystemType: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="none">None</option>
                    <option value="space-heater">Space Heater</option>
                    <option value="radiant-floor">Radiant Floor</option>
                    <option value="mini-split">Mini-Split (Heat/Cool)</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            // House/Commercial-specific fields
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Construction Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.constructionType}
                    onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="new">New Construction</option>
                    <option value="renovation">Major Renovation</option>
                    <option value="addition">Addition</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Floors</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.numFloors}
                    onChange={(e) => setFormData({ ...formData, numFloors: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="1">1 Floor (Bungalow)</option>
                    <option value="1.5">1.5 Floors (Raised Bungalow)</option>
                    <option value="2">2 Floors</option>
                    <option value="3">3+ Floors</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Bedrooms</label>
                  <Input
                    placeholder="3"
                    type="number"
                    value={formData.numBedrooms}
                    onChange={(e) => setFormData({ ...formData, numBedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Bathrooms</label>
                  <Input
                    placeholder="2"
                    type="number"
                    value={formData.numBathrooms}
                    onChange={(e) => setFormData({ ...formData, numBathrooms: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foundation Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.foundationType}
                    onChange={(e) => setFormData({ ...formData, foundationType: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="slab">Concrete Slab</option>
                    <option value="crawlspace">Crawl Space</option>
                    <option value="full-basement">Full Basement</option>
                    <option value="walkout-basement">Walkout Basement</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">HVAC System</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.hvacSystemType}
                    onChange={(e) => setFormData({ ...formData, hvacSystemType: e.target.value })}
                  >
                    <option value="">Select system...</option>
                    <option value="forced-air">Forced Air (Gas/Electric)</option>
                    <option value="heat-pump">Heat Pump</option>
                    <option value="boiler">Boiler (Radiant)</option>
                    <option value="mini-split">Ductless Mini-Split</option>
                    <option value="geothermal">Geothermal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exterior Finish</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.exteriorFinish}
                    onChange={(e) => setFormData({ ...formData, exteriorFinish: e.target.value })}
                  >
                    <option value="">Select finish...</option>
                    <option value="vinyl-siding">Vinyl Siding</option>
                    <option value="fiber-cement">Fiber Cement (Hardie)</option>
                    <option value="brick">Brick</option>
                    <option value="stone">Stone</option>
                    <option value="stucco">Stucco</option>
                    <option value="mixed">Mixed Materials</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interior Finish Level</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.interiorFinishLevel}
                    onChange={(e) => setFormData({ ...formData, interiorFinishLevel: e.target.value })}
                  >
                    <option value="">Select level...</option>
                    <option value="builder-basic">Builder Basic</option>
                    <option value="standard">Standard</option>
                    <option value="upgraded">Upgraded</option>
                    <option value="luxury">Luxury/Custom</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roofing Material</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.roofingMaterial}
                  onChange={(e) => setFormData({ ...formData, roofingMaterial: e.target.value })}
                >
                  <option value="">Select material...</option>
                  <option value="asphalt-shingles">Asphalt Shingles</option>
                  <option value="metal">Metal</option>
                  <option value="tile">Tile</option>
                  <option value="slate">Slate</option>
                  <option value="cedar-shake">Cedar Shake</option>
                </select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Requirements or Special Features</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="Custom kitchen, accessibility features, solar panels, EV charging, smart home, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
