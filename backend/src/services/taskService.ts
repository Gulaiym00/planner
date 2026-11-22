import { prisma } from "../db/prisma.js";
import type { Prisma, Task } from "../generated/prisma/client.js";
import type { CreateTaskDto, ListTasksQuery, UpdateTaskDto } from "../types/dto.js";
import { fromDateOnly, toDateOnly } from "../utils/dates.js";
import { HttpError } from "../utils/HttpError.js";
import { resolveOwner } from "./ownerService.js";

const ORDER: Prisma.TaskOrderByWithRelationInput[] = [
  { completed: "asc" },
  { dueDate: { sort: "asc", nulls: "last" } },
  { createdAt: "asc" },
];

const toDto = (task: Task) => ({ ...task, dueDate: toDateOnly(task.dueDate) });

const toDueDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? null : fromDateOnly(value);

export async function list({ status, doneSince, sphereId, groupId }: ListTasksQuery) {
  const where: Prisma.TaskWhereInput = { sphereId, groupId };
  if (status === "done") where.completed = true;
  if (status === "active") {
    where.OR = [{ completed: false }];
    if (doneSince) where.OR.push({ completedAt: { gte: new Date(doneSince) } });
  }
  const tasks = await prisma.task.findMany({ where, orderBy: ORDER });
  return tasks.map(toDto);
}

async function findOrThrow(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, "Задача не найдена");
  return task;
}

export async function getById(id: string) {
  return toDto(await findOrThrow(id));
}

export async function create({ sphereId, groupId, dueDate, ...data }: CreateTaskDto) {
  const owner = await resolveOwner({ sphereId, groupId });
  const task = await prisma.task.create({ data: { ...data, ...owner, dueDate: toDueDate(dueDate) } });
  return toDto(task);
}

export async function update(id: string, { sphereId, groupId, dueDate, completed, ...data }: UpdateTaskDto) {
  const current = await findOrThrow(id);
  const owner =
    sphereId !== undefined || groupId !== undefined ? await resolveOwner({ sphereId, groupId }, current) : {};
  const completion =
    completed === undefined || completed === current.completed
      ? {}
      : { completed, completedAt: completed ? new Date() : null };

  const task = await prisma.task.update({
    where: { id },
    data: { ...data, ...owner, ...completion, dueDate: toDueDate(dueDate) },
  });
  return toDto(task);
}

export async function remove(id: string) {
  await prisma.task.delete({ where: { id } });
}
