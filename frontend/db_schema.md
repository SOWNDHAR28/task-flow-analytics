
# 📄 db_schema.md

## Task Tracking & Productivity Analytics System

---

# 🔷 1. Overview

This document defines the **database schema** for the Task Tracking & Productivity Analytics System.
The schema is designed to support:

* Task management (CRUD operations)
* Status tracking (pending, completed, partial)
* Historical tracking (task logs)
* Productivity analytics (reports)

The database follows a **relational model** with proper normalization and foreign key relationships.

---

# 🔷 2. Tables Summary

| Table Name    | Description                |
| ------------- | -------------------------- |
| users         | Stores user information    |
| tasks         | Stores task details        |
| task_logs     | Tracks task status changes |
| reports_cache | Stores generated reports   |

---

# 🔷 3. Table Definitions

---

## 🧑 3.1 users

Stores basic user information.

| Field      | Type      | Constraints           |
| ---------- | --------- | --------------------- |
| id         | integer   | Primary Key           |
| name       | varchar   | Not Null              |
| email      | varchar   | Unique, Not Null      |
| password   | varchar   | Not Null              |
| created_at | timestamp | Default: current time |

---

## 📝 3.2 tasks

Core table storing all task-related data.

| Field        | Type      | Constraints    |
| ------------ | --------- | -------------- |
| id           | integer   | Primary Key    |
| user_id      | integer   | Foreign Key    |
| title        | varchar   | Not Null       |
| description  | text      | Nullable       |
| status       | varchar   | Not Null       |
| remarks      | text      | Nullable       |
| due_date     | date      | Nullable       |
| completed_at | timestamp | Nullable       |
| created_at   | timestamp | Not Null       |
| updated_at   | timestamp | Not Null       |
| is_deleted   | boolean   | Default: false |

---

### 🔸 Status Values

* pending
* completed
* partial

---

## 📜 3.3 task_logs

Stores history of task updates.

| Field      | Type      | Constraints |
| ---------- | --------- | ----------- |
| id         | integer   | Primary Key |
| task_id    | integer   | Foreign Key |
| old_status | varchar   | Nullable    |
| new_status | varchar   | Not Null    |
| remarks    | text      | Nullable    |
| changed_at | timestamp | Not Null    |

---

## 📊 3.4 reports_cache

Stores precomputed reports for faster access.

| Field           | Type      | Constraints |
| --------------- | --------- | ----------- |
| id              | integer   | Primary Key |
| user_id         | integer   | Foreign Key |
| report_type     | varchar   | Not Null    |
| total_tasks     | integer   | Not Null    |
| completed_tasks | integer   | Not Null    |
| completion_rate | float     | Not Null    |
| start_date      | date      | Not Null    |
| end_date        | date      | Not Null    |
| generated_at    | timestamp | Not Null    |

---

# 🔷 4. Relationships

### 🔗 Users → Tasks

* One user can have multiple tasks
* `tasks.user_id → users.id`

---

### 🔗 Tasks → Task Logs

* One task can have multiple logs
* `task_logs.task_id → tasks.id`

---

### 🔗 Users → Reports

* One user can have multiple reports
* `reports_cache.user_id → users.id`

---

# 🔷 5. Constraints & Rules

## ✅ Primary Keys

* Each table has a unique `id`

---

## ✅ Foreign Keys

* Ensure referential integrity
* Prevent orphan records

---

## ✅ Soft Delete

* Implemented using:

```id="softdel001"
is_deleted = false
```

* Deleted tasks are not removed physically

---

## ✅ Timestamps

* Used for:

  * Tracking history
  * Generating reports
  * Auditing

---

# 🔷 6. Indexing Strategy

To improve performance:

* Index on `tasks.user_id`
* Index on `tasks.created_at`
* Index on `task_logs.task_id`
* Index on `reports_cache.user_id`

---

# 🔷 7. Data Integrity Considerations

* Email must be unique
* Status values must be controlled
* Foreign key constraints enforced
* Nullable fields only where necessary

---

# 🔷 8. Scalability Considerations

* Reports cached to reduce computation
* Logs stored separately to avoid bloating tasks table
* Soft delete ensures historical consistency

---

# 🔷 9. Future Enhancements

* Add task priority field
* Add tags (many-to-many relationship)
* Add notifications table
* Add team/collaboration support

---

# 🔷 10. Conclusion

This schema is designed to balance **simplicity and scalability**, supporting both basic task management and advanced productivity analytics. It ensures data consistency, efficient querying, and extensibility for future features.

---

