import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Field.module.css";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(styles.field, styles.select, className)} {...props} />;
}
