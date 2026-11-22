"use client";

import type { CSSProperties } from "react";
import type { Task } from "@/types/task";
import { EmptyState } from "@/ui";
import { TaskList } from "@/widgets/TaskList";
import styles from "./GroupCard.module.css";

interface GroupCardProps {
  id?: string;
  title: string;
  color: string;
  tasks: Task[];
  todayKey: string;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onSettings?: () => void;
}

export function GroupCard({ id, title, color, tasks, todayKey, onAddTask, onEditTask, onSettings }: GroupCardProps) {
  const active = tasks.filter((t) => !t.completed).length;

  return (
    <section id={id} className={styles.card} style={{ "--group-color": color } as CSSProperties} data-spotlight>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.dot} />
          {title}
          {active > 0 && <span className={styles.count}>{active}</span>}
        </h3>
        <div className={styles.tools}>
          <button type="button" className={styles.tool} onClick={onAddTask} aria-label={`Задача в «${title}»`}>
            +
          </button>
          {onSettings && (
            <button type="button" className={styles.tool} onClick={onSettings} aria-label={`Настроить «${title}»`}>
              ⚙
            </button>
          )}
        </div>
      </header>
      {tasks.length > 0 ? (
        <TaskList tasks={tasks} todayKey={todayKey} onEdit={onEditTask} showOwner={false} />
      ) : (
        <EmptyState>Задач нет</EmptyState>
      )}
    </section>
  );
}
