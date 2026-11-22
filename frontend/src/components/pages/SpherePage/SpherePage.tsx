"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActions } from "@/hooks/useActions";
import { useEventList, useSpheres, useTaskList } from "@/hooks/useData";
import { useHotkey } from "@/hooks/useHotkey";
import { useRobot } from "@/hooks/useRobot";
import { useToday } from "@/hooks/useToday";
import { plural } from "@/lib/dates";
import type { CalendarEvent, Group, Task } from "@/types/task";
import { Button, EmptyState, PageHeader, Section } from "@/ui";
import {
  EventEditor,
  GroupEditor,
  SphereEditor,
  TaskEditor,
  type EventEditorState,
  type TaskEditorState,
} from "@/widgets/Editors";
import { EventList } from "@/widgets/EventList";
import { GroupCard } from "@/widgets/GroupCard";
import styles from "./SpherePage.module.css";

export function SpherePage({ sphereId }: { sphereId: string }) {
  const router = useRouter();
  const today = useToday();
  const { setIdleMessage } = useRobot();
  const { updateGroup } = useActions();
  const { sphereById, isLoading } = useSpheres();
  const sphere = sphereById.get(sphereId);

  const [showDone, setShowDone] = useState(false);
  const { tasks } = useTaskList({ sphereId, status: showDone ? "all" : "active" });
  const { events } = useEventList({ sphereId, from: today.dayStart });

  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null);
  const [eventEditor, setEventEditor] = useState<EventEditorState | null>(null);
  const [groupEditor, setGroupEditor] = useState<{ group?: Group } | null>(null);
  const [sphereEditor, setSphereEditor] = useState(false);

  const newTask = (groupId?: string) => setTaskEditor({ defaults: { sphereId, groupId } });
  const newEvent = () => setEventEditor({ defaults: { date: today.key, sphereId } });
  useHotkey("KeyN", () => newTask());
  useHotkey("KeyM", newEvent);

  const activeCount = sphere?.activeTasks ?? 0;
  useEffect(() => {
    if (sphere) {
      setIdleMessage(
        activeCount
          ? `${sphere.name}: ${activeCount} ${plural(activeCount, ["задача", "задачи", "задач"])} в работе`
          : `${sphere.name}: всё сделано! Добавим что-нибудь?`,
      );
    }
  }, [sphere, activeCount, setIdleMessage]);

  if (!sphere) {
    return isLoading ? (
      <EmptyState>Загружаю…</EmptyState>
    ) : (
      <EmptyState>
        Сфера не найдена. <Link href="/">На главную</Link>
      </EmptyState>
    );
  }

  const groups = sphere.groups.filter((g) => !g.archived);
  const archivedGroups = sphere.groups.filter((g) => g.archived);
  const tasksOf = (groupId: string | null) => tasks.filter((t) => t.groupId === groupId);
  const ungrouped = tasksOf(null);
  const editTask = (task: Task) => setTaskEditor({ task });
  const editEvent = (event: CalendarEvent) => setEventEditor({ event });

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={
          <>
            <span className="mono-emoji">{sphere.icon}</span> Сфера
          </>
        }
        title={sphere.name}
        subtitle={
          sphere.archived
            ? "В архиве"
            : `${activeCount} ${plural(activeCount, ["активная задача", "активные задачи", "активных задач"])} · ${groups.length} ${plural(groups.length, ["группа", "группы", "групп"])}`
        }
        actions={
          <>
            <Button variant="ghost" onClick={() => setSphereEditor(true)}>
              ⚙ Настроить
            </Button>
            <Button variant="ghost" onClick={newEvent}>
              + Встреча
            </Button>
            <Button variant="ghost" onClick={() => setGroupEditor({})}>
              + Группа
            </Button>
            <Button onClick={() => newTask()}>+ Задача</Button>
          </>
        }
      />

      {events.length > 0 && (
        <Section title="Ближайшие встречи" icon="🗓" count={events.length}>
          <EventList events={events} onEdit={editEvent} showDate showOwner={false} />
        </Section>
      )}

      <Section
        title="Задачи"
        icon="📋"
        action={
          <label className={styles.toggle}>
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Показать выполненные
          </label>
        }
      >
        <div className={styles.grid}>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={`group-${group.id}`}
              title={group.name}
              color={group.color ?? sphere.color}
              tasks={tasksOf(group.id)}
              todayKey={today.key}
              onAddTask={() => newTask(group.id)}
              onEditTask={editTask}
              onSettings={() => setGroupEditor({ group })}
            />
          ))}
          {(ungrouped.length > 0 || groups.length === 0) && (
            <GroupCard
              title="Без группы"
              color="#94a3b8"
              tasks={ungrouped}
              todayKey={today.key}
              onAddTask={() => newTask()}
              onEditTask={editTask}
            />
          )}
          <button type="button" className={styles.addGroup} onClick={() => setGroupEditor({})}>
            <span className={styles.plus}>+</span>
            Добавить группу
            <small>предмет, курс, тренировка…</small>
          </button>
        </div>
      </Section>

      {archivedGroups.length > 0 && (
        <Section title="Архив групп" icon="🗄" count={archivedGroups.length}>
          <ul className={styles.archive}>
            {archivedGroups.map((group) => (
              <li key={group.id}>
                <span>{group.name}</span>
                <Button size="sm" variant="ghost" onClick={() => updateGroup(group.id, { archived: false })}>
                  Вернуть
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setGroupEditor({ group })}>
                  Настроить
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {taskEditor && <TaskEditor {...taskEditor} onClose={() => setTaskEditor(null)} />}
      {eventEditor && <EventEditor {...eventEditor} onClose={() => setEventEditor(null)} />}
      {groupEditor && <GroupEditor {...groupEditor} sphereId={sphere.id} onClose={() => setGroupEditor(null)} />}
      {sphereEditor && (
        <SphereEditor sphere={sphere} onClose={() => setSphereEditor(false)} onDeleted={() => router.push("/")} />
      )}
    </div>
  );
}
