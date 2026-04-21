

# 📄 architecture.md

## Task Tracking & Productivity Analytics System

---

# 🔷 1. Overview

This project is a **full-stack web application** designed to manage tasks and analyze user productivity over time. It follows a **client-server architecture**, where the frontend communicates with a backend API, which in turn interacts with a database.

The system is designed to be **scalable, modular, and easy to deploy**.

---

# 🔷 2. High-Level Architecture

```id="arch001"
-------------------------------------------------
|                  Frontend                     |
|                  (React)                     |
-------------------------------------------------
                    ↓ API Calls
-------------------------------------------------
|                  Backend                      |
|                  (Django REST API)            |
-------------------------------------------------
                    ↓ ORM
-------------------------------------------------
|                  Database                     |
|              (PostgreSQL / MySQL)             |
-------------------------------------------------
```

---

# 🔷 3. Technology Stack

## Frontend

* React
* Axios (API communication)
* Tailwind CSS (UI styling)

## Backend

* Django
* Django REST Framework

## Database

* PostgreSQL (preferred)
* Alternative: MySQL

## Deployment

* Frontend: Vercel
* Backend: Render / Railway
* Database: Supabase / Railway

---

# 🔷 4. Backend Architecture (Django)

The backend follows a **layered architecture**:

```id="arch002"
Client Request
      ↓
URL Router (urls.py)
      ↓
Views (APIView / ViewSets)
      ↓
Serializers
      ↓
Models (ORM)
      ↓
Database
```

---

## 4.1 Components

### 📌 Models

Defines database schema:

* User
* Task

---

### 📌 Serializers

* Convert model data → JSON
* Validate incoming request data

---

### 📌 Views (API Layer)

* Handle HTTP requests
* Implement business logic

---

### 📌 URL Routing

* Maps endpoints to views

---

# 🔷 5. Frontend Architecture (React)

```id="arch003"
Components
   ↓
Pages (Dashboard, Tasks, Reports)
   ↓
Services (API calls)
   ↓
Backend API
```

---

## 5.1 Structure

* **Components** → Reusable UI elements
* **Pages** → Full screens
* **Services** → API integration
* **State Management** → useState / Context API

---

# 🔷 6. Database Design

## 6.1 Users Table

| Field      | Type        |
| ---------- | ----------- |
| id         | Primary Key |
| name       | String      |
| email      | Unique      |
| password   | Hashed      |
| created_at | Timestamp   |

---

## 6.2 Tasks Table

| Field        | Type        |
| ------------ | ----------- |
| id           | Primary Key |
| user_id      | Foreign Key |
| title        | String      |
| description  | Text        |
| status       | Enum        |
| remarks      | Text        |
| created_at   | Timestamp   |
| updated_at   | Timestamp   |
| completed_at | Timestamp   |
| due_date     | Date        |
| is_deleted   | Boolean     |

---

# 🔷 7. API Architecture

## REST Endpoints

```id="arch004"
POST   /api/tasks/              → Create task
GET    /api/tasks/              → List tasks
PUT    /api/tasks/{id}/         → Update task
DELETE /api/tasks/{id}/         → Soft delete
PATCH  /api/tasks/{id}/status/  → Update status

GET /api/reports/weekly/
GET /api/reports/monthly/
```

---

# 🔷 8. Authentication Flow

* User logs in
* Backend validates credentials
* JWT token is generated
* Frontend stores token
* Token sent in headers for protected routes

---

# 🔷 9. Data Flow

```id="arch005"
User Action (UI)
      ↓
React Component
      ↓
API Call (Axios)
      ↓
Django REST API
      ↓
Database Query
      ↓
Response वापस to Frontend
```

---

# 🔷 10. Key Design Decisions

### ✅ Soft Delete

* `is_deleted = true`
* Preserves historical data for reports

---

### ✅ Timestamp Tracking

* Enables analytics
* Supports reporting

---

### ✅ Separation of Concerns

* UI, API, and DB are independent
* Improves scalability

---

# 🔷 11. Scalability Considerations

* Modular Django apps
* Pagination for large task lists
* Indexing on:

  * user_id
  * created_at
* API optimization

---

# 🔷 12. Future Enhancements

* Real-time notifications
* Background jobs (Celery + Redis)
* Role-based access control
* Advanced analytics dashboard
* Mobile application

---

# 🔷 13. Deployment Architecture

```id="arch006"
[ React App (Vercel) ]
          ↓
[ Django API (Render/Railway) ]
          ↓
[ PostgreSQL DB (Cloud) ]
```

---

# 🔷 14. Conclusion

The system is designed using a **modern full-stack architecture** with clear separation between frontend, backend, and database layers. Using Django and React ensures rapid development, maintainability, and scalability, making it suitable as both a learning project and a production-ready foundation.

---

