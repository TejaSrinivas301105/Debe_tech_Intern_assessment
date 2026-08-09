"use client";

import { useState } from "react";
import { Session } from "@/types/session";
import { mockSessions } from "@/app/lib/mockData";
import SessionCard from "./SessionCard";
import styles from "./UpcomingSessions.module.css";

export default function UpcomingSessions() {
  // selectedSession drives whether the reschedule form is open.
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Upcoming Sessions</h2>
      <p className={styles.subheading}>Your next {mockSessions.length} tutoring sessions</p>
      <div className={styles.grid}>
        {mockSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onReschedule={(s) => setSelectedSession(s)}
          />
        ))}
      </div>

      {selectedSession && (
        <p className={styles.placeholder}>
          Form coming in next commit — selected: <strong>{selectedSession.subject}</strong>
        </p>
      )}
    </section>
  );
}
