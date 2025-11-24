"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasTradeAccess, TRADES, type Trade } from "@/lib/trade-access";
import { validateConstructionForm, validateSquareFootage, validateLocation, validateProjectType } from "@/lib/validation";
import Link from "next/link";

// Helper function to get trade-specific prompt
function getTradeSpecificPrompt(trade: string, formData: any): string {
  switch(trade.toLowerCase()) {
    case 'electrical':
      return `Electrical Details:
- Panel Size: ${formData.electricalPanelSize || 'Not specified'}
- Number of Circuits: ${formData.electricalCircuits || 'Not specified'}
- Outlets: ${formData.electricalOutlets || 'Not specified'}
- Switches: ${formData.electricalSwitches || 'Not specified'}
- Lighting Fixtures: ${formData.electricalLighting || 'Not specified'}
- Special Requirements: ${formData.electricalSpecial || 'None'}`;
    
    case 'plumbing':
      return `Plumbing Details:
- Number of Fixtures: ${formData.plumbingFixtures || 'Not specified'}
- Water Heater Type: ${formData.plumbingWaterHeater || 'Not specified'}
- Drains/Water Lines: ${formData.plumbingDrains || 'Not specified'}
- Special Requirements: ${formData.plumbingSpecial || 'None'}`;
    
    case 'hvac':
      return `HVAC Details:
- System Type: ${formData.hvacSystemType || 'Not specified'}
- Capacity (BTU/Tons): ${formData.hvacCapacity || 'Not specified'}
- Ductwork Required: ${formData.hvacDuctwork || 'Not specified'}
- Special Requirements: ${formData.hvacSpecial || 'None'}`;
    
    case 'framing':
      return `Framing Details:
- Material Type: ${formData.framingMaterial || 'Not specified'}
- Complexity: ${formData.framingComplexity || 'Standard'}
- Special Requirements: ${formData.framingSpecial || 'None'}`;
    
    case 'roofing':
      return `Roofing Details:
- Material: ${formData.roofingMaterial || 'Not specified'}
- Pitch: ${formData.roofingPitch || 'Not specified'}
- Roof Size: ${formData.roofingSize || 'Not specified'}
- Special Requirements: ${formData.roofingSpecial || 'None'}`;
    
    case 'foundation':
      return `Foundation Details:
- Foundation Type: ${formData.foundationType || 'Not specified'}
- Size: ${formData.foundationSize || 'Not specified'}
- Depth: ${formData.foundationDepth || 'Not specified'}
- Special Requirements: ${formData.foundationSpecial || 'None'}`;
    
    case 'drywall':
      return `Drywall Details:
- Area to Cover: ${formData.drywallArea || 'Not specified'} sq ft
- Finish Level: ${formData.drywallFinish || 'Not specified'}
- Special Requirements: ${formData.drywallSpecial || 'None'}`;
    
    case 'flooring':
      return `Flooring Details:
- Flooring Type: ${formData.flooringType || 'Not specified'}
- Area: ${formData.flooringArea || 'Not specified'} sq ft
- Special Requirements: ${formData.flooringSpecial || 'None'}`;
    
    case 'painting':
      return `Painting Details:
- Area to Paint: ${formData.paintingArea || 'Not specified'} sq ft
- Number of Coats: ${formData.paintingCoats || '2'}
- Special Requirements: ${formData.paintingSpecial || 'None'}`;
    
    default:
      return '';
  }
}

