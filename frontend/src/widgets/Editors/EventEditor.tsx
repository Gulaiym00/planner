"use client";

import { useState, type FormEvent } from "react";
import { useActions } from "@/hooks/useActions";
import { useToday } from "@/hooks/useToday";
import { combineDateTime, toDateKey, toTimeValue } from "@/lib/dates";
import type { CalendarEvent } from "@/types/task";
import { Button, FormField, Input, Modal, Textarea } from "@/ui";
import { OwnerSelect, type OwnerValue } from "@/widgets/OwnerSelect";
import styles from "./Editors.module.css";

export interface EventEditorState {
  event?: CalendarEvent;
  defaults?: { date?: string; sphereId?: string | null; groupId?: string | null };
}

export function EventEditor({ event, defaults, onClose }: EventEditorState & { onClose: () => void }) {
  const { createEvent, updateEvent } = useActions();
  const today = useToday();
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event ? toDateKey(new Date(event.startsAt)) : (defaults?.date ?? today.key));
  const [startTime, setStartTime] = useState(event ? toTimeValue(event.startsAt) : "18:00");
  const [endTime, setEndTime] = useState(event?.endsAt ? toTimeValue(event.endsAt) : "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [people, setPeople] = useState(event?.people ?? "");
  const [note, setNote] = useState(event?.note ?? "");
  const [owner, setOwner] = useState<OwnerValue>({
    sphereId: event?.sphereId ?? defaults?.sphereId ?? null,
    groupId: event?.groupId ?? defaults?.groupId ?? null,
  });
  const [saving, setSaving] = useState(false);

  const endBeforeStart = endTime !== "" && endTime < startTime;
  const canSave = title.trim() && date && startTime && !endBeforeStart && !saving;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const data = {
      title,
      startsAt: combineDateTime(date, startTime),
      endsAt: endTime ? combineDateTime(date, endTime) : null,
      location,
      people,
      note,
      ...owner,
    };
    const ok = event ? await updateEvent(event.id, data) : await createEvent(data);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? "Изменить встречу" : "Новая встреча"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="event-editor" disabled={!canSave}>
            {event ? "Сохранить" : "Добавить"}
          </Button>
        </>
      }
    >
      <form id="event-editor" className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Что за встреча">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Кино с Аней"
            autoFocus
            required
          />
        </FormField>
        <div className={styles.row}>
          <FormField label="Дата">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </FormField>
          <FormField label="Начало">
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </FormField>
          <FormField label="Окончание">
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </FormField>
        </div>
        {endBeforeStart && <p className={styles.error}>Окончание не может быть раньше начала</p>}
        <div className={styles.row}>
          <FormField label="Где">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Необязательно" />
          </FormField>
          <FormField label="С кем">
            <Input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Необязательно" />
          </FormField>
        </div>
        <FormField label="Заметка">
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Например: купить подарок, взять 500 ₽"
          />
        </FormField>
        <OwnerSelect value={owner} onChange={setOwner} />
      </form>
    </Modal>
  );
}
