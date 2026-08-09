"use client";

import { useState } from "react";
import { Session, RescheduleReason, RescheduleRequest } from "@/types/session";
import { requestReschedule } from "@/app/lib/mockFunction";
import styles from "./RescheduleForm.module.css";

interface Props {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS: RescheduleReason[] = ["Conflict", "Illness", "Time zone", "Other"];

// The minimum bookable datetime is NOW + 2 hours.
// This enforces Debe's lead-time policy: teachers need at least 2 hours notice
// to prepare. Without this, a parent could reschedule 5 minutes before a session,
// leaving the teacher with no time to react.
function getMinDatetime(): string {
  const min = new Date(Date.now() + 2 * 60 * 60 * 1000);
  // datetime-local input requires format: "YYYY-MM-DDTHH:MM"
  // We slice off seconds and the "Z" — the value is in LOCAL time (browser's timezone).
  // This is intentional: the input shows local time to the parent, but we convert
  // to UTC before sending to the function (see handleSubmit below).
  return min.toISOString().slice(0, 16);
}

export default function RescheduleForm({ session, onClose, onSuccess }: Props) {
  const [newSlot, setNewSlot] = useState<string>("");
  const [reason, setReason] = useState<RescheduleReason>("Conflict");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // The datetime-local input gives us a LOCAL time string like "2026-08-10T14:30".
    // new Date() treats this as local time and converts it to UTC internally.
    // .toISOString() then gives us the UTC ISO string to send to the function.
    // This is the critical conversion: parent sees local time, function receives UTC.
    const utcSlot = new Date(newSlot).toISOString();

    const req: RescheduleRequest = {
      sessionId: session.id,
      newSlot: utcSlot,
      reason,
    };

    try {
      const res = await requestReschedule(req);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    } catch {
      // Catch any unexpected errors (network failure, function crash etc.)
      // so they never surface as unhandled promise rejections in production.
      setError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Request Reschedule</h3>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <p className={styles.sessionInfo}>
          <strong>{session.subject}</strong> with {session.teacherName}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            New Date & Time
            <span className={styles.hint}>
              (shown in your local time — {Intl.DateTimeFormat().resolvedOptions().timeZone})
            </span>
          </label>

          {/* min enforces the 2-hour lead-time policy at the input level.
              Slots within 2 hours of now are not selectable — the browser
              greys them out. The function also validates this server-side. */}
          <input
            type="datetime-local"
            className={styles.input}
            value={newSlot}
            min={getMinDatetime()}
            onChange={(e) => setNewSlot(e.target.value)}
            required
          />

          <label className={styles.label}>Reason for Rescheduling</label>
          <select
            className={styles.select}
            value={reason}
            onChange={(e) => setReason(e.target.value as RescheduleReason)}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Error state — shown inline so the parent doesn't lose form context */}
          {error && <p className={styles.error}>⚠ {error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
