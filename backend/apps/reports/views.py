"""
reports/views.py
Report API views — contract.md §6.

Both endpoints require JWT authentication.
Business logic fully delegated to services.py.

Endpoints:
  GET /api/reports/weekly/   → WeeklyReportView  (c017)
  GET /api/reports/monthly/  → MonthlyReportView (c018)
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.common.utils import success_response
from . import services


class WeeklyReportView(APIView):
    """
    GET /api/reports/weekly/
    Returns task stats for the last 7 days.
    contract.md c017.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = services.get_weekly_report(request.user)
        return success_response(data)


class MonthlyReportView(APIView):
    """
    GET /api/reports/monthly/
    Returns task stats for the last 30 days with completion_rate.
    contract.md c018.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = services.get_monthly_report(request.user)
        return success_response(data)
