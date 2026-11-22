"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RobotMood, RobotReaction } from "@/types/robot";

/** Короткая реакция робота, которая через `duration` мс возвращается в idle */
export function useRobotReaction(duration = 2600) {
  const [reaction, setReaction] = useState<RobotReaction>({ mood: "idle", id: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const react = useCallback(
    (mood: RobotMood, message?: string) => {
      clearTimeout(timer.current);
      setReaction((r) => ({ mood, message, id: r.id + 1 }));
      timer.current = setTimeout(() => setReaction((r) => ({ mood: "idle", id: r.id + 1 })), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { reaction, react };
}
