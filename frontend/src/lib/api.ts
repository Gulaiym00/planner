import type {
  CalendarEvent,
  EventInput,
  EventQuery,
  EventUpdate,
  Group,
  GroupInput,
  GroupUpdate,
  Sphere,
  SphereInput,
  SphereUpdate,
  Task,
  TaskInput,
  TaskQuery,
  TaskUpdate,
} from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Не удалось связаться с сервером");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function query(params: object = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

const post = <T>(path: string, data: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) });
const patch = <T>(path: string, data: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
const del = (path: string) => request<void>(path, { method: "DELETE" });

export const api = {
  spheres: {
    list: () => request<Sphere[]>(`/spheres${query({ includeArchived: true })}`),
    create: (data: SphereInput) => post<Sphere>("/spheres", data),
    update: (id: string, data: SphereUpdate) => patch<Sphere>(`/spheres/${id}`, data),
    remove: (id: string, moveTo?: string) => del(`/spheres/${id}${query({ moveTo })}`),
  },
  groups: {
    create: (data: GroupInput) => post<Group>("/groups", data),
    update: (id: string, data: GroupUpdate) => patch<Group>(`/groups/${id}`, data),
    remove: (id: string, moveTo?: string) => del(`/groups/${id}${query({ moveTo })}`),
  },
  tasks: {
    list: (params: TaskQuery) => request<Task[]>(`/tasks${query(params)}`),
    create: (data: TaskInput) => post<Task>("/tasks", data),
    update: (id: string, data: TaskUpdate) => patch<Task>(`/tasks/${id}`, data),
    remove: (id: string) => del(`/tasks/${id}`),
  },
  events: {
    list: (params: EventQuery) => request<CalendarEvent[]>(`/events${query(params)}`),
    create: (data: EventInput) => post<CalendarEvent>("/events", data),
    update: (id: string, data: EventUpdate) => patch<CalendarEvent>(`/events/${id}`, data),
    remove: (id: string) => del(`/events/${id}`),
  },
};
