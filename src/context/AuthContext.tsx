import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserProfile, Role } from '../types';
import { storage } from '../lib/storage';
import { makeInitials } from '../lib/utils';
import { AVATAR_COLORS } from '../lib/constants';

interface AuthContextValue {
  currentUser: UserProfile | null;
  users: UserProfile[];
  isAuthenticated: boolean;
  /** Index warna avatar berdasarkan posisi user di array */
  avatarColorOf: (userId: string) => string;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  addUser: (name: string, email: string, role: Role, initialPassword?: string) => UserProfile;
  updateDisplayName: (name: string) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
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
    (email: string, password: string): { success: boolean; error?: string } => {
      const trimmedEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!user) {
        return { success: false, error: 'Email tidak ditemukan dalam tim PPKI.' };
      }

      const validPassword = storage.getUserPassword(user.id);
      if (password !== validPassword) {
        return { success: false, error: 'Kata sandi tidak sesuai.' };
      }

      setCurrentUser(user);
      storage.setCurrentUser(user);
      return { success: true };
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    storage.clearSession();
  }, []);

  const switchUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
  }, []);

  const addUser = useCallback((name: string, email: string, role: Role, initialPassword = 'ppki1234'): UserProfile => {
    const newUser = storage.addUser(name, email, role, initialPassword);
    setUsers(storage.getUsers());
    return newUser;
  }, []);

  const updateDisplayName = useCallback((name: string) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, name: name.trim(), avatar: makeInitials(name) };
    setCurrentUser(updated);
    storage.setCurrentUser(updated);
    const next = storage.getUsers().map((u) => (u.id === updated.id ? updated : u));
    storage.saveUsers(next);
    setUsers(next);
  }, [currentUser]);

  const changePassword = useCallback(
    (oldPass: string, newPass: string): { success: boolean; error?: string } => {
      if (!currentUser) return { success: false, error: 'Belum masuk ke akun.' };

      const currentStoredPass = storage.getUserPassword(currentUser.id);
      if (oldPass !== currentStoredPass) {
        return { success: false, error: 'Kata sandi saat ini tidak cocok.' };
      }
      if (newPass.length < 6) {
        return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
      }

      storage.setUserPassword(currentUser.id, newPass);
      return { success: true };
    },
    [currentUser],
  );

  const deleteUser = useCallback((userId: string): boolean => {
    if (!currentUser || userId === currentUser.id) return false;
    const next = users.filter((u) => u.id !== userId);
    storage.saveUsers(next);
    setUsers(next);
    return true;
  }, [currentUser, users]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isAuthenticated: currentUser !== null,
      avatarColorOf,
      login,
      logout,
      switchUser,
      addUser,
      updateDisplayName,
      changePassword,
      deleteUser,
      isAdmin: currentUser?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
