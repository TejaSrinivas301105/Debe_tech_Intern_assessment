# Intern Project — Full Submission

**Name:** Teja Srinivas
**GitHub:** https://github.com/TejaSrinivas301105

---

## Table of Contents

- [Part 1 — GitHub Portfolio Walkthrough](#part-1--github-portfolio-walkthrough)
- [Part 2 — Debug Challenge](#part-2--debug-challenge)
- [Part 3 — Feature Build: Debe Parent Portal](#part-3--feature-build-debe-parent-portal)
- [Part 4 — Demo Video](#part-4--demo-video)

---

# Part 1 — GitHub Portfolio Walkthrough

---

## Repository 1 — SmartBus System

**Repository:** https://github.com/TejaSrinivas301105/Crowd_Sense

### Problem It Solves

SmartBus System is a smart public transportation platform designed for rural and semi-urban commuters who have no reliable way to know where their bus is, how crowded it is, or when it will arrive.

In a traditional village bus service, passengers stand at a stop with no information — they do not know if the bus has already passed, how many seats are available, or how far away it currently is. This creates frustration and wasted time, especially for daily commuters.

The goal of SmartBus System is to bring real-time bus information into a single web platform powered by IoT hardware on the bus itself. The system includes live passenger counting, seat availability, GPS-based location tracking, distance calculation, ETA estimation, and a support ticket system — all accessible from a mobile browser.

### What I Specifically Built

I worked on the full-stack development of the SmartBus System, including the frontend, backend, IoT integration, and deployment.

**Frontend** — Built using React 19 and Vite with a dark glassmorphism UI theme using Tailwind CSS v4 and DaisyUI. Pages include Home, Routes, Detail (live bus card with auto-refresh every 10 seconds), About, Login/Sign Up, Queries, and Distance Tracker. Used Axios for all API communication and React Hot Toast for notifications.

**Backend** — Built using Node.js and Express v5 with clean separation of routes, controllers, and models. REST APIs for searching buses by route, fetching live bus details, receiving passenger count from ESP32 sensors, receiving and storing GPS coordinates, and returning the latest GPS location of any bus. Used MongoDB and Mongoose with two separate schemas — one for static bus details and one for time-series passenger count data.

**IoT Integration** — Integrated an ESP32 microcontroller on the bus that sends live passenger count data to the backend every few seconds via a POST API. The backend stores this using `findOneAndUpdate` with `upsert: true` so each bus always has exactly one live record.

**GPS Tracking** — The ESP32 is connected to a NEO-6M GPS module that sends coordinates, speed, and timestamp to the backend every 5 seconds. The frontend retrieves the latest coordinates and uses the Haversine formula to calculate the straight-line distance between the passenger's location (from the browser Geolocation API) and the bus. From distance and speed, the system calculates ETA and determines whether the bus is approaching or moving away.

**Deployment** — Backend on Render, frontend on Netlify. Configured `netlify.toml` and `public/_redirects` to handle SPA routing so page refreshes do not return 404 errors.

### Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS v4, DaisyUI |
| Routing | React Router v7 |
| API Communication | Axios |
| Backend | Node.js, Express v5 |
| Database | MongoDB, Mongoose |
| IoT Hardware | ESP32, NEO-6M GPS |
| Location | GPS + Haversine Formula |
| Deployment | Render, Netlify |

### Design Decision I Would Change Today

Currently the frontend uses polling — it sends a GET request every 5 to 10 seconds to check for new passenger count and GPS data. This works but it means the frontend is constantly making requests even when nothing has changed, which wastes bandwidth and adds unnecessary load on the server.

If I were designing the system from the beginning today, I would use WebSockets via Socket.io for real-time communication. Instead of the frontend asking for updates repeatedly, the backend would push new data to all connected clients the moment the ESP32 sends it. This would make the UI update instantly rather than waiting up to 10 seconds for the next poll cycle, and would be far more efficient when many passengers are viewing the same bus.

---

## Repository 2 — Ticket Support System

**Repository:** https://github.com/TejaSrinivas301105/Ticket-Support-System

### Problem It Solves

The Ticket Support System is a full-stack web application designed to manage customer queries, complaints, and service requests efficiently across critical public and private service domains.

In traditional service environments, customer complaints are submitted through phone calls, emails, or physical forms. Without a centralized system, these complaints get lost, response times increase, and customers are left without updates. The system serves three domains: Transportation (bus and train), Utilities (electric grids), and Telecommunications (TV cable and internet).

### What I Specifically Built

**Frontend** — Built using React.js and Vite. Pages include Login, Register, Dashboard (ticket summary cards), Tickets list with search and filters, New Ticket form, Ticket Response page for admins, and a Report page with bar and pie charts using Recharts. Used Axios for API communication and Framer Motion for animations. Implemented Protected Routes to prevent unauthorized access.

**Backend** — Built using Node.js and Express.js. Auth APIs at `/Auth/signup` and `/Auth/login`. Ticket APIs at `/get_Tickets` for full CRUD and status updates. Used JWT for authentication and bcryptjs for password hashing. Auth middleware protects all ticket routes.

**Database** — MongoDB with Mongoose. Two schemas: User Schema (name, email, hashed password) and Customer Query Schema (subject, priority, category, status, description, timestamps).

**Role-Based Access** — Users can create tickets and view status. Admins can view all tickets, filter by priority and status, and update ticket statuses in real time through the Admin Dashboard.

### Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS, DaisyUI |
| Animations | Framer Motion |
| Data Visualization | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |

### Design Decision I Would Change Today

Currently when an admin updates a ticket status, the user must manually refresh to see the change. If I were designing this from the beginning today, I would integrate WebSockets using Socket.io to push real-time status updates to the user as soon as an admin makes a change.

I would also plan a proper role-based access control (RBAC) system from the start, where the user role is stored in the JWT payload and verified on both backend routes and frontend protected pages — rather than relying only on frontend route protection, which can be bypassed.

---

# Part 2 — Debug Challenge

The task was to find and fix all bugs in a Firebase Cloud Function (`bookSession`) and document each fix with a comment explaining why it would fail in production.

## Bugs Found

| # | Bug | Production Impact |
|---|-----|-------------------|
| 1 | `onCall` handler not `async` | Cannot use `await` inside — all async operations become fire-and-forget |
| 2 | Missing `await` on `.get()` | `existing` is a Promise object, not a QuerySnapshot — double-booking check never runs |
| 3 | Missing `await` on `.add(booking)` | Function returns before write completes — bookings silently lost when function instance shuts down |
| 4 | No `context.auth` check | Any unauthenticated caller can create bookings — endpoint exposed to abuse |
| 5 | No input validation | Undefined fields written to Firestore, corrupting documents and causing silent failures downstream |

## original.ts

```ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface BookingRequest {
    studentId: string;
    teacherId: string;
    slot: string; // ISO datetime string
    subject: string;
}

export const bookSession = functions.https.onCall((data: BookingRequest, context) => {
    const booking = {
        studentId: data.studentId,
        teacherId: data.teacherId,
        slot: data.slot,
        subject: data.subject,
        status: "confirmed",
        createdAt: new Date(),
    };
    const teacherRef = db.collection("teachers").doc(data.teacherId);
    const existing = teacherRef.collection("bookings").where("slot", "==", data.slot).get();
    if (existing.docs.length > 0) {
        return { success: false, message: "Slot already booked" };
    }
    db.collection("bookings").add(booking);
    return { success: true };
});
```

## fixed.ts

```ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface BookingRequest {
    studentId: string;
    teacherId: string;
    slot: string;
    subject: string;
}

// The handler must be async because it performs multiple awaited Firestore operations.
export const bookSession = functions.https.onCall(async (data: BookingRequest, context) => {

    // Missing auth check: unauthenticated users could book sessions, bypassing any
    // user-level security. In production this exposes the endpoint to abuse and spam.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to book a session.");
    }

    // Missing input validation: writing documents with undefined fields corrupts the
    // Firestore data model and causes silent failures downstream (e.g. broken queries).
    if (!data.studentId || !data.teacherId || !data.slot || !data.subject) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required booking fields.");
    }

    const booking = {
        studentId: data.studentId,
        teacherId: data.teacherId,
        slot: data.slot,
        subject: data.subject,
        status: "confirmed",
        createdAt: new Date(),
    };

    const teacherRef = db.collection("teachers").doc(data.teacherId);

    // Missing await: .get() returns a Promise, so without await, existing is a Promise
    // object — not a QuerySnapshot. existing.docs is always undefined, meaning the
    // double-booking check never runs and the same slot can be booked multiple times.
    const existing = await teacherRef.collection("bookings").where("slot", "==", data.slot).get();

    if (existing.docs.length > 0) {
        return { success: false, message: "Slot already booked" };
    }

    // Missing await: without await the function returns { success: true } before the
    // Firestore write completes. In production the booking is frequently never saved,
    // especially when the Cloud Function instance shuts down immediately after returning.
    await db.collection("bookings").add(booking);

    return { success: true };
});
```

---

# Part 3 — Feature Build: Debe Parent Portal

A parent-facing widget built with Next.js App Router that shows a student's upcoming tutoring sessions and allows rescheduling through a mock Firebase Cloud Function.

**Live path:** `Part3/debe-portal`

## Requirements Coverage

| Requirement | Status |
|---|---|
| Next.js App Router | ✅ |
| 3 upcoming sessions (subject, teacherName, datetime, status) | ✅ |
| Request Reschedule button per session | ✅ |
| Date/time picker + reason dropdown (Conflict / Illness / Time zone / Other) | ✅ |
| Mock Cloud Function with typed response | ✅ |
| Validates slot not in the past | ✅ |
| Validates slot not identical to existing | ✅ |
| TypeScript throughout, no `any` | ✅ |
| Shared types between frontend and function | ✅ |
| Loading state | ✅ |
| Error state | ✅ |
| No unhandled promise rejections | ✅ |
| 2-hour lead-time constraint | ✅ |
| Local time display | ✅ |
| UTC storage | ✅ |
| Timezone reasoning visible in comments | ✅ |
| Incremental commits (scaffold → UI → validation → polish) | ✅ |

## Project Structure

```
Part3/debe-portal/
├── types/
│   └── session.ts          ← shared types (frontend + function both import from here)
├── app/
│   ├── layout.tsx           ← root layout with header and footer
│   ├── page.tsx             ← mounts UpcomingSessions widget
│   ├── globals.css
│   ├── layout.module.css
│   ├── lib/
│   │   ├── mockData.ts      ← static session array (UTC datetimes)
│   │   └── mockFunction.ts  ← stub for Firebase Cloud Function
│   └── components/
│       ├── SessionCard.tsx
│       ├── SessionCard.module.css
│       ├── UpcomingSessions.tsx
│       ├── UpcomingSessions.module.css
│       ├── RescheduleForm.tsx
│       └── RescheduleForm.module.css
```

## Shared Types — `types/session.ts`

```ts
export type SessionStatus = "confirmed" | "pending" | "cancelled";

export interface Session {
  id: string;
  subject: string;
  teacherName: string;
  // Stored as UTC ISO string throughout the app.
  // The UI is responsible for converting to the parent's local time for display.
  datetime: string;
  status: SessionStatus;
}

export type RescheduleReason = "Conflict" | "Illness" | "Time zone" | "Other";

export interface RescheduleRequest {
  sessionId: string;
  // New requested slot — sent to the function as UTC ISO string.
  // The frontend converts from local time to UTC before calling the function.
  newSlot: string;
  reason: RescheduleReason;
}

export interface RescheduleResponse {
  success: boolean;
  error?: string;
}
```

## Mock Cloud Function — `app/lib/mockFunction.ts`

```ts
import { RescheduleRequest, RescheduleResponse } from "@/types/session";
import { mockSessions } from "./mockData";

// Stub simulating the Firebase Cloud Function `requestReschedule`.
// In production this would be: httpsCallable(functions, "requestReschedule").
export async function requestReschedule(
  req: RescheduleRequest
): Promise<RescheduleResponse> {
  // Simulate network latency so loading states are visible during development.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const session = mockSessions.find((s) => s.id === req.sessionId);
  if (!session) {
    return { success: false, error: "Session not found." };
  }

  const now = new Date();
  const newSlot = new Date(req.newSlot);

  // Validation 1: new slot must not be in the past.
  if (newSlot <= now) {
    return { success: false, error: "The new slot cannot be in the past." };
  }

  // Validation 2: new slot must differ from the existing slot.
  if (req.newSlot === session.datetime) {
    return { success: false, error: "The new slot is the same as the current slot." };
  }

  return { success: true };
}
```

## Key Technical Decisions

### 1. Local Time Display with UTC Storage

All session datetimes are stored as UTC ISO strings — exactly as Firestore would store them. The display conversion happens only at the UI boundary using `Intl.DateTimeFormat(undefined)` where `undefined` means "use the browser's locale". A parent in India sees IST, a parent in the US sees EST — automatically.

When the parent picks a new time in the reschedule form, the `datetime-local` input returns a local time string like `2026-08-10T14:30`. Before sending to the function, this is converted to UTC:

```ts
const utcSlot = new Date(newSlot).toISOString();
```

Parent always sees local time. Function always receives UTC.

### 2. 2-Hour Lead-Time Constraint

```ts
function getMinDatetime(): string {
  const min = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return min.toISOString().slice(0, 16);
}
```

This sets the `min` attribute on the `datetime-local` input to `now + 2 hours`. The browser greys out any earlier slots. This enforces Debe's lead-time policy — teachers need at least 2 hours notice to prepare. The mock function also validates this server-side so the constraint cannot be bypassed by calling the function directly.

### 3. Hydration Fix

`Intl.DateTimeFormat` formats differently between Node.js (server) and the browser because the server has no user timezone context. Without a fix, Next.js throws a hydration mismatch error. The solution is to defer all locale-sensitive formatting to `useEffect` so it only runs in the browser:

```ts
const [localTime, setLocalTime] = useState<string | null>(null);
useEffect(() => {
  setLocalTime(formatLocalTime(session.datetime));
}, [session.datetime]);
```

Server and client both render `null` on first pass — they match. After hydration, `useEffect` fires and sets the correct local time.

### 4. No Unhandled Promise Rejections

Every async call is wrapped in `try/catch/finally`. The `finally` block always clears the loading state even if the function throws unexpectedly:

```ts
try {
  const res = await requestReschedule(req);
  if (res.success) { onSuccess(); }
  else { setError(res.error ?? "Something went wrong."); }
} catch {
  setError("Failed to reach the server. Please try again.");
} finally {
  setLoading(false);
}
```

## How to Run

```bash
cd Part3/debe-portal
npm install
npm run dev
```

Open `http://localhost:3000`

## Incremental Commits

| Commit | What was done |
|---|---|
| `scaffold` | Next.js app setup, folder structure, shared TypeScript types, mock data, Cloud Function stub |
| `UI` | SessionCard component, UpcomingSessions widget, local time display, wired into page.tsx |
| `validation logic` | RescheduleForm with 2-hour lead-time, local→UTC conversion, mock function call, loading and error states |
| `styling/polish` | globals.css cleanup, layout header/footer, card hover effects, accessibility (aria labels, roles, live regions), hydration fixes |

---

# Part 4 — Demo Video

**Recording of Part 3 — Debe Parent Portal walkthrough**

🎥 [Watch Demo on Google Drive](https://drive.google.com/file/d/1nMi9ZxWvtfjilTpYgkMwx5XD1otSZxue/view?usp=drive_link)

### What the recording covers

1. **Code walkthrough** — live walk through the folder structure, shared types, mock data, SessionCard, UpcomingSessions, RescheduleForm, and mock Cloud Function without prepared notes
2. **Local time / UTC explanation** — explaining out loud why datetimes are stored in UTC, how `Intl.DateTimeFormat(undefined)` picks up the parent's browser timezone automatically, and how the `datetime-local` input value is converted from local time to UTC before being sent to the function
3. **Live break + fix** — commenting out the UTC conversion line (`const utcSlot = new Date(newSlot).toISOString()`) on camera, explaining why sending a raw local time string like `2026-08-10T14:30` without a timezone suffix causes silent time-offset bugs in production, then restoring the fix
