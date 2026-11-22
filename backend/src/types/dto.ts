import type { z } from "zod";
import type { createEventSchema, listEventsQuery, updateEventSchema } from "../schemas/event.js";
import type { createGroupSchema, updateGroupSchema } from "../schemas/group.js";
import type { createSphereSchema, listSpheresQuery, updateSphereSchema } from "../schemas/sphere.js";
import type { createTaskSchema, listTasksQuery, updateTaskSchema } from "../schemas/task.js";

export type CreateSphereDto = z.output<typeof createSphereSchema>;
export type UpdateSphereDto = z.output<typeof updateSphereSchema>;
export type ListSpheresQuery = z.output<typeof listSpheresQuery>;

export type CreateGroupDto = z.output<typeof createGroupSchema>;
export type UpdateGroupDto = z.output<typeof updateGroupSchema>;

export type CreateTaskDto = z.output<typeof createTaskSchema>;
export type UpdateTaskDto = z.output<typeof updateTaskSchema>;
export type ListTasksQuery = z.output<typeof listTasksQuery>;

export type CreateEventDto = z.output<typeof createEventSchema>;
export type UpdateEventDto = z.output<typeof updateEventSchema>;
export type ListEventsQuery = z.output<typeof listEventsQuery>;

/** Привязка записи к сфере и группе */
export interface Owner {
  sphereId: string | null;
  groupId: string | null;
}
