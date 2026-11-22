const pad = (n: number) => String(n).padStart(2, "0");
const DAY_MS = 24 * 60 * 60 * 1000;

/** Локальная дата в формате ГГГГ-ММ-ДД */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

const dayTitleFormat = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" });
const shortDateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const shortDateYearFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "short" });
const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

/** «среда, 8 октября» */
export const formatDayTitle = (d: Date) => dayTitleFormat.format(d);

/** «18:30» */
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** «сб, 10 окт.» */
export const formatWeekday = (iso: string) => weekdayFormat.format(new Date(iso));

/** Разница в днях между двумя ключами ГГГГ-ММ-ДД */
export const daysBetween = (fromKey: string, toKey: string) =>
  Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / DAY_MS);

/** «сегодня», «завтра», «вчера», «12 окт.» */
export function formatDue(dueKey: string, todayKey: string): string {
  const diff = daysBetween(todayKey, dueKey);
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  if (diff === -1) return "вчера";
  const date = parseDateKey(dueKey);
  return date.getFullYear() === parseDateKey(todayKey).getFullYear()
    ? shortDateFormat.format(date)
    : shortDateYearFormat.format(date);
}

/** ISO → значение для <input type="time"> */
export function toTimeValue(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Локальные дата + время → ISO для сервера */
export function combineDateTime(dateKey: string, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = parseDateKey(dateKey);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** Склонение: plural(3, ["задача", "задачи", "задач"]) → «задачи» */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
