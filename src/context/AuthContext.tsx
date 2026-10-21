import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserProfile, Role } from '../types';
import { storage } from '../lib/storage';
import { makeInitials } from '../lib/utils';
import { AVATAR_COLORS } from '../lib/constants';

interface AuthContextValue {
  currentUser: UserProfile;
  users: UserProfile[];
  /** Index warna avatar berdasarkan posisi user di array */
  avatarColorOf: (userId: string) => string;
  switchUser: (user: UserProfile) => void;
  addUser: (name: string, email: string, role: Role) => UserProfile;
  updateDisplayName: (name: string) => void;
  deleteUser: (userId: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers]       = useState<UserProfile[]>(() => storage.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getCurrentUser());

  const avatarColorOf = useCallback(
    (userId: string): string => {
      const idx = users.findIndex((u) => u.id === userId);
      return AVATAR_COLORS[idx % AVATAR_COLORS.length];
    },
    [users],
  );

  const switchUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
  }, []);

  const addUser = useCallback((name: string, email: string, role: Role): UserProfile => {
    const newUser = storage.addUser(name, email, role);
    setUsers(storage.getUsers());
    return newUser;
  }, []);

  const updateDisplayName = useCallback((name: string) => {
    const updated: UserProfile = { ...currentUser, name: name.trim(), avatar: makeInitials(name) };
    setCurrentUser(updated);
    storage.setCurrentUser(updated);
    const next = storage.getUsers().map((u) => (u.id === updated.id ? updated : u));
    storage.saveUsers(next);
    setUsers(next);
  }, [currentUser]);

  const deleteUser = useCallback((userId: string): boolean => {
    if (userId === currentUser.id) return false;
    const next = users.filter((u) => u.id !== userId);
    storage.saveUsers(next);
    setUsers(next);
    return true;
  }, [currentUser.id, users]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      avatarColorOf,
      switchUser,
      addUser,
      updateDisplayName,
      deleteUser,
      isAdmin: currentUser.role === 'admin',
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