// Render trade-specific form fields
function renderTradeSpecificFields(trade: string, formData: any, setFormData: any) {
  const isGarage = formData.projectType === 'garage';
  const isHouse = formData.projectType === 'house';
  
  switch(trade.toLowerCase()) {
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
                onChange={(e) => setFormData({...formData, electricalPanelSize: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Circuits</label>
              <Input
                placeholder="20"
                type="number"
                value={formData.electricalCircuits}
                onChange={(e) => setFormData({...formData, electricalCircuits: e.target.value})}
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
                onChange={(e) => setFormData({...formData, electricalOutlets: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Switches</label>
              <Input
                placeholder="15"
                type="number"
                value={formData.electricalSwitches}
                onChange={(e) => setFormData({...formData, electricalSwitches: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lighting Fixtures</label>
            <Input
              placeholder="Recessed, pendant, chandelier, etc."
              value={formData.electricalLighting}
              onChange={(e) => setFormData({...formData, electricalLighting: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="EV charger, generator, smart home, etc."
              value={formData.electricalSpecial}
              onChange={(e) => setFormData({...formData, electricalSpecial: e.target.value})}
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
                onChange={(e) => setFormData({...formData, plumbingFixtures: e.target.value})}
              />
            </div>
          )}
          {isGarage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Garages typically don't require plumbing fixtures. If you need water service for a utility sink or other use, please specify in "Special Requirements" below.
              </p>
            </div>
          )}
          {!isGarage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Water Heater Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.plumbingWaterHeater}
                onChange={(e) => setFormData({...formData, plumbingWaterHeater: e.target.value})}
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
              onChange={(e) => setFormData({...formData, plumbingDrains: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Garbage disposal, water softener, etc."
              value={formData.plumbingSpecial}
              onChange={(e) => setFormData({...formData, plumbingSpecial: e.target.value})}
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
                <strong>Note:</strong> Garages typically don't require full HVAC systems. If you need heating/cooling, specify the type below.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">System Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.hvacSystemType}
              onChange={(e) => setFormData({...formData, hvacSystemType: e.target.value})}
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
                onChange={(e) => setFormData({...formData, hvacCapacity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ductwork Required</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.hvacDuctwork}
                onChange={(e) => setFormData({...formData, hvacDuctwork: e.target.value})}
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
              onChange={(e) => setFormData({...formData, hvacSpecial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, framingMaterial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, framingComplexity: e.target.value})}
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
              onChange={(e) => setFormData({...formData, framingSpecial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, roofingMaterial: e.target.value})}
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
                onChange={(e) => setFormData({...formData, roofingPitch: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Roof Size (sq ft)</label>
              <Input
                placeholder="2000"
                type="number"
                value={formData.roofingSize}
                onChange={(e) => setFormData({...formData, roofingSize: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Skylights, chimneys, valleys, etc."
              value={formData.roofingSpecial}
              onChange={(e) => setFormData({...formData, roofingSpecial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, foundationType: e.target.value})}
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
                onChange={(e) => setFormData({...formData, foundationSize: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Depth</label>
              <Input
                placeholder="4 ft"
                value={formData.foundationDepth}
                onChange={(e) => setFormData({...formData, foundationDepth: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Waterproofing, drainage, etc."
              value={formData.foundationSpecial}
              onChange={(e) => setFormData({...formData, foundationSpecial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, drywallArea: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Finish Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.drywallFinish}
              onChange={(e) => setFormData({...formData, drywallFinish: e.target.value})}
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
              onChange={(e) => setFormData({...formData, drywallSpecial: e.target.value})}
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
              onChange={(e) => setFormData({...formData, flooringType: e.target.value})}
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
              onChange={(e) => setFormData({...formData, flooringArea: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Underlayment, subfloor prep, etc."
              value={formData.flooringSpecial}
              onChange={(e) => setFormData({...formData, flooringSpecial: e.target.value})}
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
                onChange={(e) => setFormData({...formData, paintingArea: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Coats</label>
              <Input
                placeholder="2"
                type="number"
                value={formData.paintingCoats}
                onChange={(e) => setFormData({...formData, paintingCoats: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Primer needed, high ceilings, exterior, etc."
              value={formData.paintingSpecial}
              onChange={(e) => setFormData({...formData, paintingSpecial: e.target.value})}
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
}

function ConstructionPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const [selectedTrade, setSelectedTrade] = useState<string>(searchParams?.get('trade') || "");
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  
  // Conversational flow state
  const [conversationMode, setConversationMode] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [isReadyToEstimate, setIsReadyToEstimate] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    projectType: "",
    location: "",
    squareFootage: "",
    projectName: "",
    province: ""
  });

  useEffect(() => {
    if (selectedTrade) {
      setHasAccess(hasTradeAccess(selectedTrade as Trade));
    }
  }, [selectedTrade]);

  // Start conversation flow
  const startConversation = async () => {
    // Sync formData to basicInfo for conversation flow
    setBasicInfo({
      projectName: formData.projectName,
      projectType: formData.projectType,
      location: formData.location,
      squareFootage: formData.squareFootage,
      province: formData.province
    });
    
    // Validate inputs
    const validation = validateConstructionForm({
      projectType: formData.projectType,
      location: formData.location,
      squareFootage: formData.squareFootage,
      trade: selectedTrade,
      province: formData.province
    });
    
    if (!validation.valid) {
      alert(`Please fix the following errors:\n\n${validation.errors.join('\n')}`);
      return;
    }
    
    setConversationMode(true);
    setConversation([]);
    setIsReadyToEstimate(false);
    
    // Get first question
    await getNextQuestion();
  };

  // Get next question from AI
  const getNextQuestion = async (answer?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade: selectedTrade,
          conversation: conversation,
          currentAnswer: answer || currentAnswer,
          projectType: basicInfo.projectType,
          location: basicInfo.location,
          squareFootage: basicInfo.squareFootage
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.ready) {
          setIsReadyToEstimate(true);
          setCurrentQuestion("");
          // Generate estimate with all collected info
          await generateEstimateFromConversation(data.conversation);
        } else {
          setCurrentQuestion(data.question);
          setConversation(data.conversation);
        }
      }
    } catch (error) {
      console.error('Error getting question:', error);
      setCurrentQuestion('Error generating question. Please try again.');
    } finally {
      setLoading(false);
      setCurrentAnswer("");
    }
  };

  // Submit answer and get next question
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newConversation = [...conversation, 
      { role: 'assistant', content: currentQuestion },
      { role: 'user', content: currentAnswer }
    ];
    setConversation(newConversation);
    await getNextQuestion(currentAnswer);
  };

  // Generate final estimate from conversation
  const generateEstimateFromConversation = async (finalConversation: any[]) => {
    setLoading(true);
    try {
      // Build prompt from conversation
      const conversationText = finalConversation
        .map((msg: any) => `${msg.role === 'assistant' ? 'Q' : 'A'}: ${msg.content}`)
        .join('\n');

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Trade-specific construction estimate:
Selected Trade: ${selectedTrade}
Project Name: ${basicInfo.projectName || formData.projectName || 'Unnamed Project'}
Project Type: ${basicInfo.projectType || formData.projectType}
Location: ${basicInfo.location || formData.location}
Province: ${basicInfo.province || formData.province}
Square Footage: ${basicInfo.squareFootage || formData.squareFootage} sq ft

Conversation Details:
${conversationText}

Generate a detailed estimate ONLY for the ${selectedTrade} trade with complete line-item breakdown based on all the information gathered.`,
          businessType: 'construction',
          optimizationType: 'estimate',
          trade: selectedTrade
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setTotalCost(data.totalCost || 0);
        setSavings(data.estimatedSavings || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error generating estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    squareFootage: "",
    location: "",
    province: "",
    description: "",
    // Trade-specific fields
    electricalPanelSize: "",
    electricalCircuits: "",
    electricalOutlets: "",
    electricalSwitches: "",
    electricalLighting: "",
    electricalSpecial: "",
    // Plumbing
    plumbingFixtures: "",
    plumbingWaterHeater: "",
    plumbingDrains: "",
    plumbingSpecial: "",
    // HVAC
    hvacSystemType: "",
    hvacCapacity: "",
    hvacDuctwork: "",
    hvacSpecial: "",
    // Framing
    framingMaterial: "",
    framingComplexity: "",
    framingSpecial: "",
    // Roofing
    roofingMaterial: "",
    roofingPitch: "",
    roofingSize: "",
    roofingSpecial: "",
    // Foundation
    foundationType: "",
    foundationSize: "",
    foundationDepth: "",
    foundationSpecial: "",
    // Drywall
    drywallArea: "",
    drywallFinish: "",
    drywallSpecial: "",
    // Flooring
    flooringType: "",
    flooringArea: "",
    flooringSpecial: "",
    // Painting
    paintingArea: "",
    paintingCoats: "",
    paintingSpecial: "",
    // General
    existingConditions: "",
    accessIssues: "",
    timeline: ""
  });

  const generateEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Trade-specific construction estimate:
Selected Trade: ${selectedTrade}
Project Name: ${formData.projectName || 'Unnamed Project'}
Project Type: ${formData.projectType || 'Not specified'} ${formData.projectType === 'garage' ? '(This is a GARAGE build, not a house. Adjust questions and pricing accordingly.)' : ''}
Location: ${formData.location || 'Not specified'}
Province: ${formData.province || 'Not specified'}
Square Footage: ${formData.squareFootage || 'N/A'} sq ft
${getTradeSpecificPrompt(selectedTrade, formData)}
Existing Conditions: ${formData.existingConditions || 'New construction'}
Access Issues: ${formData.accessIssues || 'None'}
Timeline: ${formData.timeline || 'Standard'}
Additional Notes: ${formData.description || 'None'}

IMPORTANT: This is a ${formData.projectType === 'garage' ? 'GARAGE' : formData.projectType === 'house' ? 'HOUSE/RESIDENTIAL HOME' : formData.projectType.toUpperCase()} project. Generate a detailed estimate ONLY for the ${selectedTrade} trade with complete line-item breakdown appropriate for this project type.`,
          businessType: 'construction',
          optimizationType: 'estimate',
          trade: selectedTrade
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setTotalCost(data.totalCost || 0);
        setSavings(data.estimatedSavings || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error generating estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white">🏗️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {selectedTrade 
                    ? `${selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)} Estimator`
                    : 'Construction Estimator'}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedTrade 
                    ? `Detailed ${selectedTrade} estimates with line-item breakdowns and code compliance`
                    : 'Detailed estimates with line-item breakdowns for all construction trades'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTrade 
                  ? `${selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)} Project Details`
                  : 'Project Details'}
              </CardTitle>
              <CardDescription>
                {selectedTrade 
                  ? `Enter your ${selectedTrade} project information for accurate estimation`
                  : 'Enter your project information for accurate estimation'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Access Check */}
              {selectedTrade && !hasAccess && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔒</span>
                    <h3 className="font-semibold">Trade Not Purchased</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    You need to purchase access to the {selectedTrade} estimator to use this feature.
                  </p>
                  <Link href={`/dashboard/pricing?trade=${selectedTrade}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Purchase {selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)} Estimator
                    </Button>
                  </Link>
                </div>
              )}

              {/* Trade Selection - Only show if no trade selected */}
              {!selectedTrade && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Trade *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedTrade}
                    onChange={(e) => {
                      setSelectedTrade(e.target.value);
                      setHasAccess(hasTradeAccess(e.target.value as Trade));
                    }}
                  >
                    <option value="">Select a trade...</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="framing">Framing</option>
                    <option value="roofing">Roofing</option>
                    <option value="foundation">Foundation</option>
                    <option value="drywall">Drywall</option>
                    <option value="flooring">Flooring</option>
                    <option value="painting">Painting</option>
                  </select>
                </div>
              )}

              {/* Trade Display - Show selected trade */}
              {selectedTrade && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TRADES[selectedTrade as Trade]?.icon || '⚡'}</span>
                      <div>
                        <div className="font-semibold text-blue-900">
                          {TRADES[selectedTrade as Trade]?.name || selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1) + ' Estimator'}
                        </div>
                        <div className="text-xs text-blue-700">
                          {TRADES[selectedTrade as Trade]?.description || 'Trade-specific estimate'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTrade("");
                        setHasAccess(false);
                        setConversationMode(false);
                        setConversation([]);
                      }}
                    >
                      Change Trade
                    </Button>
                  </div>
                </div>
              )}

              {/* Basic Info - Only show when starting conversation OR as part of unified form */}
              {!conversationMode && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Project Information *</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Name</label>
                      <Input
                        placeholder="Smith Family Garage"
                        value={formData.projectName}
                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Type *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.projectType}
                        onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                        required
                      >
                        <option value="">Select project type...</option>
                        <option value="garage">Garage</option>
                        <option value="house">House / Residential Home</option>
                        <option value="commercial">Commercial Building</option>
                        <option value="addition">Addition / Extension</option>
                        <option value="renovation">Renovation / Remodel</option>
                        <option value="repair">Repair / Maintenance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Square Footage *</label>
                      <Input
                        placeholder="600"
                        type="number"
                        min="50"
                        max="100000"
                        value={formData.squareFootage}
                        onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                      />
                      <p className="text-xs text-gray-500">Minimum: 50 sq ft, Maximum: 100,000 sq ft</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City/Location *</label>
                      <Input
                        placeholder="St. John's"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                      <p className="text-xs text-gray-500">Enter city or location name</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Province/Territory *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        required
                      >
                        <option value="">Select province/territory...</option>
                        {PROVINCES_AND_TERRITORIES.map((province) => (
                          <option key={province.value} value={province.value}>
                            {province.label} ({province.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Required for accurate code compliance and pricing</p>
                    </div>
                    <Button 
                      onClick={startConversation}
                      disabled={!formData.projectType || !formData.location || !formData.squareFootage || !formData.province || !selectedTrade || !hasAccess}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      💬 Start Question Flow for Accurate Quote
                    </Button>
                  </div>
                </div>
              )}

              {/* Basic Info for Conversation Mode - Sync with formData */}
              {conversationMode && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Project Information</h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                    <div><strong>Project:</strong> {basicInfo.projectName || formData.projectName || 'Unnamed'}</div>
                    <div><strong>Type:</strong> {basicInfo.projectType || formData.projectType || 'Not specified'}</div>
                    <div><strong>Size:</strong> {basicInfo.squareFootage || formData.squareFootage || 'N/A'} sq ft</div>
                    <div><strong>Location:</strong> {basicInfo.location || formData.location || 'Not specified'}</div>
                    <div><strong>Province:</strong> {basicInfo.province || formData.province || 'Not specified'}</div>
                  </div>
                </div>
              )}

              {/* Conversational Q&A Flow */}
              {conversationMode && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3">Answer Questions for Accurate Quote</h3>
                  
                  {/* Conversation History */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {conversation.map((msg: any, idx: number) => (
                      <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'assistant' 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'bg-green-100 text-green-900'
                        }`}>
                          <div className="text-xs font-semibold mb-1">
                            {msg.role === 'assistant' ? '🤖 Assistant' : '👤 You'}
                          </div>
                          <div className="text-sm">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Question */}
                  {currentQuestion && !isReadyToEstimate && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-2">Current Question:</div>
                      <div className="text-base text-blue-800">{currentQuestion}</div>
                    </div>
                  )}

                  {/* Answer Input */}
                  {!isReadyToEstimate && currentQuestion && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Answer:</label>
                      <Input
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitAnswer();
                          }
                        }}
                        disabled={loading}
                      />
                      <Button 
                        onClick={submitAnswer}
                        disabled={loading || !currentAnswer.trim()}
                        className="w-full"
                      >
                        {loading ? 'Getting Next Question...' : 'Submit Answer →'}
                      </Button>
                    </div>
                  )}

                  {/* Ready to Estimate */}
                  {isReadyToEstimate && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-semibold text-green-900 mb-2">✓ Ready to Generate Estimate</div>
                      <div className="text-sm text-green-700 mb-3">
                        We have all the information needed. Generating your estimate...
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => {
                      setConversationMode(false);
                      setConversation([]);
                      setCurrentQuestion("");
                      setIsReadyToEstimate(false);
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    ← Back to Form Mode
                  </Button>
                </div>
              )}

              {/* Trade-Specific Questions - Only show when not in conversation mode */}
              {!conversationMode && (
                <>
              {/* Trade-Specific Questions */}
              {selectedTrade && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">{selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)} Trade Details</h3>
                  {renderTradeSpecificFields(selectedTrade, formData, setFormData)}
                </div>
              )}

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Existing Conditions</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                      placeholder="Describe existing conditions, what's already in place, etc."
                      value={formData.existingConditions}
                      onChange={(e) => setFormData({...formData, existingConditions: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Access Issues</label>
                    <Input
                      placeholder="Stairs, tight spaces, etc."
                      value={formData.accessIssues}
                      onChange={(e) => setFormData({...formData, accessIssues: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeline</label>
                    <Input
                      placeholder="Standard, Rush, Flexible"
                      value={formData.timeline}
                      onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Any other relevant information..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Generate Estimate Button - Only show in form mode */}
              {!conversationMode && (
                <Button 
                  onClick={generateEstimate} 
                  disabled={loading || !selectedTrade || !formData.location || !formData.projectType || !formData.province || !hasAccess}
                  className="w-full"
                >
                  {loading ? 'Generating Estimate...' : hasAccess ? `Generate ${selectedTrade ? selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1) : ''} Estimate` : 'Purchase Required'}
                </Button>
              )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTrade 
                  ? `${selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)} Estimate Results`
                  : 'Estimate Results'}
              </CardTitle>
              <CardDescription>
                {selectedTrade 
                  ? `AI-generated ${selectedTrade} estimate with cost optimization and code compliance`
                  : 'AI-generated construction estimate with cost optimization'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalCost > 0 ? `$${totalCost.toLocaleString()}` : 'Calculating...'}
                      </div>
                      <div className="text-sm text-gray-600">Total Project Cost</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {savings > 0 ? `$${savings.toLocaleString()}` : 'Calculating...'}
                      </div>
                      <div className="text-sm text-gray-600">Potential Savings</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                  </div>
                  <Button variant="outline" className="w-full">
                    📄 Export Estimate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate Estimate</h3>
                  <p className="text-gray-600">
                    Fill out the project details to generate a detailed construction estimate with complete line-item breakdowns for all trades.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ConstructionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🏗️</div>
          <p className="text-gray-600">Loading estimator...</p>
        </div>
      </div>
    }>
      <ConstructionPageContent />
    </Suspense>
  );
}