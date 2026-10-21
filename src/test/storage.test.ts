import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../lib/storage';
import type { CardItem } from '../types';

describe('Storage & Business Logic Test Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await storage.init();
  });

  describe('Team Users & Initialization', () => {
    it('initializes the 5 core PPKI team members', () => {
      const users = storage.getUsers();
      expect(users).toHaveLength(5);

      const names = users.map((u) => u.name);
      expect(names).toContain('Akmal');
      expect(names).toContain('Aldy');
      expect(names).toContain('Dwitra');
      expect(names).toContain('Kurni');
      expect(names).toContain('Satria');

      const adminUser = users.find((u) => u.role === 'admin');
      expect(adminUser?.name).toBe('Akmal');
    });

    it('verifies password against salted SHA-256 hash', async () => {
      const users = storage.getUsers();
      const akmal = users.find((u) => u.name === 'Akmal')!;

      // Default seed password is ppki1234
      const isCorrect = await storage.verifyUserPassword(akmal.id, 'ppki1234');
      expect(isCorrect).toBe(true);

      const isWrong = await storage.verifyUserPassword(akmal.id, 'wrongpassword');
      expect(isWrong).toBe(false);
    });

    it('allows changing user password and validates new password', async () => {
      const users = storage.getUsers();
      const aldy = users.find((u) => u.name === 'Aldy')!;

      await storage.setUserPassword(aldy.id, 'newSecretPassword2026');

      expect(await storage.verifyUserPassword(aldy.id, 'newSecretPassword2026')).toBe(true);
      expect(await storage.verifyUserPassword(aldy.id, 'ppki1234')).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('creates a secure session with 7-day expiration and retrieves valid user ID', () => {
      const users = storage.getUsers();
      const akmal = users[0];

      const session = storage.createSession(akmal.id);
      expect(session.userId).toBe(akmal.id);
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      const activeUserId = storage.getSession();
      expect(activeUserId).toBe(akmal.id);
    });

    it('clears session upon logout', () => {
      const users = storage.getUsers();
      storage.createSession(users[0].id);
      expect(storage.getSession()).toBe(users[0].id);

      storage.clearSession();
      expect(storage.getSession()).toBeNull();
    });
  });

  describe('Card Operations (Kanban CRUD)', () => {
    it('initializes with clean empty cards in production state', () => {
      const cards = storage.getCards();
      expect(cards).toHaveLength(0);
    });

    it('saves and updates cards list', () => {
      const cards = storage.getCards();
      const newCard: CardItem = {
        id: 'c-test-1',
        columnId: 'todo',
        title: 'Pengujian Unit Kanban',
        description: 'Memastikan fungsi kartu berjalan optimal.',
        assignedTo: ['u-akmal'],
        createdBy: 'u-akmal',
        deadline: '2026-10-30',
        labels: ['Sistem'],
        priority: 'high',
        orderIndex: cards.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.saveCards([newCard, ...cards]);
      const reloaded = storage.getCards();
      expect(reloaded).toHaveLength(cards.length + 1);
      expect(reloaded[0].title).toBe('Pengujian Unit Kanban');
    });

    it('records activity logs upon card changes', () => {
      const users = storage.getUsers();
      const initialLogs = storage.getActivities();
      const updatedLogs = storage.addActivity('c-1', users[0], 'memindahkan tugas ke Done');

      expect(updatedLogs.length).toBe(initialLogs.length + 1);
      expect(updatedLogs[0].action).toBe('memindahkan tugas ke Done');
      expect(updatedLogs[0].userName).toBe('Akmal');
    });
  });

  describe('Projects Management (CRUD & Milestones Calculation)', () => {
    it('initializes with clean empty projects in production state', () => {
      const projects = storage.getProjects();
      expect(projects).toHaveLength(0);
    });

    it('creates a new project and updates project status', () => {
      const users = storage.getUsers();
      const initialProjects = storage.getProjects();

      const created = storage.addProject({
        title: 'Platform Testing CI/CD',
        code: 'PRJ-TEST',
        description: 'Automasi pipeline verifikasi kode.',
        status: 'planning',
        progress: 0,
        startDate: '2026-10-25',
        targetDate: '2026-11-25',
        leaderId: users[0].id,
        teamMembers: [users[0].id, users[1].id],
        tags: ['QA'],
        milestones: [
          { id: 'm-1', title: 'Setup GitHub Actions', dueDate: '2026-10-28', completed: false },
          { id: 'm-2', title: 'Integrasi Unit Tests', dueDate: '2026-11-05', completed: false },
        ],
        notes: '',
      });

      expect(created.id).toBeDefined();
      expect(storage.getProjects().length).toBe(initialProjects.length + 1);

      // Update project progress
      storage.updateProject(created.id, { progress: 50, status: 'in_progress' });
      const updated = storage.getProjects().find((p) => p.id === created.id);
      expect(updated?.progress).toBe(50);
      expect(updated?.status).toBe('in_progress');

      // Delete project
      storage.deleteProject(created.id);
      expect(storage.getProjects().find((p) => p.id === created.id)).toBeUndefined();
    });
  });

  describe('Admin User Management (CRUD)', () => {
    it('adds a new user with hashed password and avatar initials', async () => {
      const newUser = await storage.addUser('Budi Santoso', 'budi@ppki.id', 'member', 'budiPass123');
      expect(newUser.name).toBe('Budi Santoso');
      expect(newUser.avatar).toBe('BS');
      expect(newUser.role).toBe('member');

      const isAuthValid = await storage.verifyUserPassword(newUser.id, 'budiPass123');
      expect(isAuthValid).toBe(true);
    });

    it('updates user profile details and role', () => {
      const users = storage.getUsers();
      const target = users.find((u) => u.name === 'Aldy')!;

      storage.updateUser(target.id, { name: 'Aldy Maulana', role: 'admin' });
      const updatedList = storage.getUsers();
      const updatedAldy = updatedList.find((u) => u.id === target.id)!;

      expect(updatedAldy.name).toBe('Aldy Maulana');
      expect(updatedAldy.avatar).toBe('AM');
      expect(updatedAldy.role).toBe('admin');
    });

    it('deletes user from list', () => {
      const users = storage.getUsers();
      const countBefore = users.length;
      const target = users[users.length - 1];

      storage.deleteUser(target.id);
      const after = storage.getUsers();
      expect(after).toHaveLength(countBefore - 1);
      expect(after.find((u) => u.id === target.id)).toBeUndefined();
    });
  });
});
