import type { UserProfile, CardItem, ActivityLog } from '../types';
import { SCHEMA_VERSION } from './constants';
import { makeInitials, generateId } from './utils';
import { hashPassword, generateSecureToken } from './security';

// ---------------------------------------------------------------------------
// Seed data tim PPKI yang sebenarnya
// ---------------------------------------------------------------------------
const SEED_USERS: UserProfile[] = [
  { id: 'u-akmal',  name: 'Akmal',  email: 'akmal@ppki.id',  role: 'admin',  avatar: 'AK', createdAt: '2026-10-01T08:00:00Z' },
  { id: 'u-aldy',   name: 'Aldy',   email: 'aldy@ppki.id',   role: 'member', avatar: 'AL', createdAt: '2026-10-01T08:05:00Z' },
  { id: 'u-dwitra', name: 'Dwitra', email: 'dwitra@ppki.id', role: 'member', avatar: 'DW', createdAt: '2026-10-01T08:10:00Z' },
  { id: 'u-kurni',  name: 'Kurni',  email: 'kurni@ppki.id',  role: 'member', avatar: 'KU', createdAt: '2026-10-01T08:15:00Z' },
  { id: 'u-satria', name: 'Satria', email: 'satria@ppki.id', role: 'member', avatar: 'SA', createdAt: '2026-10-01T08:20:00Z' },
];

const SEED_CARDS: CardItem[] = [
  {
    id: 'c-1', columnId: 'in_progress',
    title: 'Setup project repository & environment',
    description: 'Inisialisasi repo GitHub, konfigurasi .env, dan pastikan semua anggota bisa menjalankan proyek lokal.',
    assignedTo: ['u-akmal', 'u-aldy'], createdBy: 'u-akmal',
    deadline: '2026-10-23', labels: ['Sistem'],
    priority: 'high', orderIndex: 0,
    createdAt: '2026-10-18T09:00:00Z', updatedAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 'c-2', columnId: 'todo',
    title: 'Desain ulang halaman utama sesuai PRD',
    description: 'Buat wireframe baru sesuai feedback tim, lalu implementasikan ke kode React.',
    assignedTo: ['u-dwitra'], createdBy: 'u-akmal',
    deadline: '2026-10-25', labels: ['Desain', 'Frontend'],
    priority: 'high', orderIndex: 0,
    createdAt: '2026-10-19T10:00:00Z', updatedAt: '2026-10-19T10:00:00Z',
  },
  {
    id: 'c-3', columnId: 'todo',
    title: 'Integrasi API backend ke komponen kartu',
    description: 'Hubungkan endpoint REST API yang sudah tersedia dengan state management React.',
    assignedTo: ['u-kurni'], createdBy: 'u-akmal',
    deadline: '2026-10-27', labels: ['Frontend', 'Backend'],
    priority: 'medium', orderIndex: 1,
    createdAt: '2026-10-19T11:00:00Z', updatedAt: '2026-10-19T11:00:00Z',
  },
  {
    id: 'c-4', columnId: 'review',
    title: 'Implementasi sistem notifikasi email SMTP',
    description: 'Konfigurasi Nodemailer dengan Gmail App Password. Trigger saat kartu di-assign ke anggota.',
    assignedTo: ['u-satria'], createdBy: 'u-akmal',
    deadline: '2026-10-26', labels: ['Backend', 'Sistem'],
    priority: 'medium', orderIndex: 0,
    createdAt: '2026-10-17T11:00:00Z', updatedAt: '2026-10-20T16:00:00Z',
  },
  {
    id: 'c-5', columnId: 'done',
    title: 'Penyusunan PRD PPKI Progress Web',
    description: 'Finalisasi dokumen PRD dan distribusi ke seluruh anggota tim sebelum kickoff.',
    assignedTo: ['u-akmal'], createdBy: 'u-akmal',
    deadline: '2026-10-20', labels: ['Dokumen'],
    priority: 'low', orderIndex: 0,
    createdAt: '2026-10-10T08:00:00Z', updatedAt: '2026-10-20T17:00:00Z',
  },
];

const SEED_ACTIVITIES: ActivityLog[] = [
  { id: 'a-1', cardId: 'c-5', userId: 'u-akmal', userName: 'Akmal', action: 'memindahkan kartu ke Done', timestamp: '2026-10-20T17:00:00Z' },
  { id: 'a-2', cardId: 'c-4', userId: 'u-satria', userName: 'Satria', action: 'memindahkan kartu ke Review', timestamp: '2026-10-20T16:00:00Z' },
  { id: 'a-3', cardId: 'c-1', userId: 'u-akmal', userName: 'Akmal', action: 'memindahkan kartu ke In Progress', timestamp: '2026-10-18T09:30:00Z' },
];

