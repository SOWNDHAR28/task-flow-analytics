"""
tasks/views.py
Task API views — contract.md §5.

All endpoints require JWT authentication.
Business logic is fully delegated to services.py.
Views only: parse input → call service → format response.

Endpoints:
  POST   /api/tasks/              → TaskListCreateView.post
  GET    /api/tasks/              → TaskListCreateView.get
  GET    /api/tasks/{id}/         → TaskDetailView.get
  PUT    /api/tasks/{id}/         → TaskDetailView.put
  DELETE /api/tasks/{id}/         → TaskDetailView.delete  (soft delete)
  PATCH  /api/tasks/{id}/status/  → TaskStatusView.patch
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.common.utils import success_response, error_response
from apps.common.permissions import IsOwner

from .serializers import (
    TaskCreateSerializer,
    TaskResponseSerializer,
    TaskUpdateSerializer,
    TaskUpdateResponseSerializer,
    TaskStatusSerializer,
    TaskStatusResponseSerializer,
)
from . import services


class TaskListCreateView(APIView):
    """
    GET  /api/tasks/  — list all tasks for authenticated user
    POST /api/tasks/  — create a new task
    """

    permission_classes = [IsAuthenticated]

    # ------------------------------------------------------------------
    # GET /api/tasks/
    # contract.md c010
    # ------------------------------------------------------------------
    def get(self, request):
        tasks = services.get_user_tasks(request.user)
        serializer = TaskResponseSerializer(tasks, many=True)
        return success_response(serializer.data)

    # ------------------------------------------------------------------
    # POST /api/tasks/
    # contract.md c008 → c009
    # ------------------------------------------------------------------
    def post(self, request):
        serializer = TaskCreateSerializer(data=request.data)

        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return error_response(str(first_error))

        task = services.create_task(request.user, serializer.validated_data)
        response_serializer = TaskResponseSerializer(task)
        return success_response(response_serializer.data, http_status=201)


class TaskDetailView(APIView):
    """
    GET    /api/tasks/{id}/  — retrieve single task
    PUT    /api/tasks/{id}/  — full update
    DELETE /api/tasks/{id}/  — soft delete
    """

    permission_classes = [IsAuthenticated]

    # ------------------------------------------------------------------
    # GET /api/tasks/{id}/
    # contract.md c011
    # ------------------------------------------------------------------
    def get(self, request, task_id):
        task = services.get_task_detail(task_id, request.user)
        serializer = TaskResponseSerializer(task)
        return success_response(serializer.data)

    # ------------------------------------------------------------------
    # PUT /api/tasks/{id}/
    # contract.md c012 → c013
    # ------------------------------------------------------------------
    def put(self, request, task_id):
        serializer = TaskUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return error_response(str(first_error))

        task = services.update_task(task_id, request.user, serializer.validated_data)
        response_serializer = TaskUpdateResponseSerializer(task)
        return success_response(response_serializer.data)

    # ------------------------------------------------------------------
    # DELETE /api/tasks/{id}/
    # contract.md c016 — SOFT DELETE only
    # ------------------------------------------------------------------
    def delete(self, request, task_id):
        services.soft_delete_task(task_id, request.user)
        return success_response({"message": "Task deleted successfully"})


class TaskStatusView(APIView):
    """
    PATCH /api/tasks/{id}/status/
    contract.md c014 → c015
    Sets completed_at when status becomes 'completed'.
    Always writes a task_log entry.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        serializer = TaskStatusSerializer(data=request.data)

        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return error_response(str(first_error))

        new_status = serializer.validated_data["status"]
        remarks = serializer.validated_data.get("remarks")

        task = services.update_task_status(task_id, request.user, new_status, remarks)
        response_serializer = TaskStatusResponseSerializer(task)
        return success_response(response_serializer.data)
