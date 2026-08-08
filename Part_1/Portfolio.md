# Part 1 — GitHub Portfolio Walkthrough

## GitHub Profile

**GitHub:** https://github.com/TejaSrinivas301105

---

# Repository — SmartBus System

**Repository:** https://github.com/TejaSrinivas301105/Crowd_Sense

## Project Title

**SmartBus System — Real-Time IoT-Powered Bus Tracking Platform**

## Problem It Solves

SmartBus System is a smart public transportation platform designed for rural and semi-urban commuters who have no reliable way to know where their bus is, how crowded it is, or when it will arrive.

In a traditional village bus service, passengers stand at a stop with no information — they do not know if the bus has already passed, how many seats are available, or how far away it currently is. This creates frustration and wasted time, especially for daily commuters.

The goal of SmartBus System is to bring real-time bus information into a single web platform powered by IoT hardware on the bus itself. The system includes live passenger counting, seat availability, GPS-based location tracking, distance calculation, ETA estimation, and a support ticket system — all accessible from a mobile browser.

---

## What I Specifically Built

I worked on the full-stack development of the SmartBus System, including the frontend, backend, IoT integration, and deployment.

### Frontend

I developed the frontend using **React 19 and Vite** with a dark glassmorphism UI theme using **Tailwind CSS v4 and DaisyUI**.

The application has the following pages:

- **Home** — landing page with hero section and key features
- **Routes** — bus search by From / To location with voice input support
- **Detail** — live bus detail card with auto-refresh every 10 seconds
- **About** — project information, tech stack, team, and how it works
- **Login / Sign Up** — authentication pages with password strength indicator
- **Queries** — support ticket submission form
- **Distance Tracker** — real-time distance and ETA from user to bus

I used **Axios** for all API communication and **React Hot Toast** for user notifications. All API base URLs are stored in environment variables using Vite's `import.meta.env` pattern so the app works in both local development and production without code changes.

### Backend

I developed the backend using **Node.js and Express v5** following a clean separation of routes, controllers, and models.

The backend provides REST APIs for:

- Searching buses by route
- Fetching live bus details with passenger count
- Receiving passenger count data from ESP32 sensors
- Receiving and storing GPS coordinates from ESP32
- Returning the latest GPS location of any bus

I used **MongoDB and Mongoose** for data storage with two separate schemas — one for static bus details and one for time-series passenger count data. CORS is configured to only allow specific trusted origins.

### IoT Integration — ESP32 Passenger Counting

I integrated an **ESP32 microcontroller** on the bus that sends live passenger count data to the backend every few seconds via a POST API. The backend stores this in a time-series collection using `findOneAndUpdate` with `upsert: true` so each bus always has exactly one live record that gets overwritten with the latest count.

When a passenger views a bus detail card, the frontend fetches the latest passenger count and calculates available seats in real time.

### GPS-Based Real-Time Location Tracking

I implemented GPS-based bus tracking as a core feature of the system.

The ESP32 on the bus is connected to a **NEO-6M GPS module** that sends the current coordinates, speed, and timestamp to the backend through a POST API every 5 seconds. The backend stores this in a dedicated `BusLocation` collection.

The frontend retrieves the latest bus GPS coordinates through a GET API and uses the **Haversine formula** to calculate the straight-line distance between the passenger's location (from the browser Geolocation API) and the bus.

From the distance and the bus's current speed, the system calculates an **Estimated Time of Arrival (ETA)** and determines whether the bus is approaching or moving away from the passenger.

The resulting flow is:

```
ESP32 + NEO-6M GPS on Bus
        ↓
POST /getBuses/location (every 5s)
        ↓
Node.js / Express Backend
        ↓
MongoDB — BusLocation collection
        ↓
GET /getBuses/location/:busnumber
        ↓
React Frontend
        ↓
Haversine Distance + ETA + Direction Status
```

### Deployment

The backend is deployed on **Render** and the frontend on **Netlify**. I configured `netlify.toml` and a `public/_redirects` file to handle SPA routing so page refreshes do not return 404 errors. Environment variables are managed separately for local development and production.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS v4, DaisyUI |
| Routing | React Router v7 |
| API Communication | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express v5 |
| Database | MongoDB |
| ODM | Mongoose |
| IoT Hardware | ESP32, NEO-6M GPS |
| Location Tracking | GPS + Haversine Formula |
| API Style | REST APIs |
| Deployment | Render (Backend), Netlify (Frontend) |

---

## High-Level Architecture

