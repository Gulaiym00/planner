import { z } from "zod";
import { dateTimeSchema, idSchema, nameSchema, optionalText } from "./common.js";

const eventFields = {
  title: nameSchema(200),
  note: optionalText(),
  location: optionalText(200),
  people: optionalText(200),
  sphereId: idSchema.nullable().optional(),
  groupId: idSchema.nullable().optional(),
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema.nullable().optional(),
};

const endsAfterStart = (e: { startsAt?: string; endsAt?: string | null }) =>
  !e.startsAt || !e.endsAt || new Date(e.endsAt) >= new Date(e.startsAt);
const endsAfterStartError = { error: "Окончание не может быть раньше начала", path: ["endsAt"] };

export const createEventSchema = z.object(eventFields).refine(endsAfterStart, endsAfterStartError);

export const updateEventSchema = z
  .object(eventFields)
  .partial()
  .extend({ status: z.enum(["planned", "done", "cancelled"]).optional() })
  .refine(endsAfterStart, endsAfterStartError);

export const listEventsQuery = z.object({
  from: dateTimeSchema.optional(),
  to: dateTimeSchema.optional(),
  sphereId: idSchema.optional(),
  groupId: idSchema.optional(),
});
