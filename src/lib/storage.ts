import type { CardItem, UserProfile, ActivityLog } from '../types';
import { INITIAL_CARDS, INITIAL_USERS, INITIAL_ACTIVITIES } from './mockData';

const STORAGE_KEYS = {
  CARDS: 'ppki_cards_v1',
  USERS: 'ppki_users_v1',
  ACTIVITIES: 'ppki_activities_v1',
  CURRENT_USER: 'ppki_current_user_v1',
};

// Storage helper
export const storageService = {
  getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCards(): CardItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(INITIAL_CARDS));
      return INITIAL_CARDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CARDS;
    }
  },

  saveCards(cards: CardItem[]) {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  },

  getActivities(): ActivityLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  saveActivities(activities: ActivityLog[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultUser = INITIAL_USERS[0]; // Admin by default
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  logActivity(cardId: string, user: UserProfile, action: string) {
    const activities = this.getActivities();
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      cardId,
      userId: user.id,
      userName: user.name,
      action,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...activities.slice(0, 49)];
    this.saveActivities(updated);
    return updated;
  },

  canModifyCard(card: CardItem, user: UserProfile): boolean {
    if (user.role === 'admin') return true;
    return card.createdBy === user.id;
  },
};
