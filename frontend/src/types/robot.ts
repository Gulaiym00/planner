export type RobotMood = "idle" | "happy" | "wave" | "sad" | "celebrate" | "thinking" | "error";

export interface RobotReaction {
  mood: RobotMood;
  /** Увеличивается при каждой реакции, чтобы анимация перезапускалась даже при том же настроении */
  id: number;
  message?: string;
}
