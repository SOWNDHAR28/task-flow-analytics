"""
reports/urls.py
Report URL patterns — mounted at /api/reports/ in config/urls.py
"""

from django.urls import path
from .views import WeeklyReportView, MonthlyReportView

urlpatterns = [
    path("weekly/", WeeklyReportView.as_view(), name="report-weekly"),
    path("monthly/", MonthlyReportView.as_view(), name="report-monthly"),
]
