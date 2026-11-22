"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, startOfDay, toDateKey } from "@/lib/dates";

/** Текущий день с границами для запросов. Обновляется сам после полуночи */
export function useToday() {
  const [key, setKey] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setKey(toDateKey(new Date())), 60_000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    const date = startOfDay(new Date());
    return {
      key,
      date,
      dayStart: date.toISOString(),
      dayEnd: addDays(date, 1).toISOString(),
    };
  }, [key]);
}
