"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { EventQuery, Group, Sphere, TaskQuery } from "@/types/task";

/** Все сферы вместе с архивными — фильтруем в интерфейсе, чтобы держать один кэш */
export function useSpheres() {
  const { data, error, isLoading } = useSWR(["spheres"], () => api.spheres.list());
  const spheres = data ?? [];

  const lookup = useMemo(() => {
    const sphereById = new Map<string, Sphere>();
    const groupById = new Map<string, Group>();
    for (const sphere of spheres) {
      sphereById.set(sphere.id, sphere);
      for (const group of sphere.groups) groupById.set(group.id, group);
    }
    return { sphereById, groupById };
  }, [spheres]);

  return { spheres, ...lookup, error: error as Error | undefined, isLoading };
}

export function useTaskList(params: TaskQuery) {
  const { data, error, isLoading } = useSWR(["tasks", params], () => api.tasks.list(params));
  return { tasks: data ?? [], error: error as Error | undefined, isLoading };
}

export function useEventList(params: EventQuery) {
  const { data, error, isLoading } = useSWR(["events", params], () => api.events.list(params));
  return { events: data ?? [], error: error as Error | undefined, isLoading };
}
