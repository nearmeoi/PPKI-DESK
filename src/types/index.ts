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
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'activity';
  author?: string;
  timestamp?: string;
}

export type AppView = 'kanban' | 'timeline' | 'projects' | 'profile';

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  code: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  leaderId: string; // User ID
  teamMembers: string[]; // Array of User IDs
  tags: string[];
  milestones: ProjectMilestone[];
  budgetEstimated?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
