"use client";

import { useEffect, useMemo, useState } from "react";
import { useEventList, useTaskList } from "@/hooks/useData";
import { useHotkey } from "@/hooks/useHotkey";
import { useRobot } from "@/hooks/useRobot";
import { useToday } from "@/hooks/useToday";
import { addDays, formatDayTitle, formatTime, plural, toDateKey } from "@/lib/dates";
import type { CalendarEvent, Task } from "@/types/task";
import { AnimatedNumber, Button, EmptyState, PageHeader, ProgressBar, Section } from "@/ui";
import { EventEditor, TaskEditor, type EventEditorState, type TaskEditorState } from "@/widgets/Editors";
import { EventList } from "@/widgets/EventList";
import { TaskList } from "@/widgets/TaskList";
import styles from "./TodayPage.module.css";

const TASKS = ["задача", "задачи", "задач"] as [string, string, string];

/** Раскладывает задачи по разделам экрана «Сегодня» */
function splitTasks(tasks: Task[], todayKey: string, weekKey: string) {
  const active = tasks.filter((t) => !t.completed);
  return {
    overdue: active.filter((t) => t.dueDate && t.dueDate < todayKey),
    today: active.filter((t) => t.dueDate === todayKey),
    soon: active.filter((t) => t.dueDate && t.dueDate > todayKey && t.dueDate <= weekKey),
    later: active.filter((t) => t.dueDate && t.dueDate > weekKey),
    noDate: active.filter((t) => !t.dueDate),
    done: tasks.filter((t) => t.completed),
  };
}

function buildIdleMessage(sections: ReturnType<typeof splitTasks>, events: CalendarEvent[]): string {
  const { overdue, today, done } = sections;
  if (overdue.length) return `Есть просроченные: ${overdue.length} ${plural(overdue.length, TASKS)}. Начнём с них?`;
  const next = events.find((e) => e.status === "planned" && new Date(e.startsAt) > new Date());
  if (next) return `Следующая встреча в ${formatTime(next.startsAt)}: «${next.title}»`;
  if (today.length) return `На сегодня ${today.length} ${plural(today.length, TASKS)}. Вперёд! 💪`;
  if (done.length) return "Всё на сегодня сделано! Ты супер ✨";
  return "Сегодня свободно. Добавим задачу? Нажми N";
}

export function TodayPage() {
  const today = useToday();
  const { setIdleMessage } = useRobot();
  const { tasks, isLoading, error } = useTaskList({ status: "active", doneSince: today.dayStart });
  const { events, error: eventsError } = useEventList({ from: today.dayStart, to: today.dayEnd });
  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null);
  const [eventEditor, setEventEditor] = useState<EventEditorState | null>(null);

  const newTask = () => setTaskEditor({ defaults: { dueDate: today.key } });
  const newEvent = () => setEventEditor({ defaults: { date: today.key } });
  useHotkey("KeyN", newTask);
  useHotkey("KeyM", newEvent);

  const sections = useMemo(
    () => splitTasks(tasks, today.key, toDateKey(addDays(today.date, 7))),
    [tasks, today],
  );

  const idleMessage = buildIdleMessage(sections, events);
  useEffect(() => setIdleMessage(idleMessage), [idleMessage, setIdleMessage]);

  const dayTotal = sections.overdue.length + sections.today.length + sections.done.length;
  const editTask = (task: Task) => setTaskEditor({ task });
  const editEvent = (event: CalendarEvent) => setEventEditor({ event });
  const title = formatDayTitle(today.date);
  const loadError = error ?? eventsError;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={title}
        title="Сегодня"
        subtitle={dayTotal ? "Твой день — по времени и по задачам" : "Спокойный день. Можно что-нибудь запланировать"}
        actions={
          <>
            <Button variant="ghost" onClick={newEvent}>
              + Встреча <kbd>M</kbd>
            </Button>
            <Button onClick={newTask}>
              + Задача <kbd>N</kbd>
            </Button>
          </>
        }
      />

      {dayTotal > 0 && (
        <div className={styles.progress} data-spotlight>
          <span>
            Сделано сегодня{" "}
            <b>
              <AnimatedNumber value={sections.done.length} />
            </b>{" "}
            из{" "}
            <b>
              <AnimatedNumber value={dayTotal} />
            </b>
          </span>
          <ProgressBar value={sections.done.length} max={dayTotal} label="Прогресс дня" />
        </div>
      )}

      {loadError && <EmptyState>⚠️ {loadError.message}</EmptyState>}

      <Section title="По времени" icon="🕒" count={events.length}>
        {events.length ? (
          <EventList events={events} onEdit={editEvent} />
        ) : (
          <EmptyState>Встреч на сегодня нет</EmptyState>
        )}
      </Section>

      {sections.overdue.length > 0 && (
        <Section title="Просрочено" icon="⚠️" tone="danger" count={sections.overdue.length}>
          <TaskList tasks={sections.overdue} todayKey={today.key} onEdit={editTask} />
        </Section>
      )}

      <Section title="На сегодня" icon="📌" count={sections.today.length}>
        {isLoading ? (
          <EmptyState>Загружаю…</EmptyState>
        ) : sections.today.length ? (
          <TaskList tasks={sections.today} todayKey={today.key} onEdit={editTask} />
        ) : (
          <EmptyState>На сегодня задач нет</EmptyState>
        )}
      </Section>

      {sections.soon.length > 0 && (
        <Section title="Ближайшие 7 дней" icon="📅" count={sections.soon.length}>
          <TaskList tasks={sections.soon} todayKey={today.key} onEdit={editTask} />
        </Section>
      )}

      {sections.later.length > 0 && (
        <Section title="Позже" icon="🗓" count={sections.later.length}>
          <TaskList tasks={sections.later} todayKey={today.key} onEdit={editTask} />
        </Section>
      )}

      {sections.noDate.length > 0 && (
        <Section title="Без срока" icon="🗂" count={sections.noDate.length}>
          <TaskList tasks={sections.noDate} todayKey={today.key} onEdit={editTask} />
        </Section>
      )}

      {sections.done.length > 0 && (
        <Section title="Сделано сегодня" icon="✅" count={sections.done.length}>
          <TaskList tasks={sections.done} todayKey={today.key} onEdit={editTask} />
        </Section>
      )}

      {taskEditor && <TaskEditor {...taskEditor} onClose={() => setTaskEditor(null)} />}
      {eventEditor && <EventEditor {...eventEditor} onClose={() => setEventEditor(null)} />}
    </div>
  );
}
