import { z } from "zod";
import { colorSchema, idSchema, nameSchema } from "./common.js";

export const createGroupSchema = z.object({
  sphereId: idSchema,
  name: nameSchema(60),
  color: colorSchema.nullable().optional(),
  sortOrder: z.int().optional(),
});

export const updateGroupSchema = createGroupSchema.partial().extend({
  archived: z.boolean().optional(),
});
