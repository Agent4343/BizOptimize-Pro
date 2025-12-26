// Input sanitization utilities to prevent prompt injection and XSS

/**
 * Sanitize user input for inclusion in AI prompts
 * Removes/escapes potential prompt injection patterns
 */
export function sanitizeForPrompt(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
    /disregard\s+(previous|above|all)/gi,
    /forget\s+(everything|all|previous)/gi,
    /new\s+instructions?:/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /user\s*:/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /<<SYS>>/gi,
    /<\/SYS>/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }

  // Limit length to prevent token stuffing
  const MAX_INPUT_LENGTH = 5000;
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH) + '... [truncated]';
  }

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s{10,}/g, ' ');

  // Remove null bytes and other control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Sanitize object values recursively for AI prompt inclusion
 */
export function sanitizeObjectForPrompt<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeForPrompt(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObjectForPrompt(value as Record<string, unknown>);
    } else {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number | undefined,
  options: { min?: number; max?: number; default?: number } = {}
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, default: defaultValue = 0 } = options;

  if (input === undefined || input === null || input === '') {
    return defaultValue;
  }

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num)) {
    return defaultValue;
  }

  return Math.max(min, Math.min(max, num));
}

/**
 * Validate province input against allowed values
 */
export function sanitizeProvince(input: string): string {
  const validProvinces = [
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Prince Edward Island',
    'New Brunswick',
    'Quebec',
    'Ontario',
    'Manitoba',
    'Saskatchewan',
    'Alberta',
    'British Columbia',
    'Yukon',
    'Northwest Territories',
    'Nunavut',
  ];

  const sanitized = sanitizeForPrompt(input);

  // Check if it's a valid province
  if (validProvinces.includes(sanitized)) {
    return sanitized;
  }

  // Try case-insensitive match
  const match = validProvinces.find(
    (p) => p.toLowerCase() === sanitized.toLowerCase()
  );

  return match || 'Canada';
}

/**
 * Validate trade input against allowed values
 */
export function sanitizeTrade(input: string): string {
  const validTrades = [
    'electrical',
    'plumbing',
    'hvac',
    'framing',
    'roofing',
    'foundation',
    'drywall',
    'flooring',
    'painting',
    'construction',
  ];

  const sanitized = sanitizeForPrompt(input).toLowerCase();

  if (validTrades.includes(sanitized)) {
    return sanitized;
  }

  return '';
}

/**
 * Validate project type input
 */
export function sanitizeProjectType(input: string): string {
  const validTypes = [
    'garage',
    'house',
    'commercial',
    'addition',
    'renovation',
    'repair',
  ];

  const sanitized = sanitizeForPrompt(input).toLowerCase();

  if (validTypes.includes(sanitized)) {
    return sanitized;
  }

  return '';
}
