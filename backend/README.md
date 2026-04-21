# Task Tracking & Productivity Analytics System — Backend

Production-ready Django REST API backend.  
Strictly aligned with `architecture.md`, `repo_map.md`, `db_schema.md`, and `contract.md`.

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | Django 4.2 + Django REST Framework |
| Auth          | SimpleJWT (Bearer token)          |
| Database      | MySQL 8+                          |
| CORS          | django-cors-headers               |
| Server (prod) | Gunicorn                          |

---

## Project Structure

```
backend/
├── config/                  # Django project config
│   ├── settings.py          # MySQL, JWT, DRF, CORS
│   ├── urls.py              # Root URL router
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── common/              # Shared utilities
│   │   ├── models.py        # BaseModel (created_at, updated_at)
│   │   ├── utils.py         # success_response / error_response
│   │   ├── permissions.py   # IsOwner
│   │   └── pagination.py
│   │
│   ├── users/               # Auth — register / login
│   │   ├── models.py        # Custom User model
│   │   ├── serializers.py
│   │   ├── services.py      # JWT generation, user creation
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── tasks/               # Core task management
│   │   ├── models.py        # Task + TaskLog
│   │   ├── serializers.py
│   │   ├── services.py      # All business logic
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── reports/             # Analytics
│       ├── models.py        # ReportCache
│       ├── services.py      # Aggregation queries
│       ├── views.py
│       └── urls.py
│
├── tests/
│   ├── settings.py          # SQLite override for test runs
│   ├── test_tasks.py        # Task CRUD + TaskLog tests
│   └── test_reports.py      # Report generation tests
│
├── manage.py
├── requirements.txt
└── .env                     # Copy from this file and configure
```

---

## Quick Start

### 1. Clone & install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env` and fill in your MySQL credentials:

```bash
cp .env .env.local
```

```env
SECRET_KEY=your-very-long-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=task_tracker_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306

JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Create MySQL database

```sql
CREATE DATABASE task_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

```bash
python manage.py makemigrations users tasks reports common
python manage.py migrate
```

### 5. Run development server

```bash
python manage.py runserver
```

API available at: `http://localhost:8000/api/`

---

## Running Tests

Tests use SQLite in-memory — no MySQL needed:

```bash
python manage.py test tests --settings=tests.settings -v 2
```

Expected output: all tests pass ✅

---

## API Reference (contract.md)

### Authentication

| Method | Endpoint               | Auth | Description     |
|--------|------------------------|------|-----------------|
| POST   | `/api/auth/register/`  | ❌   | Register user   |
| POST   | `/api/auth/login/`     | ❌   | Login, get JWT  |

### Tasks

| Method | Endpoint                      | Auth | Description      |
|--------|-------------------------------|------|------------------|
| POST   | `/api/tasks/`                 | ✅   | Create task      |
| GET    | `/api/tasks/`                 | ✅   | List all tasks   |
| GET    | `/api/tasks/{id}/`            | ✅   | Get single task  |
| PUT    | `/api/tasks/{id}/`            | ✅   | Full update      |
| DELETE | `/api/tasks/{id}/`            | ✅   | Soft delete      |
| PATCH  | `/api/tasks/{id}/status/`     | ✅   | Update status    |

### Reports

| Method | Endpoint                  | Auth | Description      |
|--------|---------------------------|------|------------------|
| GET    | `/api/reports/weekly/`    | ✅   | Last 7 days      |
| GET    | `/api/reports/monthly/`   | ✅   | Last 30 days     |

### Auth Header (all protected endpoints)

```
Authorization: Bearer <jwt_token>
```

---

## Response Format (contract.md — never changes)

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Error description" }
```

---

## Database Tables (db_schema.md)

| Table           | Description                         |
|-----------------|-------------------------------------|
| `users`         | User accounts                       |
| `tasks`         | Task records with soft delete       |
| `task_logs`     | Status-change audit trail           |
| `reports_cache` | Precomputed report snapshots        |

---

## Key Business Rules

- **Soft delete**: `is_deleted = True` — records are never physically removed
- **TaskLog**: A log entry is written on EVERY status change (create + update)
- **completed_at**: Automatically set when status → `completed`; cleared otherwise
- **User isolation**: All queries filter by `request.user` — no cross-user data leakage
- **Status values**: Strictly `pending` | `completed` | `partial` (contract.md c020)

---

## Production Deployment

```bash
# Collect static files
python manage.py collectstatic --no-input

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Set `DEBUG=False` and configure `ALLOWED_HOSTS` in `.env` for production.

---

## DB Indexes (db_schema.md §6)

| Table           | Indexed Fields                  |
|-----------------|---------------------------------|
| `tasks`         | `user_id`, `created_at`         |
| `task_logs`     | `task_id`                       |
| `reports_cache` | `user_id`, `report_type`, `start_date` |
