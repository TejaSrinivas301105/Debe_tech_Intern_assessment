"use client";

import { useState, useEffect } from "react";
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
function getMinDatetime(): string {
  const min = new Date(Date.now() + 2 * 60 * 60 * 1000);
  // datetime-local input requires format: "YYYY-MM-DDTHH:MM"
  return min.toISOString().slice(0, 16);
}

export default function RescheduleForm({ session, onClose, onSuccess }: Props) {
  const [newSlot, setNewSlot] = useState<string>("");
  const [reason, setReason] = useState<RescheduleReason>("Conflict");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Here also Hydration Issue occurs
  const [timezone, setTimezone] = useState<string>("");
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    
    const utcSlot = new Date(newSlot).toISOString();
    //const utcSlot = newSlot;

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
      setError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 id="modal-title">Request Reschedule</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="Close reschedule form"
          >
            ✕
          </button>
        </div>

        <p className={styles.sessionInfo}>
          <strong>{session.subject}</strong> with {session.teacherName}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
        
          <label className={styles.label} htmlFor="new-slot">
            New Date & Time
            {timezone && (
              <span className={styles.hint}>
                (shown in your local time — {timezone})
              </span>
            )}
          </label>

        
          <input
            id="new-slot"
            type="datetime-local"
            className={styles.input}
            value={newSlot}
            min={getMinDatetime()}
            onChange={(e) => setNewSlot(e.target.value)}
            required
            aria-required="true"
          />

          <label className={styles.label} htmlFor="reason">
            Reason for Rescheduling
          </label>
          <select
            id="reason"
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

          <div aria-live="polite">
            {error && <p className={styles.error}>⚠ {error}</p>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