// ---------------------------------------------------------------------------
// Storage keys & version guard
// ---------------------------------------------------------------------------
const KEYS = {
  VERSION:      'ppki_schema_version',
  USERS:        'ppki_users_v2',
  CARDS:        'ppki_cards_v2',
  ACTIVITIES:   'ppki_activities_v2',
  CURRENT_USER: 'ppki_current_user_v2',
  PASSWORD_HASHES: 'ppki_password_hashes_v2',
  SECURE_SESSION:  'ppki_secure_session_v2',
};

interface SecureSession {
  userId: string;
  token: string;
  expiresAt: number;
}

function migrateIfNeeded() {
  const stored = Number(localStorage.getItem(KEYS.VERSION) ?? 0);
  if (stored < SCHEMA_VERSION) {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(KEYS.VERSION, String(SCHEMA_VERSION));
  }
}

function safeParse<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const storage = {
  async init() {
    migrateIfNeeded();
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(KEYS.CARDS)) {
      localStorage.setItem(KEYS.CARDS, JSON.stringify(SEED_CARDS));
    }
    if (!localStorage.getItem(KEYS.ACTIVITIES)) {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
    }

    // Seed default password hashes if not initialized
    const existingHashes = this.getPasswordHashes();
    if (Object.keys(existingHashes).length === 0) {
      const defaultHash = await hashPassword('ppki1234');
      const seedMap: Record<string, string> = {};
      SEED_USERS.forEach((u) => {
        seedMap[u.id] = defaultHash;
      });
      this.savePasswordHashes(seedMap);
    }
  },

  getUsers:        (): UserProfile[] => safeParse(KEYS.USERS, SEED_USERS),
  saveUsers:       (u: UserProfile[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(u)),

  getCards:        (): CardItem[] => safeParse(KEYS.CARDS, SEED_CARDS),
  saveCards:       (c: CardItem[]) => localStorage.setItem(KEYS.CARDS, JSON.stringify(c)),

  getActivities:   (): ActivityLog[] => safeParse(KEYS.ACTIVITIES, SEED_ACTIVITIES),
  saveActivities:  (a: ActivityLog[]) => localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(a)),

  getPasswordHashes(): Record<string, string> {
    return safeParse(KEYS.PASSWORD_HASHES, {});
  },

  savePasswordHashes(map: Record<string, string>) {
    localStorage.setItem(KEYS.PASSWORD_HASHES, JSON.stringify(map));
  },

  async setUserPassword(userId: string, plainTextPassword: string) {
    const hashed = await hashPassword(plainTextPassword);
    const hashes = this.getPasswordHashes();
    hashes[userId] = hashed;
    this.savePasswordHashes(hashes);
  },

  async verifyUserPassword(userId: string, inputPassword: string): Promise<boolean> {
    const hashes = this.getPasswordHashes();
    const storedHash = hashes[userId];
    const inputHash = await hashPassword(inputPassword);

    if (storedHash) {
      return storedHash === inputHash;
    }

    // Fallback if user was created before hash table: check default ppki1234
    const defaultHash = await hashPassword('ppki1234');
    if (inputHash === defaultHash) {
      // Auto-upgrade user hash
      hashes[userId] = defaultHash;
      this.savePasswordHashes(hashes);
      return true;
    }

    return false;
  },

  createSession(userId: string): SecureSession {
    const session: SecureSession = {
      userId,
      token: generateSecureToken(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    localStorage.setItem(KEYS.SECURE_SESSION, JSON.stringify(session));
    return session;
  },

  getSession(): string | null {
    const raw = localStorage.getItem(KEYS.SECURE_SESSION);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as SecureSession;
      if (session.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }
      return session.userId;
    } catch {
      this.clearSession();
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(KEYS.SECURE_SESSION);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  addActivity(cardId: string, user: UserProfile, action: string): ActivityLog[] {
    const activities = this.getActivities();
    const entry: ActivityLog = {
      id: generateId('act'),
      cardId,
      userId: user.id,
      userName: user.name,
      action,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...activities.slice(0, 99)];
    this.saveActivities(updated);
    return updated;
  },

  canModify(card: CardItem, user: UserProfile): boolean {
    return user.role === 'admin' || card.createdBy === user.id;
  },

  async addUser(name: string, email: string, role: 'admin' | 'member', initialPassword = 'ppki1234'): Promise<UserProfile> {
    const users = this.getUsers();
    const newUser: UserProfile = {
      id: generateId('u'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatar: makeInitials(name),
      createdAt: new Date().toISOString(),
    };
    this.saveUsers([...users, newUser]);
    await this.setUserPassword(newUser.id, initialPassword);
    return newUser;
  },

  hardReset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.init();
  },
};
