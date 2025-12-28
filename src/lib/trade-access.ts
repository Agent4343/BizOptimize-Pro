// Trade access management for subscription-based access

export type Trade = 
  | 'electrical' 
  | 'plumbing' 
  | 'hvac' 
  | 'framing' 
  | 'roofing' 
  | 'foundation' 
  | 'drywall' 
  | 'flooring' 
  | 'painting'
  | 'construction'; // Full construction (all trades)

export interface TradeAccess {
  trade: Trade;
  name: string;
  description: string;
  icon: string;
  price: number; // Monthly price in CAD
  purchased: boolean;
}

// Trade definitions with pricing
export const TRADES: Record<Trade, Omit<TradeAccess, 'purchased'>> = {
  electrical: {
    trade: 'electrical',
    name: 'Electrical Estimator',
    description: 'Detailed electrical estimates with code compliance',
    icon: '⚡',
    price: 49, // $49/month
  },
  plumbing: {
    trade: 'plumbing',
    name: 'Plumbing Estimator',
    description: 'Complete plumbing estimates with material costs',
    icon: '🔧',
    price: 49,
  },
  hvac: {
    trade: 'hvac',
    name: 'HVAC Estimator',
    description: 'HVAC system estimates and sizing',
    icon: '❄️',
    price: 49,
  },
  framing: {
    trade: 'framing',
    name: 'Framing Estimator',
    description: 'Structural framing estimates',
    icon: '🏗️',
    price: 49,
  },
  roofing: {
    trade: 'roofing',
    name: 'Roofing Estimator',
    description: 'Roofing material and installation estimates',
    icon: '🏠',
    price: 49,
  },
  foundation: {
    trade: 'foundation',
    name: 'Foundation Estimator',
    description: 'Foundation and concrete estimates',
    icon: '🧱',
    price: 49,
  },
  drywall: {
    trade: 'drywall',
    name: 'Drywall Estimator',
    description: 'Drywall installation and finishing estimates',
    icon: '📐',
    price: 39,
  },
  flooring: {
    trade: 'flooring',
    name: 'Flooring Estimator',
    description: 'Flooring material and installation estimates',
    icon: '🪵',
    price: 39,
  },
  painting: {
    trade: 'painting',
    name: 'Painting Estimator',
    description: 'Interior and exterior painting estimates',
    icon: '🎨',
    price: 39,
  },
  construction: {
    trade: 'construction',
    name: 'Full Construction Estimator',
    description: 'Complete construction estimates (all trades)',
    icon: '🏗️',
    price: 299, // Discounted price for all trades
  },
};

// Get user's purchased trades (in production, this would come from database)
export function getPurchasedTrades(): Trade[] {
  // For demo: check sessionStorage or localStorage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('purchasedTrades');
    if (stored) {
      return JSON.parse(stored) as Trade[];
    }
  }
  // Default: grant all trades access for development/demo
  // In production, this would return [] and require purchase
  return ['construction'] as Trade[];
}

// Check if user has access to a specific trade
export function hasTradeAccess(trade: Trade): boolean {
  const purchased = getPurchasedTrades();
  // If they have 'construction', they have access to all trades
  if (purchased.includes('construction')) {
    return true;
  }
  return purchased.includes(trade);
}

// Get available trades (not purchased)
export function getAvailableTrades(): TradeAccess[] {
  const purchased = getPurchasedTrades();
  return Object.values(TRADES)
    .filter(trade => !purchased.includes(trade.trade))
    .map(trade => ({
      ...trade,
      purchased: false,
    }));
}

// Get purchased trades with details
export function getPurchasedTradesWithDetails(): TradeAccess[] {
  const purchased = getPurchasedTrades();
  return purchased
    .map(trade => ({
      ...TRADES[trade],
      purchased: true,
    }));
}

// Purchase a trade (in production, this would integrate with Stripe)
export function purchaseTrade(trade: Trade): void {
  const purchased = getPurchasedTrades();
  if (!purchased.includes(trade)) {
    purchased.push(trade);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('purchasedTrades', JSON.stringify(purchased));
    }
  }
}

