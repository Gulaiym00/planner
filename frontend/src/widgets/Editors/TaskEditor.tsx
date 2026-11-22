"use client";

import { useState, type FormEvent } from "react";
import { useActions } from "@/hooks/useActions";
import { useToday } from "@/hooks/useToday";
import { addDays, toDateKey } from "@/lib/dates";
import type { Task, TaskInput } from "@/types/task";
import { Button, FormField, Input, Modal, Textarea } from "@/ui";
import { OwnerSelect, type OwnerValue } from "@/widgets/OwnerSelect";
import styles from "./Editors.module.css";

export interface TaskEditorState {
  task?: Task;
  defaults?: Partial<TaskInput>;
}

export function TaskEditor({ task, defaults, onClose }: TaskEditorState & { onClose: () => void }) {
  const { createTask, updateTask } = useActions();
  const today = useToday();
  const [title, setTitle] = useState(task?.title ?? defaults?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [owner, setOwner] = useState<OwnerValue>({
    sphereId: task?.sphereId ?? defaults?.sphereId ?? null,
    groupId: task?.groupId ?? defaults?.groupId ?? null,
  });
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaults?.dueDate ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const data = { title, description, ...owner, dueDate: dueDate || null };
    const ok = task ? await updateTask(task.id, data) : await createTask(data);
    setSaving(false);
    if (ok) onClose();
  }

  const quickDates = [
    { label: "Сегодня", value: today.key },
    { label: "Завтра", value: toDateKey(addDays(today.date, 1)) },
    { label: "Через неделю", value: toDateKey(addDays(today.date, 7)) },
    { label: "Без срока", value: "" },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? "Изменить задачу" : "Новая задача"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="task-editor" disabled={saving || !title.trim()}>
            {task ? "Сохранить" : "Добавить"}
          </Button>
        </>
      }
    >
      <form id="task-editor" className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Что нужно сделать">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: ДЗ по математике, стр. 45"
            autoFocus
            required
          />
        </FormField>
        <FormField label="Описание">
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Необязательно"
          />
        </FormField>
        <OwnerSelect value={owner} onChange={setOwner} />
        <FormField label="Срок">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>
        <div className={styles.quick}>
          {quickDates.map((q) => (
            <Button
              key={q.label}
              size="sm"
              variant={dueDate === q.value ? "primary" : "ghost"}
              onClick={() => setDueDate(q.value)}
            >
              {q.label}
            </Button>
          ))}
        </div>
      </form>
    </Modal>
  );
}
