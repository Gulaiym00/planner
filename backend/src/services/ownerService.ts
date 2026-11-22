import { prisma } from "../db/prisma.js";
import type { Owner } from "../types/dto.js";
import { HttpError } from "../utils/HttpError.js";

/**
 * Согласует сферу и группу записи.
 * Группа определяет сферу; если явно сменили только сферу, а старая группа из другой сферы — группа сбрасывается.
 */
export async function resolveOwner(
  input: { sphereId?: string | null; groupId?: string | null },
  current: Owner = { sphereId: null, groupId: null },
): Promise<Owner> {
  let sphereId = input.sphereId !== undefined ? input.sphereId : current.sphereId;
  let groupId = input.groupId !== undefined ? input.groupId : current.groupId;

  if (groupId) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { sphereId: true } });
    if (!group) throw new HttpError(400, "Группа не найдена");
    const sphereChangedAlone = input.groupId === undefined && input.sphereId !== undefined;
    if (sphereChangedAlone && group.sphereId !== sphereId) groupId = null;
    else sphereId = group.sphereId;
  }

  if (sphereId) {
    const sphere = await prisma.sphere.findUnique({ where: { id: sphereId }, select: { id: true } });
    if (!sphere) throw new HttpError(400, "Сфера не найдена");
  }

  return { sphereId, groupId };
}
