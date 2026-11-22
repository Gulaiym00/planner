"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { useSpotlight } from "@/hooks/useSpotlight";
import { LiveBackground } from "@/widgets/LiveBackground";
import { RobotPanel } from "@/widgets/RobotPanel";
import { Sidebar } from "@/widgets/Sidebar";
import { RobotProvider } from "./RobotProvider";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  useSpotlight();

  return (
    <SWRConfig value={{ revalidateOnFocus: true }}>
      <RobotProvider>
        <LiveBackground />
        <div className={styles.shell}>
          <aside className={styles.sidebar}>
            <Sidebar />
          </aside>
          <main className={styles.main}>{children}</main>
          <aside className={styles.robot}>
            <RobotPanel />
          </aside>
        </div>
      </RobotProvider>
    </SWRConfig>
  );
}
