"""
tasks/urls.py
Task URL patterns — mounted at /api/tasks/ in config/urls.py

Endpoints (contract.md §5):
  POST   /api/tasks/              → TaskListCreateView
  GET    /api/tasks/              → TaskListCreateView
  GET    /api/tasks/{id}/         → TaskDetailView
  PUT    /api/tasks/{id}/         → TaskDetailView
  DELETE /api/tasks/{id}/         → TaskDetailView
  PATCH  /api/tasks/{id}/status/  → TaskStatusView
"""

from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskStatusView

urlpatterns = [
    # Collection
    path("", TaskListCreateView.as_view(), name="task-list-create"),

    # Single resource
    path("<int:task_id>/", TaskDetailView.as_view(), name="task-detail"),

    # Status sub-resource
    path("<int:task_id>/status/", TaskStatusView.as_view(), name="task-status"),
]
