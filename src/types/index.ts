export type Role = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** 2 huruf inisial untuk avatar teks */
  avatar: string;
  createdAt: string;
}

export type ColumnId = 'todo' | 'in_progress' | 'review' | 'done';

export interface ColumnData {
  id: ColumnId;
  title: string;
  order: number;
  /** Warna aksen header kolom (Tailwind class) */
  accentColor: string;
  containerBg: string;
  containerBorder: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  dropHighlight: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface CardItem {
  id: string;
  columnId: ColumnId;
  title: string;
  description: string;
  /** Array ID anggota yang ditugaskan */
  assignedTo: string[];
  /** ID pembuat kartu */
  createdBy: string;
  /** Format YYYY-MM-DD */
  deadline?: string;
  labels: string[];
  priority: Priority;
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

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
