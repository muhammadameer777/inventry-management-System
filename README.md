# CampusEvents — University Event Booking & Management System

> **Full-Stack Web Engineering PBL Assignment (Phase 1 + Phase 2 Complete)**  
> A full-stack, responsive web platform featuring an Apple-inspired liquid minimalist frontend, Node.js + Express REST API backend, and SQLite database managed with Prisma ORM.

---

## 🏛️ System Architecture

```
React 18 + Vite Frontend (Port 3000)
             │
             │ HTTP REST (JSON) + JWT Bearer Auth
             ▼
Node.js + Express.js API Server (Port 5000)
             │
             │ Prisma ORM Client
             ▼
SQLite Relational Database (dev.db)
```

- **Frontend**: React 18, Vite 5, React Router 6, Tailwind CSS (Apple liquid glass surfaces, dark/light themes), Lucide Icons.
- **Backend**: Express.js REST API, modular routes, controllers, and middleware (`requireAuth`, `requireAdmin`, `requireStudent`).
- **Database**: SQLite with Prisma ORM (foreign keys, cascading rules, unique active booking constraints).
- **Authentication**: JWT token bearer authorization with `bcryptjs` password hashing (salt rounds: 10).
- **Data Integrity**: Enforces strict backend-level capacity limits, duplicate registration prevention, and referential protection on deletions.

---

## 🚀 Key Features & Academic Requirements

### 1. Three Complete CRUD Modules (12+ Operations)
| Module | CREATE | READ | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| **1. Event Management** | Admin publishes new events with schedule, location & capacity | Public search, category pills, date filter, sorting | Admin edits title, date, location, capacity, or cover | Admin deletes event with modal confirmation |
| **2. Category Management** | Admin creates distinct academic tracks | Public/Admin views categories with live linked event counts | Admin modifies category name, description & icon | Admin deletes category (protected against active event dependencies) |
| **3. Booking Management** | Students self-book passes; Admins manually register students | Students view their active passes; Admins monitor all registrations | Admins adjust status (`Confirmed`, `Pending`, `Cancelled`) | Students cancel passes to release seats; Admins purge records |

### 2. Business Logic & Constraints
- **Capacity Enforcement**: When an event reaches maximum seating capacity, further booking attempts are rejected on the backend.
- **Duplicate Prevention**: SQLite unique constraint `[userId, eventId]` coupled with backend logic prevents multiple active bookings by the same student.
- **Referential Integrity**: Categories cannot be deleted if active events remain assigned to them.
- **Role Authorization**: Students cannot perform admin operations even if attempted directly via API tools.

---

## 📁 Project Directory Structure

```
eventmanagement/
├── frontend/                     # Client Application
│   ├── src/
│   │   ├── assets/              # Static branding and media assets
│   │   ├── components/
│   │   │   ├── common/          # Button, Input, Modal, ConfirmDialog, Navbar, Footer, Badge, Card
│   │   │   ├── dashboard/       # StatCard, visual distribution
│   │   │   ├── events/          # EventCard, EventFilters
│   │   │   └── layout/          # AppLayout, StudentLayout, AdminLayout
│   │   ├── context/             # AuthContext (real JWT), ThemeContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, AdminEvents, AdminCategories, AdminBookings
│   │   │   ├── public/          # HomePage, EventsPage, EventDetailPage, LoginPage, RegisterPage
│   │   │   └── student/         # StudentDashboard, MyBookings, StudentProfile
│   │   ├── services/            # Centralized API service layer
│   │   │   ├── api.js           # Fetch wrapper with JWT headers
│   │   │   ├── authService.js   # Login, register, me, profile
│   │   │   ├── bookingService.js # Full booking CRUD
│   │   │   ├── categoryService.js # Full category CRUD
│   │   │   └── eventService.js  # Full event CRUD
│   │   ├── styles/              # index.css (Liquid surfaces, custom glass scrollbar)
│   │   ├── App.jsx              # Protected routes & router tree
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                     # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma        # SQLite Prisma schema
│   │   ├── seed.js              # Database seed script
│   │   └── dev.db               # SQLite database file (ignored in git)
│   ├── src/
│   │   ├── config/              # db.js (Prisma client singleton)
│   │   ├── controllers/         # authController, eventController, categoryController, bookingController
│   │   ├── middleware/          # authMiddleware (requireAuth, requireAdmin), errorHandler
│   │   ├── routes/              # authRoutes, eventRoutes, categoryRoutes, bookingRoutes
│   │   └── app.js               # Express application config & CORS
│   ├── server.js                # Server entrypoint (Port 5000)
│   ├── package.json
│   ├── .env                     # Local environment variables
│   └── .env.example
├── .gitignore                   # Ignores node_modules, .env, *.db, dist
├── package.json                 # Monorepo scripts
└── README.md                    # Documentation
```

