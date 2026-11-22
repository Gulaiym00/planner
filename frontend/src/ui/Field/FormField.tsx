import type { ReactNode } from "react";
import styles from "./Field.module.css";

interface FormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

/** Подпись над полем. Само поле передаётся children и оборачивается в <label> */
export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <label className={styles.formField}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}
