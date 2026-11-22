"use client";

import { useMemo, useState, type ReactNode } from "react";
import { RobotContext } from "@/hooks/useRobot";
import { useRobotReaction } from "@/hooks/useRobotReaction";

export function RobotProvider({ children }: { children: ReactNode }) {
  const { reaction, react } = useRobotReaction();
  const [idleMessage, setIdleMessage] = useState("Привет! Я Бип.");

  const value = useMemo(() => ({ reaction, react, idleMessage, setIdleMessage }), [reaction, react, idleMessage]);

  return <RobotContext.Provider value={value}>{children}</RobotContext.Provider>;
}
