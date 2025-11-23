// Module/App Management

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  category: 'construction' | 'trucking' | 'restaurant' | 'manufacturing' | 'retail' | 'service' | 'custom';
  status: 'active' | 'development' | 'disabled';
  features: string[];
  basePrice: number;
  color: string;
  bgColor: string;
  borderColor: string;
  createdAt: number;
  updatedAt: number;
}

const MODULES_STORAGE_KEY = 'bizoptimize_modules';

// Default modules
const DEFAULT_MODULES: Module[] = [
  {
    id: 'construction',
    name: 'Construction Estimator',
    description: 'AI-powered project estimation with building code compliance',
    icon: '🏗️',
    route: '/dashboard/modules/construction',
    category: 'construction',
    status: 'active',
    features: ['Cost Estimation', 'Material Optimization', 'Timeline Planning', 'Code Compliance'],
    basePrice: 99,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'trucking',
    name: 'Fleet Optimizer',
    description: 'Route optimization and fuel efficiency tracking',
    icon: '🚛',
    route: '/dashboard/modules/trucking',
    category: 'trucking',
    status: 'active',
    features: ['Route Optimization', 'Fuel Tracking', 'Maintenance Alerts', 'Driver Analytics'],
    basePrice: 99,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'restaurant',
    name: 'Restaurant Manager',
    description: 'Inventory optimization and waste reduction',
    icon: '🍽️',
    route: '/dashboard/modules/restaurant',
    category: 'restaurant',
    status: 'active',
    features: ['Inventory Management', 'Waste Reduction', 'Menu Optimization', 'Supplier Analysis'],
    basePrice: 99,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export function getModules(): Module[] {
  if (typeof window === 'undefined') return DEFAULT_MODULES;
  try {
    const stored = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!stored) {
      // Initialize with default modules
      saveModules(DEFAULT_MODULES);
      return DEFAULT_MODULES;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_MODULES;
  }
}

export function saveModules(modules: Module[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
}

export function addModule(module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>): Module {
  const modules = getModules();
  const newModule: Module = {
    ...module,
    id: module.name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  modules.push(newModule);
  saveModules(modules);
  return newModule;
}

export function updateModule(id: string, updates: Partial<Module>): void {
  const modules = getModules();
  const index = modules.findIndex(m => m.id === id);
  if (index !== -1) {
    modules[index] = {
      ...modules[index],
      ...updates,
      updatedAt: Date.now()
    };
    saveModules(modules);
  }
}

export function deleteModule(id: string): void {
  const modules = getModules().filter(m => m.id !== id);
  saveModules(modules);
}

export function getModule(id: string): Module | undefined {
  return getModules().find(m => m.id === id);
}

