

# 📄 repo_map.md

## Task Tracking & Productivity Analytics System

---

# 🔷 1. Repository Overview

This project follows a **monorepo-style structure** with separate folders for frontend and backend.

```id="repo001"
project-root/
│
├── backend/        # Django + DRF API
├── frontend/       # React application
├── docs/           # Documentation files
├── .env            # Environment variables
├── README.md
└── docker-compose.yml (optional)
```

---

# 🔷 2. Backend Structure (Django)

```id="repo002"
backend/
│
├── manage.py
├── requirements.txt
├── .env
│
├── config/                # Project configuration
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── asgi.py / wsgi.py
│
├── apps/
│   ├── users/             # User management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services.py
│   │
│   ├── tasks/             # Task management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services.py
│   │
│   ├── reports/           # Analytics & reports
│   │   ├── views.py
│   │   ├── services.py
│   │   └── urls.py
│
├── common/                # Shared utilities
│   ├── models.py          # BaseModel (timestamps)
│   ├── permissions.py
│   ├── pagination.py
│   └── utils.py
│
├── db.sqlite3 / postgres config
```

---

# 🔷 3. Backend Design Notes

### 📌 apps/users

* Authentication (JWT)
* User model (custom if needed)

---

### 📌 apps/tasks

* Core business logic
* Handles:

  * CRUD operations
  * Status updates
  * Soft delete

---

### 📌 apps/reports

* Generates:

  * Weekly reports
  * Monthly reports
* Aggregation queries

---

### 📌 common/

Reusable logic:

* Base model (created_at, updated_at)
* Permissions
* Helpers

---

# 🔷 4. Frontend Structure (React)

```id="repo003"
frontend/
│
├── public/
├── src/
│   │
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── TaskCard.jsx
│   │   ├── Modal.jsx
│   │   └── Loader.jsx
│   │
│   ├── pages/             # Main screens
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Reports.jsx
│   │   └── Profile.jsx
│   │
│   ├── services/          # API calls
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── reportService.js
│   │
│   ├── context/           # Global state
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.js
│   │
│   ├── utils/             # Helpers
│   │   └── formatDate.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
│
├── package.json
└── .env
```

---

# 🔷 5. API Interaction Flow

```id="repo004"
React UI
   ↓
Service Layer (Axios)
   ↓
Django REST API
   ↓
Service Layer (Backend)
   ↓
Database
```

---

# 🔷 6. Environment Variables

## Backend (.env)

```id="repo005"
SECRET_KEY=
DEBUG=True
DATABASE_URL=
JWT_SECRET=
```

## Frontend (.env)

```id="repo006"
VITE_API_BASE_URL=http://localhost:8000/api
```

---

# 🔷 7. URL Structure

## Backend

```id="repo007"
/api/auth/
/api/tasks/
/api/reports/
```

---

## Frontend Routes

```id="repo008"
/
/login
/dashboard
/tasks
/reports
/profile
```

---

# 🔷 8. Naming Conventions

* Files: `snake_case` (backend), `camelCase` (frontend)
* Components: `PascalCase`
* API endpoints: REST standard

---

# 🔷 9. Git Strategy

* main → stable
* develop → active development
* feature/* → new features

---

# 🔷 10. Optional Enhancements

* Docker setup
* CI/CD pipeline
* Nginx reverse proxy
* Redis caching

---

# 🔷 11. Summary

This repository structure ensures:

* Clear separation of concerns
* Scalability
* Maintainability
* Easy collaboration

It aligns well with best practices for projects built using
Django + React.

---