```text
                    ┌─────────────────────────┐
                    │         User            │
                    │      Web Browser        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    React 19 + Vite      │
                    │                         │
                    │  Home / Routes / Detail │
                    │  Login / Signup / About │
                    │  Queries / Distance     │
                    └────────────┬────────────┘
                                 │
                             Axios / HTTP
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Node.js + Express v5  │
                    │                         │
                    │        Routes           │
                    │           ↓             │
                    │      Controllers        │
                    │           ↓             │
                    │        Models           │
                    └────────────┬────────────┘
                                 │
                             Mongoose
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        MongoDB          │
                    │                         │
                    │  BusDetails             │
                    │  BusTimeSeries          │
                    │  BusLocation            │
                    └─────────────────────────┘


ESP32 + Sensor on Bus
        │
        │ POST /getBuses/personcount
        ▼
┌─────────────────────────┐
│  Node.js / Express      │
│  Passenger Count API    │
└────────────┬────────────┘
             │
             │ GET /getBuses/:busnumber
             ▼
┌─────────────────────────┐
│  React Frontend         │
│  Live Seat Availability │
│  Auto-refresh 10s       │
└─────────────────────────┘


ESP32 + NEO-6M GPS on Bus
        │
        │ POST /getBuses/location (every 5s)
        ▼
┌─────────────────────────┐
│  Node.js / Express      │
│  GPS Location API       │
└────────────┬────────────┘
             │
             │ GET /getBuses/location/:busnumber
             ▼
┌─────────────────────────┐
│  React Frontend         │
│                         │
│  Haversine Distance     │
│  ETA Calculation        │
│  Coming / Leaving Status│
└─────────────────────────┘
```

---

## One Design Decision I Would Make Differently Today

One design decision I would improve is how the application handles real-time data updates between the backend and the frontend.

Currently the frontend uses **polling** — it sends a GET request every 5 to 10 seconds to check for new passenger count and GPS data. This works but it means the frontend is constantly making requests even when nothing has changed, which wastes bandwidth and adds unnecessary load on the server.

If I were designing the system from the beginning today, I would use **WebSockets via Socket.io** for real-time communication. Instead of the frontend asking for updates repeatedly, the backend would push new data to all connected clients the moment the ESP32 sends it. This would make the UI update instantly rather than waiting up to 10 seconds for the next poll cycle.

This change would also make the system more scalable — with polling, every connected user makes their own repeated requests. With WebSockets, the server broadcasts one update to all connected clients at once, which is far more efficient when many passengers are viewing the same bus.

---

## What I Learned

Through this project I gained practical experience building a production-grade full-stack application and connecting a React frontend with a Node.js/Express backend deployed on real cloud infrastructure.

The project also helped me understand:

- REST API design and route ordering to avoid conflicts
- Frontend-backend communication with Axios and environment variables
- MongoDB data modeling with separate schemas for different data types
- Express.js routing, controllers, and middleware
- IoT integration — receiving and processing real-world sensor data
- GPS coordinate handling and the Haversine distance formula
- ETA calculation from distance and speed
- Real-time data patterns — polling vs WebSockets
- SPA deployment on Netlify with redirect configuration
- CORS configuration for secure cross-origin requests
- Structuring a full-stack application for maintainability

Most importantly, integrating the ESP32 IoT sensor taught me the difference between an application that displays static data and one that must handle continuously changing real-world data from physical hardware. This required thinking about data freshness, update frequency, and what happens when the hardware goes offline.



---

# Repository 2 — Ticket Support System

**Repository:** https://github.com/TejaSrinivas301105/Ticket-Support-System

## Project Title

**Ticket Support System — Universal Customer Query and Complaint Management Platform**

## Problem It Solves

The Ticket Support System is a full-stack web application designed to manage customer queries, complaints, and service requests efficiently across critical public and private service domains.

In traditional service environments, customer complaints are often submitted through phone calls, emails, or physical forms. Without a centralized system, these complaints get lost, response times increase, and customers are left without updates on their issues. This creates operational chaos and erodes public trust.

The goal of the Ticket Support System is to bring all customer complaints into a single, organized platform where users can raise tickets and admins can track, manage, and resolve them in real time.

The system is designed to serve three critical domains:

- **Transportation (Bus & Train Services):** Passengers can report delayed schedules, lost luggage, ticketing errors, or vehicle breakdowns. Admins can view and respond to these tickets in real time.
- **Utilities (Electric Grids):** Residents can raise high-priority tickets for power outages or equipment failures. Grid admins can track complaint volumes by location and deploy maintenance crews efficiently.
- **Telecommunications (TV Cable & Internet):** Users experiencing signal loss, billing errors, or broken cables can submit detailed tickets. Support agents can update ticket statuses from Opened to In Progress to Resolved, keeping users informed throughout.

---

## What I Specifically Built

I worked on the full-stack development of the Ticket Support System, including both the frontend and backend.

### Frontend

I developed the frontend using **React.js and Vite** and built the complete user interface for the application.

The application includes the following pages:

