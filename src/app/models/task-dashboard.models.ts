export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'REJECTED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskResponseDto {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  priority?: TaskPriority | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  closedAt?: string | null;
  completionNote?: string | null;
  assignedToEmployeeId?: number | null;
  assignedToUserId?: number | null;
  /** Display: prefer first + optional last; backend sends from linked user. */
  assigneeFirstName?: string | null;
  assigneeLastName?: string | null;
  assigneeUsername?: string | null;
  evaluatorEmployeeId?: number | null;
  evaluatorUserId?: number | null;
  closedByUserId?: number | null;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface UserDashboardDto {
  openTaskCount: number;
  dueWithinSevenDaysCount: number;
  recentlyClosedTasks: TaskResponseDto[];
}
