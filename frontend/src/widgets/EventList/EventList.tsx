"use client";

import { useState } from "react";
import { useActions } from "@/hooks/useActions";
import { cn } from "@/lib/cn";
import { formatTime, formatWeekday } from "@/lib/dates";
import type { CalendarEvent, EventStatus } from "@/types/task";
import { Button, Chip } from "@/ui";
import { OwnerChip } from "@/widgets/OwnerSelect";
import styles from "./EventList.module.css";

interface EventListProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  /** Показывать день недели и дату — для списков не на один день */
  showDate?: boolean;
  showOwner?: boolean;
}

export function EventList({ events, onEdit, showDate = false, showOwner = true }: EventListProps) {
  return (
    <ul className={styles.list}>
      {events.map((event) => (
        <EventItem key={event.id} event={event} onEdit={onEdit} showDate={showDate} showOwner={showOwner} />
      ))}
    </ul>
  );
}

function EventItem({ event, onEdit, showDate, showOwner }: { event: CalendarEvent } & Omit<EventListProps, "events">) {
  const { updateEvent, deleteEvent } = useActions();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<boolean>) {
    setBusy(true);
    await action();
    setBusy(false);
  }
  const setStatus = (status: EventStatus) => run(() => updateEvent(event.id, { status }));

  return (
    <li className={cn(styles.item, styles[event.status])} data-spotlight>
      <div className={styles.time}>
        {showDate && <span className={styles.date}>{formatWeekday(event.startsAt)}</span>}
        <span className={styles.start}>{formatTime(event.startsAt)}</span>
        {event.endsAt && <span className={styles.end}>до {formatTime(event.endsAt)}</span>}
      </div>
      <div className={styles.body}>
        <span className={styles.title}>{event.title}</span>
        <div className={styles.meta}>
          {event.location && (
            <span>
              <span className="mono-emoji">📍</span> {event.location}
            </span>
          )}
          {event.people && (
            <span>
              <span className="mono-emoji">👥</span> {event.people}
            </span>
          )}
          {showOwner && <OwnerChip sphereId={event.sphereId} groupId={event.groupId} />}
          {event.status === "done" && <Chip tone="accent">✓ состоялась</Chip>}
          {event.status === "cancelled" && <Chip>отменена</Chip>}
        </div>
        {event.note && <span className={styles.note}>{event.note}</span>}
      </div>
      <div className={styles.actions}>
        {event.status === "planned" ? (
          <>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("done")}>
              ✓ Состоялась
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("cancelled")}>
              Отменить
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("planned")}>
            Вернуть
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit(event)}>
          Изменить
        </Button>
        <Button size="sm" variant="danger" disabled={busy} onClick={() => run(() => deleteEvent(event.id))}>
          Удалить
        </Button>
      </div>
    </li>
  );
}
