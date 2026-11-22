"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { RobotMood } from "@/types/robot";
import styles from "./RobotHero.module.css";

// WebGL работает только в браузере, поэтому сцена грузится без SSR
const RobotScene = dynamic(() => import("./RobotScene"), {
  ssr: false,
  loading: () => <div className={styles.placeholder} aria-hidden="true" />,
});

interface RobotHeroProps {
  mood: RobotMood;
  reactionId: number;
  message: string;
  onPoke: () => void;
}

export function RobotHero({ mood, reactionId, message, onPoke }: RobotHeroProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className={styles.hero} aria-label="Робот-помощник Бип">
      {/* Луч света за Бипом; при каждой реакции вспыхивает заново */}
      <div key={reactionId} className={mood === "idle" ? styles.beam : `${styles.beam} ${styles.beamFlash}`} />
      <div className={styles.bubbleWrap} role="status" aria-live="polite">
        <p key={message} className={styles.bubble}>
          {message}
        </p>
      </div>
      <div className={styles.stage}>
        <RobotScene mood={mood} reactionId={reactionId} reducedMotion={reducedMotion} onPoke={onPoke} />
      </div>
      <p className={styles.hint}>Нажми на Бипа 👆</p>
    </section>
  );
}
