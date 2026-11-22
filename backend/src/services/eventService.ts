import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { CreateEventDto, ListEventsQuery, UpdateEventDto } from "../types/dto.js";
import { HttpError } from "../utils/HttpError.js";
import { resolveOwner } from "./ownerService.js";

const toDate = (value: string | undefined) => (value === undefined ? undefined : new Date(value));
const toNullableDate = (value: string | null | undefined) => (value === null ? null : toDate(value));

export async function list({ from, to, sphereId, groupId }: ListEventsQuery) {
  const where: Prisma.EventWhereInput = {
    sphereId,
    groupId,
    startsAt: { gte: toDate(from), lt: toDate(to) },
  };
  return prisma.event.findMany({ where, orderBy: { startsAt: "asc" } });
}

async function findOrThrow(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new HttpError(404, "Встреча не найдена");
  return event;
}

export const getById = findOrThrow;

export async function create({ sphereId, groupId, startsAt, endsAt, ...data }: CreateEventDto) {
  const owner = await resolveOwner({ sphereId, groupId });
  return prisma.event.create({
    data: { ...data, ...owner, startsAt: new Date(startsAt), endsAt: toNullableDate(endsAt) },
  });
}

export async function update(id: string, { sphereId, groupId, startsAt, endsAt, ...data }: UpdateEventDto) {
  const current = await findOrThrow(id);
  const newStart = toDate(startsAt) ?? current.startsAt;
  const newEnd = endsAt === undefined ? current.endsAt : toNullableDate(endsAt);
  if (newEnd && newEnd < newStart) throw new HttpError(400, "Окончание не может быть раньше начала");

  const owner =
    sphereId !== undefined || groupId !== undefined ? await resolveOwner({ sphereId, groupId }, current) : {};

  return prisma.event.update({
    where: { id },
    data: { ...data, ...owner, startsAt: toDate(startsAt), endsAt: toNullableDate(endsAt) },
  });
}

export async function remove(id: string) {
  await prisma.event.delete({ where: { id } });
}
