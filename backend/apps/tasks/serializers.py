"""
tasks/serializers.py
All task-related serializers.
Field names and response shapes aligned EXACTLY with contract.md §5.

Serializers:
  TaskCreateSerializer   — validates POST /api/tasks/ (c008)
  TaskResponseSerializer — full task payload  (c009, c010, c011)
  TaskUpdateSerializer   — validates PUT /api/tasks/{id}/ (c012)
  TaskUpdateResponseSerializer — PUT response (c013)
  TaskStatusSerializer   — validates PATCH /api/tasks/{id}/status/ (c014)
  TaskStatusResponseSerializer — PATCH response (c015)
"""

from rest_framework import serializers
from .models import Task, TaskStatus


# ---------------------------------------------------------------------------
# Shared field validators
# ---------------------------------------------------------------------------
VALID_STATUSES = [s.value for s in TaskStatus]


def validate_status_value(value):
    if value not in VALID_STATUSES:
        raise serializers.ValidationError(
            f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
        )
    return value


# ---------------------------------------------------------------------------
# Full task response payload
# contract.md c009/c010/c011 — exact field list the frontend depends on
# ---------------------------------------------------------------------------
class TaskResponseSerializer(serializers.ModelSerializer):
    """
    Full task payload used in:
      - POST response (c009)
      - GET list    (c010)
      - GET detail  (c011)
    Fields: id, title, description, status, remarks,
            due_date, completed_at, created_at, updated_at
    """

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "remarks",
            "due_date",
            "completed_at",
            "created_at",
            "updated_at",
        ]


# ---------------------------------------------------------------------------
# Create task — POST /api/tasks/  (c008)
# ---------------------------------------------------------------------------
class TaskCreateSerializer(serializers.ModelSerializer):
    """
    Validates the create-task request body.
    contract.md c008: title, description, status, remarks, due_date
    """

    status = serializers.ChoiceField(
        choices=VALID_STATUSES,
        default=TaskStatus.PENDING,
    )
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ["title", "description", "status", "remarks", "due_date"]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()


# ---------------------------------------------------------------------------
# Update task — PUT /api/tasks/{id}/  (c012)
# ---------------------------------------------------------------------------
class TaskUpdateSerializer(serializers.ModelSerializer):
    """
    Validates the full update request.
    contract.md c012: title, description, status, remarks, due_date
    """

    status = serializers.ChoiceField(choices=VALID_STATUSES, required=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ["title", "description", "status", "remarks", "due_date"]

    def validate_title(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip() if value else value


# ---------------------------------------------------------------------------
# Update task response — PUT /api/tasks/{id}/  (c013)
# ---------------------------------------------------------------------------
class TaskUpdateResponseSerializer(serializers.ModelSerializer):
    """
    contract.md c013 response shape:
      { id, title, status, remarks, updated_at }
    """

    class Meta:
        model = Task
        fields = ["id", "title", "status", "remarks", "updated_at"]


# ---------------------------------------------------------------------------
# Status update — PATCH /api/tasks/{id}/status/  (c014)
# ---------------------------------------------------------------------------
class TaskStatusSerializer(serializers.Serializer):
    """
    Validates PATCH /api/tasks/{id}/status/ request.
    contract.md c014: { "status": "completed", "remarks": "" }
    """

    status = serializers.ChoiceField(choices=VALID_STATUSES)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# ---------------------------------------------------------------------------
# Status update response — PATCH /api/tasks/{id}/status/  (c015)
# ---------------------------------------------------------------------------
class TaskStatusResponseSerializer(serializers.ModelSerializer):
    """
    contract.md c015 response shape:
      { id, status, completed_at }
    """

    class Meta:
        model = Task
        fields = ["id", "status", "completed_at"]
