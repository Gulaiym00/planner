"use client";

import { createContext, useContext } from "react";
import type { RobotMood, RobotReaction } from "@/types/robot";

export interface RobotContextValue {
  reaction: RobotReaction;
  react: (mood: RobotMood, message?: string) => void;
  /** Что Бип говорит в спокойном состоянии — задаёт текущая страница */
  idleMessage: string;
  setIdleMessage: (message: string) => void;
}

export const RobotContext = createContext<RobotContextValue | null>(null);

export function useRobot(): RobotContextValue {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error("useRobot must be used inside <RobotProvider>");
  return ctx;
}
