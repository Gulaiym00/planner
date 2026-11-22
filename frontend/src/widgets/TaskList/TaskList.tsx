"use client";

import { useState } from "react";
import { useActions } from "@/hooks/useActions";
import { cn } from "@/lib/cn";
import { formatDue } from "@/lib/dates";
import type { Task } from "@/types/task";
import { Button, Checkbox, Chip } from "@/ui";
import { OwnerChip } from "@/widgets/OwnerSelect";
import styles from "./TaskList.module.css";

interface TaskListProps {
  tasks: Task[];
  todayKey: string;
  onEdit: (task: Task) => void;
  /** Показывать сферу/группу — на странице сферы это лишнее */
  showOwner?: boolean;
}

export function TaskList({ tasks, todayKey, onEdit, showOwner = true }: TaskListProps) {
  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} todayKey={todayKey} onEdit={onEdit} showOwner={showOwner} />
      ))}
    </ul>
  );
}

function TaskItem({ task, todayKey, onEdit, showOwner }: { task: Task } & Omit<TaskListProps, "tasks">) {
  const { updateTask, deleteTask } = useActions();
  const [busy, setBusy] = useState(false);
  const overdue = !task.completed && task.dueDate !== null && task.dueDate < todayKey;

  async function run(action: () => Promise<boolean>) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  return (
    <li className={cn(styles.item, task.completed && styles.completed)} data-spotlight>
      <Checkbox
        checked={task.completed}
        disabled={busy}
        onChange={(completed) => run(() => updateTask(task.id, { completed }))}
        label={`Выполнено: ${task.title}`}
      />
      <div className={styles.body}>
        <span className={styles.title}>{task.title}</span>
        {task.description && <span className={styles.description}>{task.description}</span>}
        {(showOwner || task.dueDate) && (
          <div className={styles.meta}>
            {showOwner && <OwnerChip sphereId={task.sphereId} groupId={task.groupId} />}
            {task.dueDate && (
              <Chip tone={overdue ? "danger" : "default"}>
                <span className="mono-emoji">📅</span> {overdue ? "просрочено: " : ""}
                {formatDue(task.dueDate, todayKey)}
              </Chip>
            )}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
          Изменить
        </Button>
        <Button size="sm" variant="danger" disabled={busy} onClick={() => run(() => deleteTask(task.id))}>
          Удалить
        </Button>
      </div>
    </li>
  );
}
