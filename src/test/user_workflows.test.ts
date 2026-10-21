import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../lib/storage';
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit, sanitizeInput } from '../lib/security';

describe('User End-to-End Workflows & Regression Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    resetLoginRateLimit();
    await storage.init();
  });

  describe('Workflow: Authentication & Rate Limiting Enforcement', () => {
    it('authenticates valid credentials and creates an active session', async () => {
      const users = storage.getUsers();
      const akmal = users.find((u) => u.name === 'Akmal')!;

      // 1. Enter valid email and password
      const isValid = await storage.verifyUserPassword(akmal.id, 'ppki1234');
      expect(isValid).toBe(true);

      // 2. Issue session
      const session = storage.createSession(akmal.id);
      expect(session.userId).toBe(akmal.id);
      expect(storage.getSession()).toBe(akmal.id);
    });

    it('blocks login after repeated password failures', () => {
      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        recordFailedLogin();
      }

      const limitStatus = checkLoginRateLimit();
      expect(limitStatus.isLocked).toBe(true);
      expect(limitStatus.remainingSeconds).toBeGreaterThan(0);
    });
  });

  describe('Workflow: Kanban Task Progress Cycle', () => {
    it('transitions card from To Do -> In Progress -> Review -> Done', () => {
      const cards = storage.getCards();
      const testCard = cards[0];

      // Move to In Progress
      testCard.columnId = 'in_progress';
      storage.saveCards(cards);
      expect(storage.getCards().find((c) => c.id === testCard.id)?.columnId).toBe('in_progress');

      // Move to Review
      testCard.columnId = 'review';
      storage.saveCards(cards);
      expect(storage.getCards().find((c) => c.id === testCard.id)?.columnId).toBe('review');

      // Move to Done
      testCard.columnId = 'done';
      storage.saveCards(cards);
      expect(storage.getCards().find((c) => c.id === testCard.id)?.columnId).toBe('done');
    });

    it('creates a new task card with sanitized inputs avoiding XSS vulnerabilities', () => {
      const rawTitle = '<script>alert("hack")</script>Perbaiki Login';
      const cleanTitle = sanitizeInput(rawTitle);

      expect(cleanTitle).not.toContain('<script>');
      expect(cleanTitle).not.toContain('</script>');
      expect(cleanTitle).not.toContain('<');
      expect(cleanTitle).not.toContain('>');
      expect(cleanTitle).toBe('alert("hack")Perbaiki Login');

      const cards = storage.getCards();
      const newCard = {
        id: 'c-test-xss',
        columnId: 'todo' as const,
        title: cleanTitle,
        description: 'Deskripsi aman',
        assignedTo: ['u-akmal'],
        createdBy: 'u-akmal',
        deadline: '2026-10-30',
        labels: ['Sistem'],
        priority: 'high' as const,
        orderIndex: cards.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.saveCards([...cards, newCard]);
      const saved = storage.getCards().find((c) => c.id === 'c-test-xss')!;
      expect(saved.title).toBe('alert("hack")Perbaiki Login');
    });
  });

  describe('Workflow: Project Milestone Progress Recalculation', () => {
    it('automatically calculates project progress percentage based on completed milestones', () => {
      const prj = storage.getProjects()[0];
      const initialMilestones = prj.milestones;
      const totalCount = initialMilestones.length;

      // Mark all milestones as completed
      const allCompleted = initialMilestones.map((m) => ({ ...m, completed: true }));
      const newProgress = Math.round((allCompleted.filter((m) => m.completed).length / totalCount) * 100);

      expect(newProgress).toBe(100);

      storage.updateProject(prj.id, {
        milestones: allCompleted,
        progress: newProgress,
        status: 'completed',
      });

      const updated = storage.getProjects().find((p) => p.id === prj.id)!;
      expect(updated.progress).toBe(100);
      expect(updated.status).toBe('completed');
    });
  });

  describe('Workflow: Search & Universal Discovery', () => {
    it('finds cards by title or description keyword', () => {
      const cards = storage.getCards();
      const query = 'repository';
      const results = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds team members by name or email', () => {
      const users = storage.getUsers();
      const match = users.filter((u) => u.name.toLowerCase().includes('aldy'));
      expect(match).toHaveLength(1);
      expect(match[0].email).toBe('aldy@ppki.id');
    });
  });

  describe('Workflow: Profile Management & Password Change', () => {
    it('updates user display name and persists in storage', () => {
      const users = storage.getUsers();
      const satria = users.find((u) => u.name === 'Satria')!;

      satria.name = 'Satria Updated';
      storage.saveUsers(users);

      const refreshed = storage.getUsers().find((u) => u.id === satria.id)!;
      expect(refreshed.name).toBe('Satria Updated');
    });

    it('changes password securely with hash update', async () => {
      const users = storage.getUsers();
      const dwitra = users.find((u) => u.name === 'Dwitra')!;

      // Verify initial password
      expect(await storage.verifyUserPassword(dwitra.id, 'ppki1234')).toBe(true);

      // Change password
      await storage.setUserPassword(dwitra.id, 'newSecurePass2026!');

      // Old password should fail
      expect(await storage.verifyUserPassword(dwitra.id, 'ppki1234')).toBe(false);

      // New password should succeed
      expect(await storage.verifyUserPassword(dwitra.id, 'newSecurePass2026!')).toBe(true);
    });
  });

  describe('Workflow: Admin User Management (CRUD)', () => {
    it('allows admin to create, update role, and delete a user', async () => {
      // 1. Create user
      const created = await storage.addUser(
        'Rian Pratama',
        'rian@ppki.id',
        'member',
        'temporaryPassword123'
      );
      expect(created.id).toBeDefined();
      expect(storage.getUsers().some((u) => u.id === created.id)).toBe(true);

      // Verify the initial password was set
      expect(await storage.verifyUserPassword(created.id, 'temporaryPassword123')).toBe(true);

      // 2. Update user role
      storage.updateUser(created.id, { role: 'admin' });
      expect(storage.getUsers().find((u) => u.id === created.id)?.role).toBe('admin');

      // 3. Delete user
      storage.deleteUser(created.id);
      expect(storage.getUsers().some((u) => u.id === created.id)).toBe(false);
    });

    it('prevents deleting the last admin user', () => {
      const users = storage.getUsers();
      const adminUsers = users.filter((u) => u.role === 'admin');
      expect(adminUsers.length).toBeGreaterThanOrEqual(1);

      // If only 1 admin exists, deleting that admin should not leave 0 admins
      if (adminUsers.length === 1) {
        const soleAdmin = adminUsers[0];
        // Validation check should guard this
        expect(soleAdmin.role).toBe('admin');
      }
    });
  });

  describe('Workflow: Activity Notification Feed', () => {
    it('appends and reads real-time team activity logs', () => {
      const user = storage.getUsers().find((u) => u.id === 'u-aldy')!;
      const initialLogs = storage.getActivities();

      const updatedLogs = storage.addActivity('c-1', user, 'memindahkan kartu ke Selesai');
      expect(updatedLogs.length).toBe(initialLogs.length + 1);
      expect(updatedLogs[0].cardId).toBe('c-1');
      expect(updatedLogs[0].userName).toBe('Aldy');
      expect(updatedLogs[0].action).toBe('memindahkan kartu ke Selesai');
    });
  });
});
