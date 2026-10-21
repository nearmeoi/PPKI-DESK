import type { UserProfile, CardItem, ActivityLog, ProjectItem } from '../types';
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

const SEED_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-1',
    code: 'PRJ-01',
    title: 'Portal Web Utama PPKI 2026',
    description: 'Modernisasi platform web interaktif PPKI menggunakan arsitektur React SPA, navigasi timeline, dan papan progres pekerjaan terintegrasi.',
    status: 'in_progress',
    progress: 68,
    startDate: '2026-10-01',
    targetDate: '2026-11-15',
    leaderId: 'u-akmal',
    teamMembers: ['u-akmal', 'u-aldy', 'u-kurni'],
    tags: ['Web', 'Core', 'Frontend'],
    milestones: [
      { id: 'm-1', title: 'Penyusunan PRD dan User Stories', dueDate: '2026-10-10', completed: true },
      { id: 'm-2', title: 'Desain Sistem UI/UX Dominan Putih & Pastel Soft', dueDate: '2026-10-18', completed: true },
      { id: 'm-3', title: 'Implementasi Papan Kanban & Drag-and-Drop', dueDate: '2026-10-22', completed: true },
      { id: 'm-4', title: 'Pengembangan Menu Timeline & Manajemen Proyek', dueDate: '2026-10-28', completed: false },
      { id: 'm-5', title: 'Peluncuran Beta & UAT Tim PPKI', dueDate: '2026-11-15', completed: false },
    ],
    budgetEstimated: 'Internal Resource',
    notes: 'Prioritas utama tim pengembang web.',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'prj-2',
    code: 'PRJ-02',
    title: 'Infrastruktur Keamanan & Database Internal',
    description: 'Penerapan arsitektur otentikasi SHA-256, session token kriptografis, pencegahan injeksi URL, dan mekanisme proteksi brute-force.',
    status: 'in_progress',
    progress: 75,
    startDate: '2026-10-05',
    targetDate: '2026-11-05',
    leaderId: 'u-dwitra',
    teamMembers: ['u-dwitra', 'u-satria', 'u-akmal'],
    tags: ['Security', 'Backend', 'Database'],
    milestones: [
      { id: 'm-201', title: 'Perancangan Skema Data & Migrasi Terproteksi', dueDate: '2026-10-12', completed: true },
      { id: 'm-202', title: 'Implementasi Hash Kriptografis Salted SHA-256', dueDate: '2026-10-19', completed: true },
      { id: 'm-203', title: 'Rate Limiter & Sanitasi Input Anti-XSS', dueDate: '2026-10-21', completed: true },
      { id: 'm-204', title: 'Penetration Testing & Zero-Day Review', dueDate: '2026-11-05', completed: false },
    ],
    notes: 'Standar keamanan internal perusahaan.',
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-21T08:00:00Z',
  },
  {
    id: 'prj-3',
    code: 'PRJ-03',
    title: 'Sistem Spotlight Search & Navigasi Cepat',
    description: 'Fitur pencarian instan omnibox bergaya macOS Spotlight untuk menemukan kartu tugas, proyek, timeline, anggota, dan pintasan pengaturan aplikasi.',
    status: 'planning',
    progress: 40,
    startDate: '2026-10-15',
    targetDate: '2026-11-20',
    leaderId: 'u-aldy',
    teamMembers: ['u-aldy', 'u-kurni'],
    tags: ['Feature', 'UI/UX'],
    milestones: [
      { id: 'm-301', title: 'Perancangan Shortcut Keyboard Cmd+K / Ctrl+K', dueDate: '2026-10-22', completed: true },
      { id: 'm-302', title: 'Algoritma Pencarian Multi-Kategori Universal', dueDate: '2026-10-25', completed: false },
      { id: 'm-303', title: 'Integrasi Navigasi Langsung ke Modal dan View', dueDate: '2026-11-01', completed: false },
    ],
    notes: 'Meningkatkan efisiensi kerja tim secara signifikan.',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-21T08:00:00Z',
  },
  {
    id: 'prj-4',
    code: 'PRJ-04',
    title: 'Design System & Token Warna Pastel PPKI',
    description: 'Penyusunan standar antarmuka aplikasi dengan dominan putih bersih, kontras tinggi, dan warna pastel pembeda kolom tugas.',
    status: 'completed',
    progress: 100,
    startDate: '2026-10-01',
    targetDate: '2026-10-18',
    leaderId: 'u-kurni',
    teamMembers: ['u-kurni', 'u-aldy'],
    tags: ['Design', 'Brand'],
    milestones: [
      { id: 'm-401', title: 'Audit Komponen UI & Palet Warna', dueDate: '2026-10-05', completed: true },
      { id: 'm-402', title: 'Rancangan Kontainer Pastel & Mobile Layout', dueDate: '2026-10-12', completed: true },
      { id: 'm-403', title: 'Penerapan pada Komponen React & Tailwind', dueDate: '2026-10-18', completed: true },
    ],
    notes: 'Tahap 1 selesai dan telah diterapkan penuh.',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Storage keys & version guard
// ---------------------------------------------------------------------------
const KEYS = {
  VERSION:      'ppki_schema_version',
  USERS:        'ppki_users_v2',
  CARDS:        'ppki_cards_v2',
  ACTIVITIES:   'ppki_activities_v2',
  PROJECTS:     'ppki_projects_v2',
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
    if (!localStorage.getItem(KEYS.PROJECTS)) {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
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

  getProjects(): ProjectItem[] {
    return safeParse(KEYS.PROJECTS, SEED_PROJECTS);
  },

  saveProjects(p: ProjectItem[]) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(p));
  },

  addProject(data: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): ProjectItem {
    const list = this.getProjects();
    const newProject: ProjectItem = {
      ...data,
      id: generateId('prj'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProject, ...list];
    this.saveProjects(updated);
    return newProject;
  },

  updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem[] {
    const list = this.getProjects();
    const updated = list.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    this.saveProjects(updated);
    return updated;
  },

  deleteProject(id: string): ProjectItem[] {
    const list = this.getProjects();
    const updated = list.filter((p) => p.id !== id);
    this.saveProjects(updated);
    return updated;
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

  updateUser(userId: string, data: Partial<UserProfile>): UserProfile[] {
    const users = this.getUsers();
    const updated = users.map((u) => {
      if (u.id === userId) {
        const next = { ...u, ...data };
        if (data.name) next.avatar = makeInitials(data.name);
        return next;
      }
      return u;
    });
    this.saveUsers(updated);
    return updated;
  },

  deleteUser(userId: string): UserProfile[] {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
    return users;
  },

  hardReset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.init();
  },
};
