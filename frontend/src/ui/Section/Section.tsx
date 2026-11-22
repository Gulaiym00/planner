"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";
import { AnimatedNumber } from "../AnimatedNumber/AnimatedNumber";
import styles from "./Section.module.css";

interface SectionProps {
  title: string;
  icon?: string;
  count?: number;
  action?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}

/** Раздел с заголовком-«таблеткой». Плавно проявляется, когда доходит прокрутка */
export function Section({ title, icon, count, action, tone = "default", children }: SectionProps) {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={cn(styles.section, visible && styles.visible, tone === "danger" && styles.danger)}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {icon && (
            <span className="mono-emoji" aria-hidden="true">
              {icon}
            </span>
          )}
          {title}
          {count !== undefined && (
            <span className={styles.count}>
              <AnimatedNumber value={count} />
            </span>
          )}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
