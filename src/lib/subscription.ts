// Subscription management utilities

export interface SubscriptionStatus {
  subscribedModules: string[];
  isDemoMode: Record<string, boolean>;
  demoExpiry: Record<string, number>;
}

export function getSubscriptionStatus(): SubscriptionStatus {
  if (typeof window === 'undefined') {
    return { subscribedModules: [], isDemoMode: {}, demoExpiry: {} };
  }

  const subscriptions = localStorage.getItem('bizoptimize_subscriptions');
  const subscribedModules = subscriptions ? JSON.parse(subscriptions) : [];

  // Check demo status for each module
  const isDemoMode: Record<string, boolean> = {};
  const demoExpiry: Record<string, number> = {};

  ['construction', 'trucking', 'restaurant'].forEach(moduleId => {
    const demoData = localStorage.getItem(`demo_${moduleId}`);
    if (demoData) {
      try {
        const demo = JSON.parse(demoData);
        const now = Date.now();
        if (now < demo.expiresAt) {
          isDemoMode[moduleId] = true;
          demoExpiry[moduleId] = demo.expiresAt;
        } else {
          // Demo expired, remove it
          localStorage.removeItem(`demo_${moduleId}`);
        }
      } catch (e) {
        // Invalid demo data, remove it
        localStorage.removeItem(`demo_${moduleId}`);
      }
    }
  });

  return { subscribedModules, isDemoMode, demoExpiry };
}

export function hasAccess(moduleId: string): boolean {
  const status = getSubscriptionStatus();
  return status.subscribedModules.includes(moduleId) || status.isDemoMode[moduleId] === true;
}

export function isSubscribed(moduleId: string): boolean {
  const status = getSubscriptionStatus();
  return status.subscribedModules.includes(moduleId);
}

export function isDemoActive(moduleId: string): boolean {
  const status = getSubscriptionStatus();
  return status.isDemoMode[moduleId] === true;
}

export function getDemoTimeRemaining(moduleId: string): number {
  const status = getSubscriptionStatus();
  const expiry = status.demoExpiry[moduleId];
  if (!expiry) return 0;
  const remaining = expiry - Date.now();
  return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
}

export function startDemo(moduleId: string): void {
  const demoData = {
    moduleId,
    startTime: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
  };
  localStorage.setItem(`demo_${moduleId}`, JSON.stringify(demoData));
}

export function subscribeToModule(moduleId: string): void {
  const subscriptions = localStorage.getItem('bizoptimize_subscriptions');
  const subscribedModules = subscriptions ? JSON.parse(subscriptions) : [];
  
  if (!subscribedModules.includes(moduleId)) {
    subscribedModules.push(moduleId);
    localStorage.setItem('bizoptimize_subscriptions', JSON.stringify(subscribedModules));
  }
  
  // Remove demo if exists
  localStorage.removeItem(`demo_${moduleId}`);
}

