"use client";

import { useRobot } from "@/hooks/useRobot";
import type { RobotMood } from "@/types/robot";
import { RobotHero } from "@/widgets/RobotHero";

const DEFAULT_MESSAGES: Record<Exclude<RobotMood, "idle">, string> = {
  wave: "Привет!",
  happy: "Ура!",
  celebrate: "Ты супер! 🎉",
  sad: "Эх…",
  thinking: "Секундочку…",
  error: "Ой! Что-то пошло не так.",
};

const POKE_MESSAGES = [
  "Хи-хи, щекотно!",
  "Бип-буп! Я на месте 🤖",
  "Готов помогать с делами!",
  "Эй, давай лучше задачи делать 😄",
];

export function RobotPanel() {
  const { reaction, react, idleMessage } = useRobot();
  const message =
    reaction.mood === "idle" ? idleMessage : (reaction.message ?? DEFAULT_MESSAGES[reaction.mood]);

  return (
    <RobotHero
      mood={reaction.mood}
      reactionId={reaction.id}
      message={message}
      onPoke={() => react("wave", POKE_MESSAGES[Math.floor(Math.random() * POKE_MESSAGES.length)])}
    />
  );
}
