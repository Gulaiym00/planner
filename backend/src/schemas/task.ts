import { z } from "zod";
import { dateOnlySchema, dateTimeSchema, idSchema, nameSchema, optionalText } from "./common.js";

export const createTaskSchema = z.object({
  title: nameSchema(200),
  description: optionalText(),
  sphereId: idSchema.nullable().optional(),
  groupId: idSchema.nullable().optional(),
  dueDate: dateOnlySchema.nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean("Поле completed должно быть true или false").optional(),
});

export const listTasksQuery = z.object({
  /** active — невыполненные (плюс выполненные начиная с doneSince, если он задан) */
  status: z.enum(["active", "done", "all"]).default("all"),
  doneSince: dateTimeSchema.optional(),
  sphereId: idSchema.optional(),
  groupId: idSchema.optional(),
});
