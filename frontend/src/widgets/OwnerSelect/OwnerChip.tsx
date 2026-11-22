"use client";

import { useSpheres } from "@/hooks/useData";
import { Chip } from "@/ui";

interface OwnerChipProps {
  sphereId: string | null;
  groupId: string | null;
}

/** Метка «📚 Математика» — группа, а если её нет, сфера */
export function OwnerChip({ sphereId, groupId }: OwnerChipProps) {
  const { sphereById, groupById } = useSpheres();
  const sphere = sphereId ? sphereById.get(sphereId) : undefined;
  if (!sphere) return null;
  const group = groupId ? groupById.get(groupId) : undefined;

  return (
    <Chip color={group?.color ?? sphere.color}>
      <span className="mono-emoji">{sphere.icon}</span> {group ? group.name : sphere.name}
    </Chip>
  );
}
