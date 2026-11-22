"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "bip.liveBackground";
const EVENT = "bip:live-background";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Включён ли анимированный фон. Настройка хранится только в этом браузере */
export function useLiveBackground() {
  const enabled = useSyncExternalStore(subscribe, read, () => true);

  const setEnabled = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "on" : "off");
    } catch {
      // Хранилище недоступно (приватный режим) — настройка просто не запомнится
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [enabled, setEnabled] as const;
}
