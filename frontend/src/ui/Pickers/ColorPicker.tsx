import { cn } from "@/lib/cn";
import styles from "./Pickers.module.css";

export const PALETTE = ["#7c5cff", "#22c7b8", "#ff8a3d", "#e0a800", "#ff5fa2", "#3b82f6", "#16a34a", "#ef4444", "#8b5cf6", "#64748b"];

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
  label: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className={styles.row} role="radiogroup" aria-label={label}>
      {PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          className={cn(styles.swatch, value === color && styles.selected)}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
