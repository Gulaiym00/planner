import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(styles.button, styles[variant], styles[size], className)} {...props} />;
}
