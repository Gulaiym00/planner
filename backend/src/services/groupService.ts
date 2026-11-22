import { prisma } from "../db/prisma.js";
import type { CreateGroupDto, UpdateGroupDto } from "../types/dto.js";
import { HttpError } from "../utils/HttpError.js";

export async function create(data: CreateGroupDto) {
  const last = await prisma.group.aggregate({ where: { sphereId: data.sphereId }, _max: { sortOrder: true } });
  return prisma.group.create({
    data: { ...data, sortOrder: data.sortOrder ?? (last._max.sortOrder ?? -1) + 1 },
  });
}

/** При переносе группы в другую сферу её задачи и встречи переезжают вместе с ней */
export async function update(id: string, data: UpdateGroupDto) {
  if (!data.sphereId) return prisma.group.update({ where: { id }, data });

  const [group] = await prisma.$transaction([
    prisma.group.update({ where: { id }, data }),
    prisma.task.updateMany({ where: { groupId: id }, data: { sphereId: data.sphereId } }),
    prisma.event.updateMany({ where: { groupId: id }, data: { sphereId: data.sphereId } }),
  ]);
  return group;
}

/** Без moveTo удаляет группу вместе с задачами и встречами; с moveTo — переносит их в другую группу */
export async function remove(id: string, moveTo?: string) {
  if (!moveTo) {
    await prisma.group.delete({ where: { id } });
    return;
  }
  if (moveTo === id) throw new HttpError(400, "Нельзя перенести в ту же группу");
  const target = await prisma.group.findUnique({ where: { id: moveTo }, select: { sphereId: true } });
  if (!target) throw new HttpError(400, "Группа для переноса не найдена");

  const data = { groupId: moveTo, sphereId: target.sphereId };
  await prisma.$transaction([
    prisma.task.updateMany({ where: { groupId: id }, data }),
    prisma.event.updateMany({ where: { groupId: id }, data }),
    prisma.group.delete({ where: { id } }),
  ]);
}
