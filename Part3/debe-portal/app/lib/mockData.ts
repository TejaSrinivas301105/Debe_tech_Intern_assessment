import { Session } from "@/types/session";

// Mock data simulating what would come from Firestore.
// Datetimes are stored in UTC — exactly as they would be in a real Firestore document.
// The UI layer converts these to the parent's local timezone for display.
export const mockSessions: Session[] = [
  {
    id: "session-001",
    subject: "Mathematics",
    teacherName: "Ms. Anika Patel",
    datetime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    status: "confirmed",
  },
  {
    id: "session-002",
    subject: "English Literature",
    teacherName: "Mr. James Okafor",
    datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "confirmed",
  },
  {
    id: "session-003",
    subject: "Science",
    teacherName: "Dr. Priya Nair",
    datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "pending",
  },
];
