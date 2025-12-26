// Type definitions for construction estimator

export interface ConstructionFormData {
  projectName: string;
  projectType: string;
  squareFootage: string;
  location: string;
  province: string;
  description: string;
  // Electrical
  electricalPanelSize: string;
  electricalCircuits: string;
  electricalOutlets: string;
  electricalSwitches: string;
  electricalLighting: string;
  electricalSpecial: string;
  // Plumbing
  plumbingFixtures: string;
  plumbingWaterHeater: string;
  plumbingDrains: string;
  plumbingSpecial: string;
  // HVAC
  hvacSystemType: string;
  hvacCapacity: string;
  hvacDuctwork: string;
  hvacSpecial: string;
  // Framing
  framingMaterial: string;
  framingComplexity: string;
  framingSpecial: string;
  // Roofing
  roofingMaterial: string;
  roofingPitch: string;
  roofingSize: string;
  roofingSpecial: string;
  // Foundation
  foundationType: string;
  foundationSize: string;
  foundationDepth: string;
  foundationSpecial: string;
  // Drywall
  drywallArea: string;
  drywallFinish: string;
  drywallSpecial: string;
  // Flooring
  flooringType: string;
  flooringArea: string;
  flooringSpecial: string;
  // Painting
  paintingArea: string;
  paintingCoats: string;
  paintingSpecial: string;
  // General
  existingConditions: string;
  accessIssues: string;
  timeline: string;
  // Full Construction
  constructionType: string;  // new construction, renovation, addition
  numFloors: string;
  numBedrooms: string;
  numBathrooms: string;
  exteriorFinish: string;
  interiorFinishLevel: string;
  hasGeneralContractor: string;
  garageType: string;  // detached, attached
  garageFinished: string;  // finished, unfinished
  garageDoorSize: string;
}

export interface BasicInfo {
  projectType: string;
  location: string;
  squareFootage: string;
  projectName: string;
  province: string;
}

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
}

export const INITIAL_FORM_DATA: ConstructionFormData = {
  projectName: "",
  projectType: "",
  squareFootage: "",
  location: "",
  province: "",
  description: "",
  // Electrical
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
  timeline: "",
  // Full Construction
  constructionType: "",
  numFloors: "",
  numBedrooms: "",
  numBathrooms: "",
  exteriorFinish: "",
  interiorFinishLevel: "",
  hasGeneralContractor: "",
  garageType: "",
  garageFinished: "",
  garageDoorSize: "",
};
