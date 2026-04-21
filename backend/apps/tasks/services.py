"""
tasks/services.py
All task business logic — views stay thin.

Rules enforced here:
  - Soft delete (is_deleted = True, never hard delete)
  - completed_at set when status → "completed"
  - TaskLog created on EVERY status change (db_schema.md §3.3)
  - Users can only access their own tasks
"""

from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Task, TaskLog, TaskStatus


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_task(task_id: int, user) -> Task:
    """
    Fetch a non-deleted task that belongs to the requesting user.
    Raises 404 if not found or belongs to another user.
    """
    return get_object_or_404(Task, id=task_id, user=user, is_deleted=False)


def _create_task_log(task: Task, old_status: str | None, new_status: str, remarks: str | None):
    """
    Write one row to task_logs.
    Called on EVERY status transition — never skipped.
    """
    TaskLog.objects.create(
        task=task,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks or "",
    )


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_task(user, validated_data: dict) -> Task:
    """
    Create a new task owned by `user`.
    created_at is set automatically by BaseModel (auto_now_add).
    If initial status is 'completed', set completed_at immediately.
    Log the initial status creation.
    """
    status = validated_data.get("status", TaskStatus.PENDING)

    completed_at = None
    if status == TaskStatus.COMPLETED:
        completed_at = timezone.now()

    task = Task.objects.create(
        user=user,
        title=validated_data["title"],
        description=validated_data.get("description", ""),
        status=status,
        remarks=validated_data.get("remarks", ""),
        due_date=validated_data.get("due_date"),
        completed_at=completed_at,
    )

    # Log the initial status (old_status=None → new task)
    _create_task_log(task, old_status=None, new_status=status, remarks=task.remarks)

    return task


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

def get_user_tasks(user):
    """
    Return all non-deleted tasks for the given user.
    Uses select_related for FK efficiency (architecture.md §11 performance).
    """
    return (
        Task.objects
        .filter(user=user, is_deleted=False)
        .select_related("user")
        .order_by("-created_at")
    )


def get_task_detail(task_id: int, user) -> Task:
    """Return a single task owned by user, or 404."""
    return _get_user_task(task_id, user)


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

def update_task(task_id: int, user, validated_data: dict) -> Task:
    """
    Full update (PUT).
    If status changes, log the transition and handle completed_at.
    updated_at is refreshed automatically by BaseModel (auto_now).
    """
    task = _get_user_task(task_id, user)

    old_status = task.status
    new_status = validated_data.get("status", old_status)

    # Apply all field updates
    task.title = validated_data.get("title", task.title)
    task.description = validated_data.get("description", task.description)
    task.status = new_status
    task.remarks = validated_data.get("remarks", task.remarks)
    task.due_date = validated_data.get("due_date", task.due_date)

    # Handle completed_at
    if new_status == TaskStatus.COMPLETED and task.completed_at is None:
        task.completed_at = timezone.now()
    elif new_status != TaskStatus.COMPLETED:
        task.completed_at = None   # reset if moved back from completed

    task.save()

    # Log only if status actually changed
    if old_status != new_status:
        _create_task_log(task, old_status=old_status, new_status=new_status, remarks=task.remarks)

    return task


# ---------------------------------------------------------------------------
# Status update (PATCH)
# ---------------------------------------------------------------------------

def update_task_status(task_id: int, user, new_status: str, remarks: str | None) -> Task:
    """
    Dedicated status-change endpoint (PATCH /api/tasks/{id}/status/).
    Always creates a task_log entry regardless of whether status changed.
    Sets completed_at when status == 'completed'.
    """
    task = _get_user_task(task_id, user)
    old_status = task.status

    task.status = new_status
    if remarks is not None:
        task.remarks = remarks

    # Business rule: set completed_at only on transition to "completed"
    if new_status == TaskStatus.COMPLETED:
        task.completed_at = timezone.now()
    else:
        task.completed_at = None  # clear if un-completing a task

    task.save()

    # Log EVERY status change — including same-status PATCH (intent recorded)
    _create_task_log(task, old_status=old_status, new_status=new_status, remarks=remarks)

    return task


# ---------------------------------------------------------------------------
# Soft delete
# ---------------------------------------------------------------------------

def soft_delete_task(task_id: int, user) -> None:
    """
    Soft delete: set is_deleted = True.
    Record is NEVER physically removed from the database.
    """
    task = _get_user_task(task_id, user)
    task.is_deleted = True
    task.save(update_fields=["is_deleted", "updated_at"])
