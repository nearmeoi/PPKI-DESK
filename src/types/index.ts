export type Role = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt?: string;
}

export type ColumnStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface ColumnData {
  id: ColumnStatus;
  title: string;
  order: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface CardItem {
  id: string;
  columnId: ColumnStatus;
  title: string;
  description: string;
  assignedTo: string[]; // User IDs
  createdBy: string;    // User ID
  deadline?: string;    // YYYY-MM-DD
  labels: string[];     // Label names
  priority?: Priority;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  cardId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface BoardFilter {
  searchQuery: string;
  assignedToUserId: string | 'all' | 'me';
  selectedLabel: string | 'all';
}
