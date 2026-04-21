"""
tasks/models.py
Task and TaskLog models.
Schema aligned EXACTLY with db_schema.md §3.2 and §3.3.

Tables:
  tasks      — core task data
  task_logs  — status-change audit trail (NEVER skipped)

Both tables are indexed per db_schema.md §6 (Indexing Strategy).
"""

from django.db import models
from django.conf import settings
from apps.common.models import BaseModel


# ---------------------------------------------------------------------------
# Status constants — contract.md c020 (STRICT — no other values)
# ---------------------------------------------------------------------------
class TaskStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    PARTIAL = "partial", "Partial"


# ---------------------------------------------------------------------------
# Task model — db_schema.md §3.2
# ---------------------------------------------------------------------------
class Task(BaseModel):
    """
    db_schema.md → tasks table
    Inherits created_at and updated_at from BaseModel.

    Indexes added per db_schema.md §6:
      - user_id   (db_index on ForeignKey)
      - created_at (db_index via Meta.indexes)
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
        db_index=True,          # index on user_id — db_schema.md §6
    )
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.PENDING,
    )
    remarks = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)  # soft-delete flag

    class Meta:
        db_table = "tasks"
        indexes = [
            models.Index(fields=["created_at"], name="idx_tasks_created_at"),
            models.Index(fields=["user", "is_deleted"], name="idx_tasks_user_deleted"),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.status}] {self.title}"


# ---------------------------------------------------------------------------
# TaskLog model — db_schema.md §3.3
# ---------------------------------------------------------------------------
class TaskLog(models.Model):
    """
    db_schema.md → task_logs table
    Records EVERY status transition. Created by TaskService on status change.

    Note: TaskLog does NOT extend BaseModel because:
      - db_schema.md defines changed_at (not created_at/updated_at)
      - Logs are immutable audit records — no updated_at needed.
    """

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="logs",
        db_index=True,          # index on task_id — db_schema.md §6
    )
    old_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20)
    remarks = models.TextField(blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_logs"
        ordering = ["-changed_at"]

    def __str__(self):
        return f"Task {self.task_id}: {self.old_status} → {self.new_status}"
