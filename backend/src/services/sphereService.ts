import { prisma } from "../db/prisma.js";
import type { CreateSphereDto, ListSpheresQuery, UpdateSphereDto } from "../types/dto.js";
import { HttpError } from "../utils/HttpError.js";

const activeTasksCount = { _count: { select: { tasks: { where: { completed: false } } } } } as const;

export async function list({ includeArchived }: ListSpheresQuery) {
  const archivedFilter = includeArchived ? {} : { archived: false };
  const spheres = await prisma.sphere.findMany({
    where: archivedFilter,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      ...activeTasksCount,
      groups: {
        where: archivedFilter,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: activeTasksCount,
      },
    },
  });

  return spheres.map(({ _count, groups, ...sphere }) => ({
    ...sphere,
    activeTasks: _count.tasks,
    groups: groups.map(({ _count: groupCount, ...group }) => ({ ...group, activeTasks: groupCount.tasks })),
  }));
}

export async function create(data: CreateSphereDto) {
  const last = await prisma.sphere.aggregate({ _max: { sortOrder: true } });
  return prisma.sphere.create({
    data: { ...data, sortOrder: data.sortOrder ?? (last._max.sortOrder ?? -1) + 1 },
  });
}

export async function update(id: string, data: UpdateSphereDto) {
  return prisma.sphere.update({ where: { id }, data });
}

/** Без moveTo удаляет сферу вместе с группами, задачами и встречами; с moveTo — переносит их в другую сферу */
export async function remove(id: string, moveTo?: string) {
  if (!moveTo) {
    await prisma.sphere.delete({ where: { id } });
    return;
  }
  if (moveTo === id) throw new HttpError(400, "Нельзя перенести в ту же сферу");
  const target = await prisma.sphere.findUnique({ where: { id: moveTo }, select: { id: true } });
  if (!target) throw new HttpError(400, "Сфера для переноса не найдена");

  await prisma.$transaction([
    prisma.group.updateMany({ where: { sphereId: id }, data: { sphereId: moveTo } }),
    prisma.task.updateMany({ where: { sphereId: id }, data: { sphereId: moveTo } }),
    prisma.event.updateMany({ where: { sphereId: id }, data: { sphereId: moveTo } }),
    prisma.sphere.delete({ where: { id } }),
  ]);
}
