"""
tests/test_tasks.py
Tests for task creation, update, status change, soft delete, and task_logs.
Uses Django's TestCase + DRF's APIClient.
Database: SQLite (in-memory) — overridden in test settings.
"""

import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User
from apps.tasks.models import Task, TaskLog, TaskStatus


# ---------------------------------------------------------------------------
# Base test case — sets up user and JWT token
# ---------------------------------------------------------------------------

class BaseTaskTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test user
        self.user = User.objects.create_user(
            email="test@example.com",
            name="Test User",
            password="testpass123",
        )

        # Log in to get JWT token
        response = self.client.post(
            "/api/auth/login/",
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        token = response.data["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # A second user for isolation tests
        self.other_user = User.objects.create_user(
            email="other@example.com",
            name="Other User",
            password="otherpass123",
        )


# ---------------------------------------------------------------------------
# Authentication Tests
# ---------------------------------------------------------------------------

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        response = self.client.post(
            "/api/auth/register/",
            {"name": "New User", "email": "new@example.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertIn("id", response.data["data"])
        self.assertEqual(response.data["data"]["email"], "new@example.com")

    def test_register_duplicate_email(self):
        User.objects.create_user(email="dup@example.com", name="Dup", password="pass")
        response = self.client.post(
            "/api/auth/register/",
            {"name": "Dup2", "email": "dup@example.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_login_success(self):
        User.objects.create_user(email="login@example.com", name="Login", password="pass123")
        response = self.client.post(
            "/api/auth/login/",
            {"email": "login@example.com", "password": "pass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertIn("token", response.data["data"])
        self.assertIn("user", response.data["data"])

    def test_login_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "nobody@example.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_unauthenticated_task_access(self):
        """Task endpoints must reject requests without JWT."""
        client = APIClient()
        response = client.get("/api/tasks/")
        self.assertEqual(response.status_code, 401)


# ---------------------------------------------------------------------------
# Task Creation Tests
# ---------------------------------------------------------------------------

class TaskCreationTests(BaseTaskTestCase):

    def test_create_task_success(self):
        payload = {
            "title": "Learn Django",
            "description": "Complete DRF tutorial",
            "status": "pending",
            "remarks": "",
            "due_date": "2026-04-20",
        }
        response = self.client.post("/api/tasks/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])

        data = response.data["data"]
        # Verify all contract.md c009 fields are present
        for field in ["id", "title", "description", "status", "remarks",
                      "due_date", "completed_at", "created_at", "updated_at"]:
            self.assertIn(field, data)

        self.assertEqual(data["title"], "Learn Django")
        self.assertEqual(data["status"], "pending")
        self.assertIsNone(data["completed_at"])

    def test_create_task_sets_completed_at_when_status_completed(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Done Task", "status": "completed"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIsNotNone(response.data["data"]["completed_at"])

    def test_create_task_writes_task_log(self):
        """Creating a task must produce a TaskLog entry."""
        self.client.post(
            "/api/tasks/",
            {"title": "Logged Task", "status": "pending"},
            format="json",
        )
        task = Task.objects.get(title="Logged Task")
        logs = TaskLog.objects.filter(task=task)
        self.assertEqual(logs.count(), 1)
        self.assertIsNone(logs.first().old_status)
        self.assertEqual(logs.first().new_status, "pending")

    def test_create_task_missing_title(self):
        response = self.client.post(
            "/api/tasks/",
            {"description": "No title here"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_create_task_invalid_status(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Bad Status", "status": "unknown_status"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_task_belongs_to_authenticated_user(self):
        self.client.post("/api/tasks/", {"title": "My Task", "status": "pending"}, format="json")
        task = Task.objects.get(title="My Task")
        self.assertEqual(task.user, self.user)


# ---------------------------------------------------------------------------
# Task List / Detail Tests
# ---------------------------------------------------------------------------

class TaskReadTests(BaseTaskTestCase):

    def setUp(self):
        super().setUp()
        # Create tasks for primary user
        Task.objects.create(user=self.user, title="Task A", status="pending")
        Task.objects.create(user=self.user, title="Task B", status="completed")
        # Create task for other user (should NOT appear in primary user's list)
        Task.objects.create(user=self.other_user, title="Other Task", status="pending")

    def test_list_tasks_only_own(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        data = response.data["data"]
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)

        titles = [t["title"] for t in data]
        self.assertNotIn("Other Task", titles)

    def test_list_excludes_soft_deleted(self):
        Task.objects.filter(user=self.user, title="Task A").update(is_deleted=True)
        response = self.client.get("/api/tasks/")
        titles = [t["title"] for t in response.data["data"]]
        self.assertNotIn("Task A", titles)

    def test_get_task_detail_success(self):
        task = Task.objects.get(user=self.user, title="Task A")
        response = self.client.get(f"/api/tasks/{task.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["title"], "Task A")

    def test_get_task_detail_other_user_returns_404(self):
        other_task = Task.objects.get(user=self.other_user, title="Other Task")
        response = self.client.get(f"/api/tasks/{other_task.id}/")
        self.assertEqual(response.status_code, 404)

    def test_response_never_raw_array(self):
        """contract.md: NEVER return raw arrays."""
        response = self.client.get("/api/tasks/")
        self.assertIsInstance(response.data, dict)
        self.assertIn("success", response.data)
        self.assertIn("data", response.data)


# ---------------------------------------------------------------------------
# Task Update Tests
# ---------------------------------------------------------------------------

class TaskUpdateTests(BaseTaskTestCase):

    def setUp(self):
        super().setUp()
        self.task = Task.objects.create(
            user=self.user,
            title="Original Title",
            status="pending",
            description="Original desc",
        )

    def test_put_update_task_success(self):
        payload = {
            "title": "Updated Title",
            "description": "Updated desc",
            "status": "partial",
            "remarks": "Half done",
            "due_date": "2026-05-01",
        }
        response = self.client.put(f"/api/tasks/{self.task.id}/", payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        data = response.data["data"]
        # contract.md c013 fields
        for field in ["id", "title", "status", "remarks", "updated_at"]:
            self.assertIn(field, data)

        self.assertEqual(data["title"], "Updated Title")
        self.assertEqual(data["status"], "partial")

    def test_put_status_change_creates_task_log(self):
        initial_log_count = TaskLog.objects.filter(task=self.task).count()
        self.client.put(
            f"/api/tasks/{self.task.id}/",
            {"title": "Title", "status": "completed"},
            format="json",
        )
        new_log_count = TaskLog.objects.filter(task=self.task).count()
        self.assertEqual(new_log_count, initial_log_count + 1)

    def test_put_sets_completed_at_when_completed(self):
        self.client.put(
            f"/api/tasks/{self.task.id}/",
            {"title": "Done", "status": "completed"},
            format="json",
        )
        self.task.refresh_from_db()
        self.assertIsNotNone(self.task.completed_at)

    def test_put_clears_completed_at_when_un_completing(self):
        self.task.status = "completed"
        self.task.completed_at = "2026-01-01T00:00:00Z"
        self.task.save()

        self.client.put(
            f"/api/tasks/{self.task.id}/",
            {"title": "Back to partial", "status": "partial"},
            format="json",
        )
        self.task.refresh_from_db()
        self.assertIsNone(self.task.completed_at)

    def test_cannot_update_other_users_task(self):
        other_task = Task.objects.create(
            user=self.other_user, title="Other", status="pending"
        )
        response = self.client.put(
            f"/api/tasks/{other_task.id}/",
            {"title": "Hijacked"},
            format="json",
        )
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Status Change Tests
# ---------------------------------------------------------------------------

class TaskStatusChangeTests(BaseTaskTestCase):

    def setUp(self):
        super().setUp()
        self.task = Task.objects.create(
            user=self.user, title="Status Task", status="pending"
        )

    def test_patch_status_success(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "completed", "remarks": "All done"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        data = response.data["data"]
        # contract.md c015 fields
        for field in ["id", "status", "completed_at"]:
            self.assertIn(field, data)

        self.assertEqual(data["status"], "completed")
        self.assertIsNotNone(data["completed_at"])

    def test_patch_status_always_creates_task_log(self):
        log_count_before = TaskLog.objects.filter(task=self.task).count()
        self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "partial"},
            format="json",
        )
        log_count_after = TaskLog.objects.filter(task=self.task).count()
        self.assertEqual(log_count_after, log_count_before + 1)

    def test_patch_status_log_records_old_and_new(self):
        self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "completed"},
            format="json",
        )
        latest_log = TaskLog.objects.filter(task=self.task).order_by("-changed_at").first()
        self.assertEqual(latest_log.old_status, "pending")
        self.assertEqual(latest_log.new_status, "completed")

    def test_patch_invalid_status_rejected(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "invalid_value"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_patch_completed_sets_completed_at(self):
        self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "completed"},
            format="json",
        )
        self.task.refresh_from_db()
        self.assertIsNotNone(self.task.completed_at)

    def test_patch_pending_clears_completed_at(self):
        self.task.status = "completed"
        from django.utils import timezone
        self.task.completed_at = timezone.now()
        self.task.save()

        self.client.patch(
            f"/api/tasks/{self.task.id}/status/",
            {"status": "pending"},
            format="json",
        )
        self.task.refresh_from_db()
        self.assertIsNone(self.task.completed_at)


# ---------------------------------------------------------------------------
# Soft Delete Tests
# ---------------------------------------------------------------------------

class TaskSoftDeleteTests(BaseTaskTestCase):

    def setUp(self):
        super().setUp()
        self.task = Task.objects.create(
            user=self.user, title="Delete Me", status="pending"
        )

    def test_delete_returns_success_message(self):
        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["message"], "Task deleted successfully")

    def test_delete_sets_is_deleted_flag(self):
        self.client.delete(f"/api/tasks/{self.task.id}/")
        self.task.refresh_from_db()
        self.assertTrue(self.task.is_deleted)

    def test_delete_does_not_remove_db_record(self):
        self.client.delete(f"/api/tasks/{self.task.id}/")
        # Record still exists in DB
        self.assertTrue(Task.objects.filter(id=self.task.id).exists())

    def test_deleted_task_hidden_from_list(self):
        self.client.delete(f"/api/tasks/{self.task.id}/")
        response = self.client.get("/api/tasks/")
        ids = [t["id"] for t in response.data["data"]]
        self.assertNotIn(self.task.id, ids)

    def test_deleted_task_not_accessible_by_detail(self):
        self.client.delete(f"/api/tasks/{self.task.id}/")
        response = self.client.get(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, 404)
