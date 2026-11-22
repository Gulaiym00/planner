"use client";

import { useState, type FormEvent } from "react";
import { useActions } from "@/hooks/useActions";
import { useSpheres } from "@/hooks/useData";
import { plural } from "@/lib/dates";
import type { Group } from "@/types/task";
import { Button, ColorPicker, FormField, Input, Modal, Select } from "@/ui";
import styles from "./Editors.module.css";

interface GroupEditorProps {
  group?: Group;
  /** Сфера для новой группы */
  sphereId: string;
  onClose: () => void;
}

export function GroupEditor({ group, sphereId, onClose }: GroupEditorProps) {
  const { createGroup, updateGroup, deleteGroup } = useActions();
  const { spheres } = useSpheres();
  const [name, setName] = useState(group?.name ?? "");
  const [color, setColor] = useState<string | null>(group?.color ?? null);
  const [targetSphere, setTargetSphere] = useState(group?.sphereId ?? sphereId);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveTo, setMoveTo] = useState("");

  const moveTargets = spheres
    .filter((s) => !s.archived)
    .map((s) => ({ sphere: s, groups: s.groups.filter((g) => g.id !== group?.id && !g.archived) }))
    .filter((s) => s.groups.length > 0);
  const firstTarget = moveTargets[0]?.groups[0]?.id ?? "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const ok = group
      ? await updateGroup(group.id, { name, color, sphereId: targetSphere })
      : await createGroup({ name, color, sphereId: targetSphere });
    setSaving(false);
    if (ok) onClose();
  }

  async function handleArchive() {
    if (!group) return;
    setSaving(true);
    const ok = await updateGroup(group.id, { archived: !group.archived });
    setSaving(false);
    if (ok) onClose();
  }

  async function handleDelete() {
    if (!group) return;
    setSaving(true);
    const ok = await deleteGroup(group.id, moveTo || undefined);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={group ? "Настройки группы" : "Новая группа"}
      footer={
        <>
          {group && !confirmDelete && (
            <div className={styles.footerStart}>
              <Button variant="ghost" disabled={saving} onClick={handleArchive}>
                {group.archived ? "Вернуть из архива" : "В архив"}
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Удалить
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="group-editor" disabled={saving || !name.trim()}>
            {group ? "Сохранить" : "Создать"}
          </Button>
        </>
      }
    >
      <form id="group-editor" className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Название" hint="Предмет, курс, тренировка — что угодно">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Математика"
            autoFocus
            required
          />
        </FormField>
        <FormField label="Сфера">
          <Select value={targetSphere} onChange={(e) => setTargetSphere(e.target.value)}>
            {spheres
              .filter((s) => !s.archived || s.id === targetSphere)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
          </Select>
        </FormField>
        <div className={styles.form}>
          <span className={styles.muted}>Цвет (необязательно — иначе как у сферы)</span>
          <div className={styles.quick}>
            <ColorPicker value={color} onChange={setColor} label="Цвет группы" />
            {color && (
              <Button size="sm" variant="ghost" onClick={() => setColor(null)}>
                Без цвета
              </Button>
            )}
          </div>
        </div>
      </form>

      {group && confirmDelete && (
        <div className={styles.dangerZone}>
          <p className={styles.dangerTitle}>Удалить «{group.name}»?</p>
          <p className={styles.muted}>
            В группе {group.activeTasks}{" "}
            {plural(group.activeTasks, ["активная задача", "активные задачи", "активных задач"])}. Что сделать с
            задачами и встречами?
          </p>
          <label className={styles.radio}>
            <input type="radio" name="group-delete" checked={!moveTo} onChange={() => setMoveTo("")} />
            Удалить вместе с группой
          </label>
          {firstTarget && (
            <label className={styles.radio}>
              <input
                type="radio"
                name="group-delete"
                checked={!!moveTo}
                onChange={() => setMoveTo(firstTarget)}
              />
              Перенести в другую группу
            </label>
          )}
          {moveTo && (
            <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Куда перенести">
              {moveTargets.map(({ sphere, groups }) => (
                <optgroup key={sphere.id} label={`${sphere.icon} ${sphere.name}`}>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          )}
          <div className={styles.quick}>
            <Button variant="danger" disabled={saving} onClick={handleDelete}>
              Да, удалить группу
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Не удалять
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
