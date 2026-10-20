import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, Role } from '../types';
import { storageService } from '../lib/storage';

interface AuthContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  switchUser: (user: UserProfile) => void;
  addUser: (name: string, email: string, role: Role) => UserProfile;
  updateCurrentUser: (name: string) => void;
  deleteUser: (userId: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => storageService.getCurrentUser());

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  const switchUser = (user: UserProfile) => {
    setCurrentUserState(user);
    storageService.setCurrentUser(user);
  };

  const addUser = (name: string, email: string, role: Role): UserProfile => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newUser: UserProfile = {
      id: 'user-' + Date.now(),
      name,
      email,
      role,
      avatar: initials || 'U',
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    storageService.saveUsers(updated);
    return newUser;
  };

  const updateCurrentUser = (name: string) => {
    const updatedUser = { ...currentUser, name };
    setCurrentUserState(updatedUser);
    storageService.setCurrentUser(updatedUser);

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Tidak dapat menghapus akun yang sedang aktif digunakan.');
      return;
    }
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        addUser,
        updateCurrentUser,
        deleteUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
