"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import styles from "./Checkbox.module.css";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const PARTICLES = 10;

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  // Ключ всплеска частиц: меняется при каждой отметке, чтобы анимация проигрывалась заново
  const [burst, setBurst] = useState(0);

  return (
    <label className={cn(styles.box, checked && styles.checked, disabled && styles.disabled)}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.checked) setBurst((b) => b + 1);
          onChange(e.target.checked);
        }}
        aria-label={label}
      />
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      {burst > 0 && (
        <span key={burst} className={styles.burst} aria-hidden="true">
          {Array.from({ length: PARTICLES }, (_, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{ "--angle": `${(360 / PARTICLES) * i + (i % 2) * 14}deg`, "--dist": `${18 + (i % 3) * 7}px` } as CSSProperties}
            />
          ))}
        </span>
      )}
    </label>
  );
}
