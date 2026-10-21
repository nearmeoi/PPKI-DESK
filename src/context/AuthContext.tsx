import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserProfile, Role } from '../types';
import { storage } from '../lib/storage';
import { makeInitials } from '../lib/utils';
import { AVATAR_COLORS } from '../lib/constants';
import {
  isValidEmail,
  sanitizeInput,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from '../lib/security';

interface AuthContextValue {
  currentUser: UserProfile | null;
  users: UserProfile[];
  isAuthenticated: boolean;
  avatarColorOf: (userId: string) => string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  addUser: (name: string, email: string, role: Role, initialPassword?: string) => Promise<UserProfile>;
  updateUser: (userId: string, data: Partial<UserProfile>) => boolean;
  resetUserPassword: (userId: string, newPassword?: string) => Promise<boolean>;
  updateDisplayName: (name: string) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(() => storage.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const sessionUserId = storage.getSession();
    if (!sessionUserId) return null;
    const all = storage.getUsers();
    return all.find((u) => u.id === sessionUserId) || null;
  });

  useEffect(() => {
    storage.init();
  }, []);

  const avatarColorOf = useCallback(
    (userId: string): string => {
      const idx = users.findIndex((u) => u.id === userId);
      return AVATAR_COLORS[(idx >= 0 ? idx : 0) % AVATAR_COLORS.length];
    },
    [users],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // 1. Rate limiting / brute-force protection
      const rateLimit = checkLoginRateLimit();
      if (rateLimit.isLocked) {
        return {
          success: false,
          error: `Terlalu banyak percobaan gagal. Silakan tunggu ${rateLimit.remainingSeconds} detik lagi demi keamanan.`,
        };
      }

      // 2. Strict input sanitization & format validation
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      if (!isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Format email tidak valid atau mengandung karakter dilarang.' };
      }

      if (!password || password.length > 100) {
        return { success: false, error: 'Kata sandi tidak valid.' };
      }

      // 3. User lookup
      const user = users.find((u) => u.email.toLowerCase() === sanitizedEmail);
      if (!user) {
        recordFailedLogin();
        return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
      }

      // 4. Cryptographic password verification (Salted SHA-256)
      const isValid = await storage.verifyUserPassword(user.id, password);
      if (!isValid) {
        const afterFail = recordFailedLogin();
        if (afterFail.isLocked) {
          return {
            success: false,
            error: `Terlalu banyak percobaan gagal. Akun dikunci sementara selama ${afterFail.remainingSeconds} detik.`,
          };
        }
        return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
      }

      // 5. Successful login: reset rate limit & issue cryptographically random session
      resetLoginRateLimit();
      storage.createSession(user.id);
      setCurrentUser(user);
      return { success: true };
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    storage.clearSession();
  }, []);

  const switchUser = useCallback((user: UserProfile) => {
    storage.createSession(user.id);
    setCurrentUser(user);
  }, []);

  const addUser = useCallback(
    async (name: string, email: string, role: Role, initialPassword = 'ppki1234'): Promise<UserProfile> => {
      const cleanName = sanitizeInput(name);
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const newUser = await storage.addUser(cleanName, cleanEmail, role, initialPassword);
      setUsers(storage.getUsers());
      return newUser;
    },
    [],
  );

  const updateUser = useCallback(
    (userId: string, data: Partial<UserProfile>): boolean => {
      const sanitizedData: Partial<UserProfile> = {};
      if (data.name) sanitizedData.name = sanitizeInput(data.name);
      if (data.email) sanitizedData.email = sanitizeInput(data.email).toLowerCase();
      if (data.role) sanitizedData.role = data.role;

      const updated = storage.updateUser(userId, sanitizedData);
      setUsers(updated);
      if (currentUser?.id === userId) {
        const active = updated.find((u) => u.id === userId);
        if (active) setCurrentUser(active);
      }
      return true;
    },
    [currentUser],
  );

  const resetUserPassword = useCallback(
    async (userId: string, newPassword = 'ppki1234'): Promise<boolean> => {
      await storage.setUserPassword(userId, newPassword);
      return true;
    },
    [],
  );

  const updateDisplayName = useCallback(
    (name: string) => {
      if (!currentUser) return;
      const cleanName = sanitizeInput(name);
      const updated: UserProfile = { ...currentUser, name: cleanName, avatar: makeInitials(cleanName) };
      setCurrentUser(updated);
      const next = storage.getUsers().map((u) => (u.id === updated.id ? updated : u));
      storage.saveUsers(next);
      setUsers(next);
    },
    [currentUser],
  );

  const changePassword = useCallback(
    async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) return { success: false, error: 'Belum masuk ke akun.' };

      // Verify current password
      const isOldValid = await storage.verifyUserPassword(currentUser.id, oldPass);
      if (!isOldValid) {
        return { success: false, error: 'Kata sandi saat ini tidak sesuai.' };
      }

      if (newPass.length < 6 || newPass.length > 100) {
        return { success: false, error: 'Kata sandi baru minimal 6 dan maksimal 100 karakter.' };
      }

      await storage.setUserPassword(currentUser.id, newPass);
      return { success: true };
    },
    [currentUser],
  );

  const deleteUser = useCallback(
    (userId: string): boolean => {
      if (!currentUser || userId === currentUser.id) return false;
      const next = users.filter((u) => u.id !== userId);
      storage.saveUsers(next);
      setUsers(next);
      return true;
    },
    [currentUser, users],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: currentUser !== null,
        avatarColorOf,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        resetUserPassword,
        updateDisplayName,
        changePassword,
        deleteUser,
        isAdmin: currentUser?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
