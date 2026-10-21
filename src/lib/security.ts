/**
 * Security & Sanitization Utilities for PPKI Progress Web
 * - Password cryptographic hashing via Web Crypto API (SHA-256)
 * - Anti-XSS and input sanitization
 * - Safe URL validation against URL/redirect injection
 * - Email format validation
 * - Brute-force rate limiting and login cooldown
 */

const SALT = 'ppki_progress_board_salt_2026_!';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
const RATE_LIMIT_KEY = 'ppki_rate_limit_v2';

/**
 * Hash password using browser native Web Crypto SHA-256 with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const text = `${SALT}:${password}`;
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates email format strictly according to standard RFC rules
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

/**
 * Strips script tags, HTML tags, and dangerous characters to prevent XSS injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // remove HTML tags
    .replace(/javascript:/gi, '') // prevent pseudo-protocols
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Sanitizes URLs to prevent open redirect and JavaScript/data URL injection
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous pseudo-protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#';
  }

  // Allow relative URLs starting with '/' or '#'
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '#';
  }

  return '#';
}

/**
 * Rate Limiter for Login Attempts
 */
interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
}

function getRateLimitState(): RateLimitState {
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return { attempts: 0, lockoutUntil: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockoutUntil: null };
  }
}

function saveRateLimitState(state: RateLimitState) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
}

export function checkLoginRateLimit(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
  const state = getRateLimitState();
  const now = Date.now();

  if (state.lockoutUntil && state.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      attemptsLeft: 0,
    };
  }

  // If lockout expired, reset
  if (state.lockoutUntil && state.lockoutUntil <= now) {
    saveRateLimitState({ attempts: 0, lockoutUntil: null });
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - state.attempts);
  return { isLocked: false, remainingSeconds: 0, attemptsLeft };
}

export function recordFailedLogin(): { isLocked: boolean; remainingSeconds: number } {
  const state = getRateLimitState();
  const now = Date.now();
  const newAttempts = state.attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    const lockoutUntil = now + LOCKOUT_DURATION_MS;
    saveRateLimitState({ attempts: newAttempts, lockoutUntil });
    return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  saveRateLimitState({ attempts: newAttempts, lockoutUntil: null });
  return { isLocked: false, remainingSeconds: 0 };
}

export function resetLoginRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

/**
 * Generates a cryptographically secure random session token
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
