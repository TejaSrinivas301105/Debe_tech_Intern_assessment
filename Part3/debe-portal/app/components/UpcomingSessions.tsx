"use client";

import { useState } from "react";
import { Session } from "@/types/session";
import { mockSessions } from "@/app/lib/mockData";
import SessionCard from "./SessionCard";
import RescheduleForm from "./RescheduleForm";
import styles from "./UpcomingSessions.module.css";

export default function UpcomingSessions() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  function handleSuccess() {
    setSuccessId(selectedSession?.id ?? null);
    setSelectedSession(null);
  }

  return (
    <section className={styles.container} aria-label="Upcoming tutoring sessions">
      <h2 className={styles.heading}>Upcoming Sessions</h2>
      <p className={styles.subheading}>Your next {mockSessions.length} tutoring sessions</p>

      {/* role="status" + aria-live="polite" announces the success message to screen
          readers after form submission without interrupting current reading flow */}
      {successId && (
        <div
          className={styles.success}
          role="status"
          aria-live="polite"
        >
          ✓ Reschedule request submitted for{" "}
          <strong>{mockSessions.find((s) => s.id === successId)?.subject}</strong>. Your teacher will confirm shortly.
        </div>
      )}

      <div className={styles.grid}>
        {mockSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onReschedule={(s) => {
              setSuccessId(null); // clear previous success when opening a new form
              setSelectedSession(s);
            }}
          />
        ))}
      </div>

      {/* RescheduleForm renders as a modal overlay — only when a session is selected */}
      {selectedSession && (
        <RescheduleForm
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  );
}
