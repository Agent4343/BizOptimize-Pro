// API Key Management

export interface APIKey {
  id: string;
  name: string;
  service: 'openai' | 'anthropic' | 'openrouter' | 'custom';
  key: string;
  isActive: boolean;
  createdAt: number;
  lastUsed?: number;
}

const API_KEYS_STORAGE_KEY = 'bizoptimize_api_keys';

export function getAPIKeys(): APIKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveAPIKeys(keys: APIKey[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export function addAPIKey(key: APIKey): void {
  const keys = getAPIKeys();
  keys.push(key);
  saveAPIKeys(keys);
}

export function updateAPIKey(id: string, updates: Partial<APIKey>): void {
  const keys = getAPIKeys();
  const index = keys.findIndex(k => k.id === id);
  if (index !== -1) {
    keys[index] = { ...keys[index], ...updates };
    saveAPIKeys(keys);
  }
}

export function deleteAPIKey(id: string): void {
  const keys = getAPIKeys().filter(k => k.id !== id);
  saveAPIKeys(keys);
}

export function getActiveAPIKey(service: APIKey['service']): APIKey | null {
  const keys = getAPIKeys();
  return keys.find(k => k.service === service && k.isActive) || null;
}

export function maskAPIKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

