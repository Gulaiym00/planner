"use client";

import { useEffect, useRef } from "react";

/**
 * Горячая клавиша без модификаторов. Не срабатывает, когда фокус в поле ввода или открыто окно.
 * Сравниваем по event.code, чтобы работало и в русской раскладке (KeyN = «т»).
 */
export function useHotkey(code: string, handler: () => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== code || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector("dialog[open]")) return;
      e.preventDefault();
      handlerRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [code]);
}
