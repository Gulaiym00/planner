"use client";

import { useSpheres } from "@/hooks/useData";
import { FormField, Select } from "@/ui";
import styles from "./OwnerSelect.module.css";

export interface OwnerValue {
  sphereId: string | null;
  groupId: string | null;
}

interface OwnerSelectProps {
  value: OwnerValue;
  onChange: (value: OwnerValue) => void;
}

/** Выбор сферы и группы внутри неё. Архивные показываются, только если уже выбраны */
export function OwnerSelect({ value, onChange }: OwnerSelectProps) {
  const { spheres, sphereById } = useSpheres();
  const sphereOptions = spheres.filter((s) => !s.archived || s.id === value.sphereId);
  const groupOptions = value.sphereId
    ? (sphereById.get(value.sphereId)?.groups ?? []).filter((g) => !g.archived || g.id === value.groupId)
    : [];

  return (
    <div className={styles.row}>
      <FormField label="Сфера">
        <Select
          value={value.sphereId ?? ""}
          onChange={(e) => onChange({ sphereId: e.target.value || null, groupId: null })}
        >
          <option value="">Без сферы</option>
          {sphereOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Группа (предмет, курс…)">
        <Select
          value={value.groupId ?? ""}
          disabled={groupOptions.length === 0}
          onChange={(e) => onChange({ ...value, groupId: e.target.value || null })}
        >
          <option value="">{groupOptions.length ? "Без группы" : "Нет групп"}</option>
          {groupOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
