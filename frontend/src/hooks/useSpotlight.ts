"use client";

import { useEffect } from "react";

const MAX_TILT_DEG = 3;

/**
 * Один общий обработчик на всю страницу: для элемента с [data-spotlight] под курсором
 * выставляет --mx/--my (световое пятно) и --rx/--ry (лёгкий 3D-наклон).
 */
export function useSpotlight() {
  useEffect(() => {
    let current: HTMLElement | null = null;

    function reset(el: HTMLElement) {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }

    function onMove(e: PointerEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.setProperty("--rx", `${(0.5 - y) * MAX_TILT_DEG}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * MAX_TILT_DEG}deg`);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}