---

## 🔑 Demo Accounts (Seeded)

For grading and testing convenience, the database is pre-seeded with verified test accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusevents.local` | `admin123` | Dr. Sarah Mitchell (Office of Student Affairs) |
| **Student** | `student@campusevents.local` | `password123` | Ameer Rivera (ID: `CE-2026-8841`, CS Junior) |
| **Student 2** | `elena@campusevents.local` | `password123` | Elena Rostova (ID: `CE-2026-9214`, CE Sophomore) |
| **Student 3** | `marcus@campusevents.local` | `password123` | Marcus Vance (ID: `CE-2026-7350`, Finance Senior) |

> **PBL Evaluator Tip**:  
> - Use the **Student View** / **Admin View** switcher in the top navigation bar to switch between roles.  
> - On `/login`, click **Student Demo** or **Admin Demo** to fill in credentials automatically.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="campusevents-super-secret-jwt-key-2026-pbl"
CLIENT_ORIGIN="http://localhost:3000"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 🛠️ Step-by-Step Local Setup & Execution

### 1. Install Dependencies
```bash
# Install root, frontend, and backend packages
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Setup SQLite Database & Seed Data
```bash
# Push Prisma schema to SQLite dev.db
npm run db:push

# Seed the database with demo accounts, events, categories, and bookings
npm run db:seed
```

### 3. Start Backend Server (Port 5000)
```bash
npm run start:backend
# Or in dev mode with file watching:
npm run dev:backend
```
Verify the backend is live:
```bash
curl http://localhost:5000/api/health
```

### 4. Start Frontend Development Server (Port 3000)
```bash
npm run dev
# Or:
npm run dev:frontend
```
Open **`http://localhost:3000`** in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📡 API Reference Overview

### Health Check
- `GET /api/health` — Service status and database connection info.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create student account (hashes password, returns JWT).
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Retrieve verified user from Bearer token (`requireAuth`).
- `PUT /api/auth/profile` — Update contact, major, or academic year (`requireAuth`).

### Event Management (`/api/events`)
- `GET /api/events` — List events with search, category, sort, and date filters.
- `GET /api/events/:id` — View full event details with confirmed registration count.
- `POST /api/events` — Create new event (`requireAdmin`).
- `PUT /api/events/:id` — Update event details (`requireAdmin`).
- `DELETE /api/events/:id` — Delete event (`requireAdmin`).

### Category Management (`/api/categories`)
- `GET /api/categories` — List all categories and their linked event count.
- `GET /api/categories/:id` — View single category.
- `POST /api/categories` — Create category (`requireAdmin`).
- `PUT /api/categories/:id` — Update category (`requireAdmin`).
- `DELETE /api/categories/:id` — Delete category (`requireAdmin`; blocked if events depend on it).

### Booking & Registration Management (`/api/bookings`)
- `GET /api/bookings` — Student receives own passes; Admin receives all bookings (`requireAuth`).
- `GET /api/bookings/:id` — View single booking pass (`requireAuth`).
- `POST /api/bookings` — Register for event with duplicate & capacity checks (`requireAuth`).
- `PUT /api/bookings/:id` — Update status or notes (`requireAuth`).
- `POST /api/bookings/:id/cancel` — Cancel reservation & release seat (`requireAuth`).
- `DELETE /api/bookings/:id` — Purge booking record (`requireAdmin`).
# inventry-management-System
