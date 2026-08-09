import { Session } from "@/types/session";


export const mockSessions: Session[] = [
  {
    id: "session-001",
    subject: "Mathematics",
    teacherName: "Ms. Neha Agarwal",
    datetime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    status: "confirmed",
  },
  {
    id: "session-002",
    subject: "Operating System",
    teacherName: "Ms. Jenny",
    datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "confirmed",
  },
  {
    id: "session-003",
    subject: "Computer Networks",
    teacherName: "Dr. Priya Nair",
    datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "pending",
  },
];
