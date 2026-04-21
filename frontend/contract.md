

# 📄 contract.md

## API Contract – Task Tracking & Productivity Analytics System

---

# 🔷 1. Overview

This document defines the **exact API request and response formats** for communication between frontend and backend.

⚠️ **STRICT RULE:**

* Do NOT change field names
* Do NOT change response structure
* Both frontend and backend must follow this exactly

---

# 🔷 2. Base URL

```id="c001"
/api/
```

---

# 🔷 3. Common Response Format

## ✅ Success Response

```json id="c002"
{
  "success": true,
  "data": {}
}
```

## ❌ Error Response

```json id="c003"
{
  "success": false,
  "message": "Error message"
}
```

---

# 🔷 4. Authentication APIs

## 🔐 Register

### POST `/api/auth/register/`

### Request:

```json id="c004"
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Response:

```json id="c005"
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🔐 Login

### POST `/api/auth/login/`

### Request:

```json id="c006"
{
  "email": "john@example.com",
  "password": "123456"
}
```

### Response:

```json id="c007"
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

# 🔷 5. Tasks APIs

## ➕ Create Task

### POST `/api/tasks/`

### Request:

```json id="c008"
{
  "title": "Learn Django",
  "description": "Complete DRF tutorial",
  "status": "pending",
  "remarks": "",
  "due_date": "2026-04-20"
}
```

### Response:

```json id="c009"
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Django",
    "description": "Complete DRF tutorial",
    "status": "pending",
    "remarks": "",
    "due_date": "2026-04-20",
    "completed_at": null,
    "created_at": "2026-04-17T10:00:00",
    "updated_at": "2026-04-17T10:00:00"
  }
}
```

---

## 📄 Get All Tasks

### GET `/api/tasks/`

### Response:

```json id="c010"
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Learn Django",
      "description": "Complete DRF tutorial",
      "status": "pending",
      "remarks": "",
      "due_date": "2026-04-20",
      "completed_at": null,
      "created_at": "2026-04-17T10:00:00",
      "updated_at": "2026-04-17T10:00:00"
    }
  ]
}
```

---

## 🔍 Get Single Task

### GET `/api/tasks/{id}/`

### Response:

```json id="c011"
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Django",
    "description": "Complete DRF tutorial",
    "status": "pending",
    "remarks": "",
    "due_date": "2026-04-20",
    "completed_at": null,
    "created_at": "2026-04-17T10:00:00",
    "updated_at": "2026-04-17T10:00:00"
  }
}
```

---

## ✏️ Update Task

### PUT `/api/tasks/{id}/`

### Request:

```json id="c012"
{
  "title": "Learn Django REST",
  "description": "Finish serializers",
  "status": "partial",
  "remarks": "Half completed",
  "due_date": "2026-04-22"
}
```

### Response:

```json id="c013"
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Django REST",
    "status": "partial",
    "remarks": "Half completed",
    "updated_at": "2026-04-17T12:00:00"
  }
}
```

---

## 🔄 Update Status

### PATCH `/api/tasks/{id}/status/`

### Request:

```json id="c014"
{
  "status": "completed",
  "remarks": ""
}
```

### Response:

```json id="c015"
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "completed_at": "2026-04-17T12:30:00"
  }
}
```

---

## 🗑️ Delete Task (Soft Delete)

### DELETE `/api/tasks/{id}/`

### Response:

```json id="c016"
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

---

# 🔷 6. Reports APIs

## 📅 Weekly Report

### GET `/api/reports/weekly/`

### Response:

```json id="c017"
{
  "success": true,
  "data": {
    "total_tasks": 20,
    "completed_tasks": 15,
    "completion_rate": 75
  }
}
```

---

## 📆 Monthly Report

### GET `/api/reports/monthly/`

### Response:

```json id="c018"
{
  "success": true,
  "data": {
    "total_tasks": 80,
    "completed_tasks": 60,
    "completion_rate": 75
  }
}
```

---

# 🔷 7. Headers

All protected APIs must include:

```id="c019"
Authorization: Bearer <jwt_token>
```

---

# 🔷 8. Status Values (STRICT)

```id="c020"
pending
completed
partial
```

⚠️ Do NOT use any other values

---

# 🔷 9. Important Rules

* Always return `success` field
* Never return raw arrays
* Use consistent field names
* Use ISO timestamp format
* Maintain soft delete logic

---

# 🔷 10. Final Note

This contract ensures:

* ✅ Frontend and backend stay aligned
* ✅ No integration errors
* ✅ Easy debugging
* ✅ Scalable architecture

---

## 🔥 What You Just Built

Now you have:

* UI plan ✅
* DB schema ✅
* Repo structure ✅
* API contract ✅

👉 This is **real-world system design level**, not just a small project.

---


