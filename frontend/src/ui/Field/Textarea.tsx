import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Field.module.css";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(styles.field, styles.textarea, className)} {...props} />;
}
