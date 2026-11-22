"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { useSpheres } from "@/hooks/useData";
import { useLiveBackground } from "@/hooks/useLiveBackground";
import { cn } from "@/lib/cn";
import type { Sphere } from "@/types/task";
import { SphereEditor } from "@/widgets/Editors";
import styles from "./Sidebar.module.css";

function RobotLogo() {
  return (
    <svg viewBox="0 0 40 40" className={styles.logo} aria-hidden="true">
      <line x1="20" y1="4" x2="20" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="4" r="3" fill="#fff" />
      <rect x="6" y="10" width="28" height="22" rx="9" fill="currentColor" />
      <rect x="10" y="14" width="20" height="13" rx="5" fill="var(--surface)" />
      <circle cx="16" cy="20" r="2.4" fill="#fff" />
      <circle cx="24" cy="20" r="2.4" fill="#fff" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { spheres, isLoading, error } = useSpheres();
  const [creating, setCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [liveBackground, setLiveBackground] = useLiveBackground();

  const active = spheres.filter((s) => !s.archived);
  const archived = spheres.filter((s) => s.archived);

  return (
    <nav className={styles.sidebar} aria-label="Навигация">
      <Link href="/" className={styles.brand}>
        <RobotLogo />
        <span>
          <span className={styles.brandTitle}>Планер Бипа</span>
          <span className={styles.brandSubtitle}>учёба, дела, встречи</span>
        </span>
      </Link>

      <Link href="/" className={cn(styles.link, pathname === "/" && styles.active)}>
        <span className="mono-emoji" aria-hidden="true">☀️</span> Сегодня
      </Link>

      <div className={styles.heading}>
        <span>Сферы</span>
        <button type="button" className={styles.add} onClick={() => setCreating(true)} aria-label="Новая сфера">
          +
        </button>
      </div>

      {isLoading && <p className={styles.muted}>Загружаю…</p>}
      {error && <p className={styles.muted}>Не удалось загрузить сферы</p>}

      <ul className={styles.list}>
        {active.map((sphere) => (
          <SphereLink key={sphere.id} sphere={sphere} pathname={pathname} />
        ))}
      </ul>

      {archived.length > 0 && (
        <>
          <button type="button" className={styles.archiveToggle} onClick={() => setShowArchived((v) => !v)}>
            <span className="mono-emoji">🗄</span> Архив ({archived.length}) {showArchived ? "▴" : "▾"}
          </button>
          {showArchived && (
            <ul className={cn(styles.list, styles.archived)}>
              {archived.map((sphere) => (
                <SphereLink key={sphere.id} sphere={sphere} pathname={pathname} />
              ))}
            </ul>
          )}
        </>
      )}

      <label className={styles.switch}>
        <input
          type="checkbox"
          role="switch"
          checked={liveBackground}
          onChange={(e) => setLiveBackground(e.target.checked)}
        />
        <span className={styles.track} aria-hidden="true" />
        Живой фон
      </label>

      <p className={styles.hotkeys}>
        <kbd>N</kbd> задача · <kbd>M</kbd> встреча
      </p>

      {creating && <SphereEditor onClose={() => setCreating(false)} />}
    </nav>
  );
}

function SphereLink({ sphere, pathname }: { sphere: Sphere; pathname: string }) {
  const href = `/spheres/${sphere.id}`;
  const isActive = pathname === href;
  const groups = sphere.groups.filter((g) => !g.archived);

  return (
    <li style={{ "--sphere-color": sphere.color } as CSSProperties}>
      <Link href={href} className={cn(styles.link, styles.sphere, isActive && styles.active)}>
        <span className="mono-emoji" aria-hidden="true">
          {sphere.icon}
        </span>
        <span className={styles.name}>{sphere.name}</span>
        <span className={styles.dot} />
        {sphere.activeTasks > 0 && <span className={styles.badge}>{sphere.activeTasks}</span>}
      </Link>
      {isActive && groups.length > 0 && (
        <ul className={styles.groups}>
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`${href}#group-${group.id}`} className={styles.group}>
                <span className={styles.dot} style={{ background: group.color ?? sphere.color }} />
                <span className={styles.name}>{group.name}</span>
                {group.activeTasks > 0 && <span className={styles.badge}>{group.activeTasks}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
