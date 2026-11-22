export interface Group {
  id: string;
  sphereId: string;
  name: string;
  color: string | null;
  sortOrder: number;
  archived: boolean;
  activeTasks: number;
}

export interface Sphere {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  archived: boolean;
  activeTasks: number;
  groups: Group[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  sphereId: string | null;
  groupId: string | null;
  /** ГГГГ-ММ-ДД */
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export type EventStatus = "planned" | "done" | "cancelled";

/** Встреча или другое событие со временем. Не Event — чтобы не путать с DOM Event */
export interface CalendarEvent {
  id: string;
  title: string;
  note: string | null;
  location: string | null;
  people: string | null;
  sphereId: string | null;
  groupId: string | null;
  startsAt: string;
  endsAt: string | null;
  status: EventStatus;
}

export interface Owner {
  sphereId?: string | null;
  groupId?: string | null;
}

export interface TaskInput extends Owner {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}
export type TaskUpdate = Partial<TaskInput> & { completed?: boolean };

export interface EventInput extends Owner {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  people?: string | null;
  note?: string | null;
}
export type EventUpdate = Partial<EventInput> & { status?: EventStatus };

export interface SphereInput {
  name: string;
  icon?: string;
  color?: string;
}
export type SphereUpdate = Partial<SphereInput> & { archived?: boolean };

export interface GroupInput {
  sphereId: string;
  name: string;
  color?: string | null;
}
export type GroupUpdate = Partial<GroupInput> & { archived?: boolean };

export interface TaskQuery {
  status?: "active" | "done" | "all";
  doneSince?: string;
  sphereId?: string;
  groupId?: string;
}

export interface EventQuery {
  from?: string;
  to?: string;
  sphereId?: string;
  groupId?: string;
}
