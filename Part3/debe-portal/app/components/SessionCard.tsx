"use client";

import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import styles from "./SessionCard.module.css";

interface Props {
  session: Session;
  onReschedule: (session: Session) => void;
}


function formatLocalTime(utcIso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short", 
  }).format(new Date(utcIso));
}

const statusColors: Record<Session["status"], string> = {
  confirmed: styles.confirmed,
  pending: styles.pending,
  cancelled: styles.cancelled,
};

export default function SessionCard({ session, onReschedule }: Props) {
  
  const [localTime, setLocalTime] = useState<string | null>(null);
  useEffect(() => {
    setLocalTime(formatLocalTime(session.datetime));
  }, [session.datetime]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.subject}>{session.subject}</span>
        <span className={`${styles.badge} ${statusColors[session.status]}`}>
          {session.status}
        </span>
      </div>
      <p className={styles.teacher}>👤 {session.teacherName}</p>
      
      <p className={styles.time}>🕐 {localTime ?? "Loading time..."}</p>
      <button
        className={styles.button}
        onClick={() => onReschedule(session)}
        disabled={session.status === "cancelled"}
      >
        Request Reschedule
      </button>
    </div>
  );
}
