"use client";

import { useCallback, useMemo } from "react";
import { useSWRConfig } from "swr";
import { api } from "@/lib/api";
import type { RobotMood } from "@/types/robot";
import type {
  EventInput,
  EventUpdate,
  GroupInput,
  GroupUpdate,
  SphereInput,
  SphereUpdate,
  TaskInput,
  TaskUpdate,
} from "@/types/task";
import { useRobot } from "./useRobot";

type Resource = "spheres" | "tasks" | "events";

/**
 * Все изменения данных: вызывают API, обновляют кэш и запускают реакцию Бипа.
 * Возвращают true при успехе; ошибку показывает Бип.
 */
export function useActions() {
  const { mutate } = useSWRConfig();
  const { react } = useRobot();

  const refresh = useCallback(
    (...resources: Resource[]) =>
      mutate((key) => Array.isArray(key) && resources.includes(key[0] as Resource)),
    [mutate],
  );

  const run = useCallback(
    async (action: () => Promise<unknown>, refreshList: Resource[], mood?: RobotMood, message?: string) => {
      try {
        await action();
        await refresh(...refreshList);
        if (mood) react(mood, message);
        return true;
      } catch (e) {
        react("error", `Ой! ${(e as Error).message}`);
        return false;
      }
    },
    [refresh, react],
  );

  return useMemo(
    () => ({
      createTask: (data: TaskInput) =>
        run(() => api.tasks.create(data), ["tasks", "spheres"], "wave", "Записал задачу!"),
      updateTask: (id: string, data: TaskUpdate) =>
        run(
          () => api.tasks.update(id, data),
          ["tasks", "spheres"],
          data.completed === true ? "happy" : undefined,
          data.completed === true ? "Ура, одной задачей меньше!" : undefined,
        ),
      deleteTask: (id: string) => run(() => api.tasks.remove(id), ["tasks", "spheres"], "sad", "Задача удалена."),

      createEvent: (data: EventInput) =>
        run(() => api.events.create(data), ["events"], "wave", "Встреча в календаре! 🎉"),
      updateEvent: (id: string, data: EventUpdate) =>
        run(
          () => api.events.update(id, data),
          ["events"],
          data.status === "done" ? "happy" : undefined,
          data.status === "done" ? "Надеюсь, было здорово!" : undefined,
        ),
      deleteEvent: (id: string) => run(() => api.events.remove(id), ["events"], "sad", "Встреча удалена."),

      createSphere: (data: SphereInput) =>
        run(() => api.spheres.create(data), ["spheres"], "wave", `Новая сфера «${data.name}»!`),
      updateSphere: (id: string, data: SphereUpdate) => run(() => api.spheres.update(id, data), ["spheres"]),
      deleteSphere: (id: string, moveTo?: string) =>
        run(() => api.spheres.remove(id, moveTo), ["spheres", "tasks", "events"], "sad", "Сфера удалена."),

      createGroup: (data: GroupInput) =>
        run(() => api.groups.create(data), ["spheres"], "wave", `Добавил «${data.name}»!`),
      updateGroup: (id: string, data: GroupUpdate) =>
        run(() => api.groups.update(id, data), ["spheres", "tasks", "events"]),
      deleteGroup: (id: string, moveTo?: string) =>
        run(() => api.groups.remove(id, moveTo), ["spheres", "tasks", "events"], "sad", "Группа удалена."),
    }),
    [run],
  );
}
