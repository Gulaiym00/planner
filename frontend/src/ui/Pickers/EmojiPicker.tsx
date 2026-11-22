import { cn } from "@/lib/cn";
import styles from "./Pickers.module.css";

const EMOJIS = ["📚", "🎓", "💪", "🏠", "🎉", "💼", "🎨", "🎵", "🍳", "🧹", "🛒", "💊", "✈️", "💻", "📝", "⚽", "🧘", "🐶", "💰", "📌"];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  label: string;
}

export function EmojiPicker({ value, onChange, label }: EmojiPickerProps) {
  return (
    <div className={styles.row} role="radiogroup" aria-label={label}>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="radio"
          aria-checked={value === emoji}
          className={cn(styles.emoji, value === emoji && styles.selected)}
          onClick={() => onChange(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
