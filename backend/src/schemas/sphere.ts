import { z } from "zod";
import { booleanQuery, colorSchema, nameSchema } from "./common.js";

export const createSphereSchema = z.object({
  name: nameSchema(60),
  icon: z.string().trim().min(1).max(8, "Иконка — один эмодзи").optional(),
  color: colorSchema.optional(),
  sortOrder: z.int().optional(),
});

export const updateSphereSchema = createSphereSchema.partial().extend({
  archived: z.boolean().optional(),
});

export const listSpheresQuery = z.object({ includeArchived: booleanQuery });