- **Login and Register pages** for user authentication with form validation and toast notifications.
- **Dashboard** that displays ticket summary cards and recent ticket activity.
- **Tickets page** that lists all submitted tickets with search, priority, and status filters.
- **New Ticket page** where users can submit a ticket with fields for name, email, subject, priority, category, and description.
- **Ticket Response page** where admins can view a specific ticket and update its status.
- **Report page** with interactive data visualizations including a bar chart for monthly ticket volume and a pie chart for ticket status distribution.

I used **Axios** for all API communication with the backend and **Framer Motion** for smooth page and component animations. I also implemented **Protected Routes** on the frontend to prevent unauthorized users from accessing the dashboard and admin pages.

### Backend

I developed the backend using **Node.js and Express.js** following a clean separation of routes, controllers, and models.

The backend exposes two sets of REST APIs:

- **Auth APIs** at `/Auth/signup` and `/Auth/login` for user registration and login.
- **Ticket APIs** at `/get_Tickets` for full CRUD operations and status updates on tickets.

I used **JWT (JSON Web Tokens)** for authentication and **bcryptjs** for password hashing. I also implemented an **auth middleware** that protects all ticket routes, ensuring only authenticated users can access or modify ticket data.

### Database

I used **MongoDB** with **Mongoose** to store and manage application data. I designed two schemas:

- **User Schema** — stores name, email, and hashed password with a unique email constraint.
- **Customer Query Schema** — stores ticket data including name, email, subject, priority, category, status, description, and timestamps.

### Role-Based Access

The application supports two roles:

- **Users** can create tickets and view their status.
- **Admins** can view all tickets, filter by priority and status, and update ticket statuses in real time through the Admin Dashboard.

---

## Technology Stack

| Layer             | Technologies                        |
| ----------------- | ----------------------------------- |
| Frontend          | React.js, Vite                      |
| Styling           | Tailwind CSS, DaisyUI               |
| Animations        | Framer Motion                       |
| API Communication | Axios                               |
| Data Visualization| Recharts                            |
| Backend           | Node.js, Express.js                 |
| Database          | MongoDB                             |
| ODM               | Mongoose                            |
| Authentication    | JWT (JSON Web Tokens), bcryptjs     |
| API Style         | REST APIs                           |

---

## High-Level Architecture

```text
                       ┌──────────────────────┐
                       │        User          │
                       │     Web Browser      │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   React + Vite       │
                       │                      │
                       │   Login / Register   │
                       │   Dashboard          │
                       │   Tickets List       │
                       │   New Ticket Form    │
                       │   Ticket Response    │
                       │   Report / Charts    │
                       └──────────┬───────────┘
                                  │
                           Axios / HTTP
                           + JWT Token
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Node.js + Express    │
                       │                      │
                       │  /Auth/signup        │
                       │  /Auth/login         │
                       │                      │
                       │  Auth Middleware      │
                       │       ↓              │
                       │  /get_Tickets (CRUD) │
                       │       ↓              │
                       │    Controllers       │
                       │       ↓              │
                       │      Models          │
                       └──────────┬───────────┘
                                  │
                              Mongoose
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │       MongoDB        │
                       │                      │
                       │   Users Collection   │
                       │   Queries Collection │
                       └──────────────────────┘
```

---

## One Design Decision I Would Make Differently Today

One design decision I would improve is how the application handles real-time ticket status updates.

Currently, when an admin updates a ticket status, the change is saved to the database and the user must manually refresh or revisit the page to see the updated status. This creates a delay in communication between the admin and the user.

If I were designing the system from the beginning today, I would integrate **WebSockets** using Socket.io to push real-time status updates to the user as soon as an admin makes a change. This would allow users to see their ticket progress live without any manual refresh.

I would also plan a proper **role-based access control (RBAC)** system from the start, where the user role is stored in the JWT payload and verified on both the backend routes and frontend protected pages. This would make the admin and user separation more secure and scalable compared to the current approach of relying only on frontend route protection.

These changes would make the system more responsive, more secure, and better prepared to scale to a larger number of users and tickets.

---

## What I Learned

Through this project, I gained practical experience in building a complete full-stack MERN application from scratch and connecting all layers together.

The project helped me understand:

* Real user authentication using JWT and bcryptjs
* Password hashing and secure token-based session management
* REST API design with Express.js
* Protecting backend routes using custom middleware
* MongoDB data modeling with Mongoose
* Frontend-backend communication using Axios
* Protected routes on the frontend using React Router
* Role-based dashboards for users and admins
* Data visualization using Recharts (bar charts and pie charts)
* Smooth UI animations using Framer Motion
* Structuring a full-stack application with clean separation of concerns
* Thinking about scalability, real-time features, and future architectural improvements

Most importantly, building the authentication system end-to-end — from hashing passwords on signup, to issuing JWT tokens on login, to verifying those tokens on every protected API request — gave me a solid understanding of how secure web applications manage identity and access.

