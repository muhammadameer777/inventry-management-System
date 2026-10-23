# CampusEvents Backend API Architecture (Phase 2 Roadmap)

This directory contains the planned backend service architecture for **CampusEvents — University Event Booking & Management System**.

## 1. Planned Relational Database Schema

```sql
-- Users Entity
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'STUDENT' CHECK(role IN ('STUDENT', 'ADMIN')),
  student_id VARCHAR(50),
  department VARCHAR(255),
  major VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Entity (CRUD Module 2)
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Entity (CRUD Module 1)
CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(36) REFERENCES categories(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  registered_count INTEGER DEFAULT 0 CHECK(registered_count >= 0),
  organizer VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  cover_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'Published' CHECK(status IN ('Published', 'Draft', 'Archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Entity (CRUD Module 3)
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  reference_code VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  event_id VARCHAR(36) REFERENCES events(id) ON DELETE CASCADE,
  ticket_type VARCHAR(100) DEFAULT 'Standard Student Pass',
  status VARCHAR(20) DEFAULT 'Confirmed' CHECK(status IN ('Confirmed', 'Pending', 'Cancelled')),
  notes TEXT,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id) -- Prevents duplicate booking
);
```

## 2. API Endpoints Map

### Auth & User (`/api/auth`)
- `POST /api/auth/register` - Create student account with hashed password
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Retrieve current session user

### CRUD Module 1: Events (`/api/events`)
- `GET /api/events` - List all events (supports query: search, category, sort, date)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin protected)
- `PUT /api/events/:id` - Update event (Admin protected)
- `DELETE /api/events/:id` - Delete event with cascading checks (Admin protected)

### CRUD Module 2: Categories (`/api/categories`)
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category (Admin protected)
- `PUT /api/categories/:id` - Update category (Admin protected)
- `DELETE /api/categories/:id` - Delete category (Admin protected)

### CRUD Module 3: Bookings (`/api/bookings`)
- `GET /api/bookings` - List bookings (filtered by user_id for student, or all for admin)
- `GET /api/bookings/:id` - Get single booking pass
- `POST /api/bookings` - Create reservation (validates capacity & duplicate prevention)
- `PUT /api/bookings/:id` - Update booking status (Admin protected)
- `POST /api/bookings/:id/cancel` - Cancel booking & decrement registered count
- `DELETE /api/bookings/:id` - Remove booking record (Admin protected)
