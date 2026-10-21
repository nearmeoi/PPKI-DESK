import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  isValidEmail,
  sanitizeInput,
  sanitizeUrl,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  generateSecureToken,
} from '../lib/security';

describe('Security & Sanitization Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    resetLoginRateLimit();
  });

  describe('Password Hashing (Salted SHA-256 via Web Crypto API)', () => {
    it('generates consistent 64-character hex hash for the same input', async () => {
      const hash1 = await hashPassword('ppki1234');
      const hash2 = await hashPassword('ppki1234');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('generates completely different hashes for different passwords', async () => {
      const hashA = await hashPassword('password123');
      const hashB = await hashPassword('password124');
      expect(hashA).not.toBe(hashB);
    });
  });

  describe('Email Format Validation', () => {
    it('accepts valid RFC-compliant emails', () => {
      expect(isValidEmail('akmal@ppki.id')).toBe(true);
      expect(isValidEmail('aldy.dev@domain.co.id')).toBe(true);
      expect(isValidEmail('user+tag@sub.domain.com')).toBe(true);
    });

    it('rejects invalid or injection-prone emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('username@.com')).toBe(false);
      expect(isValidEmail('akmal<script>@ppki.id')).toBe(false);
    });
  });

  describe('Input Sanitization & Anti-XSS', () => {
    it('strips HTML tags and brackets', () => {
      const dangerous = '<script>alert("xss")</script>Tugas Penting';
      const clean = sanitizeInput(dangerous);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).toBe('alert("xss")Tugas Penting');
    });

    it('neutralizes pseudo-protocols', () => {
      const input = 'javascript:void(0)';
      expect(sanitizeInput(input)).toBe('void(0)');
    });
  });

  describe('URL Sanitization against URL Injection & Open Redirect', () => {
    it('allows valid https and http URLs', () => {
      expect(sanitizeUrl('https://ppki.id/dashboard')).toBe('https://ppki.id/dashboard');
      expect(sanitizeUrl('http://localhost:5173')).toBe('http://localhost:5173/');
    });

    it('allows safe relative paths', () => {
      expect(sanitizeUrl('/kanban')).toBe('/kanban');
      expect(sanitizeUrl('#filter')).toBe('#filter');
    });

    it('neutralizes malicious protocols', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });
  });

  describe('Brute-Force Protection & Rate Limiting', () => {
    it('allows initial login attempts and tracks remaining tries', () => {
      const initial = checkLoginRateLimit();
      expect(initial.isLocked).toBe(false);
      expect(initial.attemptsLeft).toBe(5);

      recordFailedLogin();
      const afterOne = checkLoginRateLimit();
      expect(afterOne.attemptsLeft).toBe(4);
    });

    it('locks out after 5 consecutive failed attempts', () => {
      for (let i = 0; i < 4; i++) {
        recordFailedLogin();
      }
      expect(checkLoginRateLimit().isLocked).toBe(false);

      const lockout = recordFailedLogin();
      expect(lockout.isLocked).toBe(true);
      expect(lockout.remainingSeconds).toBeGreaterThan(0);

      const status = checkLoginRateLimit();
      expect(status.isLocked).toBe(true);
      expect(status.attemptsLeft).toBe(0);
    });

    it('resets rate limit upon successful login', () => {
      recordFailedLogin();
      recordFailedLogin();
      resetLoginRateLimit();

      const fresh = checkLoginRateLimit();
      expect(fresh.isLocked).toBe(false);
      expect(fresh.attemptsLeft).toBe(5);
    });
  });

  describe('Cryptographic Session Tokens', () => {
    it('generates random hex tokens of 48 characters', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).toHaveLength(48);
      expect(token2).toHaveLength(48);
      expect(token1).not.toBe(token2);
    });
  });
});
