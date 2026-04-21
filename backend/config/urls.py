"""
Root URL configuration.
Aligned with repo_map.md URL structure: /api/auth/, /api/tasks/, /api/reports/
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication APIs — POST /api/auth/register/, POST /api/auth/login/
    path("api/auth/", include("apps.users.urls")),

    # Task APIs — /api/tasks/
    path("api/tasks/", include("apps.tasks.urls")),

    # Report APIs — /api/reports/
    path("api/reports/", include("apps.reports.urls")),
]
