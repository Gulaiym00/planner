"use client";

import { useState, type FormEvent } from "react";
import { useActions } from "@/hooks/useActions";
import { useSpheres } from "@/hooks/useData";
import { plural } from "@/lib/dates";
import type { Sphere } from "@/types/task";
import { Button, ColorPicker, EmojiPicker, FormField, Input, Modal, Select } from "@/ui";
import styles from "./Editors.module.css";

interface SphereEditorProps {
  sphere?: Sphere;
  onClose: () => void;
  onDeleted?: () => void;
}

export function SphereEditor({ sphere, onClose, onDeleted }: SphereEditorProps) {
  const { createSphere, updateSphere, deleteSphere } = useActions();
  const { spheres } = useSpheres();
  const [name, setName] = useState(sphere?.name ?? "");
  const [icon, setIcon] = useState(sphere?.icon ?? "📌");
  const [color, setColor] = useState(sphere?.color ?? "#7c5cff");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveTo, setMoveTo] = useState("");

  const others = spheres.filter((s) => s.id !== sphere?.id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const data = { name, icon, color };
    const ok = sphere ? await updateSphere(sphere.id, data) : await createSphere(data);
    setSaving(false);
    if (ok) onClose();
  }

  async function handleArchive() {
    if (!sphere) return;
    setSaving(true);
    const ok = await updateSphere(sphere.id, { archived: !sphere.archived });
    setSaving(false);
    if (ok) onClose();
  }

  async function handleDelete() {
    if (!sphere) return;
    setSaving(true);
    const ok = await deleteSphere(sphere.id, moveTo || undefined);
    setSaving(false);
    if (ok) {
      onClose();
      onDeleted?.();
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={sphere ? "Настройки сферы" : "Новая сфера"}
      footer={
        <>
          {sphere && !confirmDelete && (
            <div className={styles.footerStart}>
              <Button variant="ghost" disabled={saving} onClick={handleArchive}>
                {sphere.archived ? "Вернуть из архива" : "В архив"}
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Удалить
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="sphere-editor" disabled={saving || !name.trim()}>
            {sphere ? "Сохранить" : "Создать"}
          </Button>
        </>
      }
    >
      <form id="sphere-editor" className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Название">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Работа, Хобби"
            autoFocus
            required
          />
        </FormField>
        <div className={styles.form}>
          <span className={styles.muted}>Иконка</span>
          <EmojiPicker value={icon} onChange={setIcon} label="Иконка сферы" />
        </div>
        <div className={styles.form}>
          <span className={styles.muted}>Цвет</span>
          <ColorPicker value={color} onChange={setColor} label="Цвет сферы" />
        </div>
      </form>

      {sphere && confirmDelete && (
        <div className={styles.dangerZone}>
          <p className={styles.dangerTitle}>
            Удалить «{sphere.icon} {sphere.name}»?
          </p>
          <p className={styles.muted}>
            В сфере {sphere.groups.length} {plural(sphere.groups.length, ["группа", "группы", "групп"])} и{" "}
            {sphere.activeTasks} {plural(sphere.activeTasks, ["активная задача", "активные задачи", "активных задач"])}.
            Что сделать с ними?
          </p>
          <label className={styles.radio}>
            <input type="radio" name="sphere-delete" checked={!moveTo} onChange={() => setMoveTo("")} />
            Удалить всё вместе со сферой
          </label>
          {others.length > 0 && (
            <label className={styles.radio}>
              <input
                type="radio"
                name="sphere-delete"
                checked={!!moveTo}
                onChange={() => setMoveTo(others[0].id)}
              />
              Перенести группы, задачи и встречи в другую сферу
            </label>
          )}
          {moveTo && (
            <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Куда перенести">
              {others.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </Select>
          )}
          <div className={styles.quick}>
            <Button variant="danger" disabled={saving} onClick={handleDelete}>
              Да, удалить сферу
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
