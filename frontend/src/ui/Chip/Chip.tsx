import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Chip.module.css";

interface ChipProps {
  children: ReactNode;
  /** Цвет точки слева — единственное цветное в монохромном интерфейсе */
  color?: string | null;
  tone?: "default" | "danger" | "accent";
}

export function Chip({ children, color, tone = "default" }: ChipProps) {
  return (
    <span className={cn(styles.chip, styles[tone])}>
      {color && <span className={styles.dot} style={{ background: color }} />}
      {children}
    </span>
  );
}
