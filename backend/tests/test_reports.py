"""
tests/test_reports.py
Tests for weekly and monthly report generation.
Verifies contract.md c017/c018 response shapes and business logic.
"""

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from apps.users.models import User
from apps.tasks.models import Task, TaskStatus
from apps.reports.models import ReportCache


class BaseReportTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="reporter@example.com",
            name="Reporter",
            password="reportpass",
        )

        response = self.client.post(
            "/api/auth/login/",
            {"email": "reporter@example.com", "password": "reportpass"},
            format="json",
        )
        token = response.data["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        now = timezone.now()

        # Tasks within last 7 days (weekly window)
        Task.objects.create(user=self.user, title="W1", status="completed",
                            created_at=now - timedelta(days=2))
        Task.objects.create(user=self.user, title="W2", status="pending",
                            created_at=now - timedelta(days=4))
        Task.objects.create(user=self.user, title="W3", status="partial",
                            created_at=now - timedelta(days=6))

        # Tasks within last 30 days but outside 7-day window
        Task.objects.create(user=self.user, title="M1", status="completed",
                            created_at=now - timedelta(days=10))
        Task.objects.create(user=self.user, title="M2", status="completed",
                            created_at=now - timedelta(days=20))

        # Old task (> 30 days) — should NEVER appear in any report
        Task.objects.create(user=self.user, title="Old", status="completed",
                            created_at=now - timedelta(days=40))


class WeeklyReportTests(BaseReportTestCase):

    def test_weekly_report_success(self):
        response = self.client.get("/api/reports/weekly/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_weekly_report_contract_fields(self):
        """contract.md c017 — exact field names."""
        response = self.client.get("/api/reports/weekly/")
        data = response.data["data"]
        for field in ["total_tasks", "completed_tasks", "completion_rate"]:
            self.assertIn(field, data)

    def test_weekly_report_counts(self):
        response = self.client.get("/api/reports/weekly/")
        data = response.data["data"]
        # 3 tasks in last 7 days (W1, W2, W3)
        self.assertEqual(data["total_tasks"], 3)
        # Only W1 is completed
        self.assertEqual(data["completed_tasks"], 1)

    def test_weekly_completion_rate(self):
        response = self.client.get("/api/reports/weekly/")
        rate = response.data["data"]["completion_rate"]
        expected = round((1 / 3) * 100, 2)
        self.assertAlmostEqual(rate, expected, places=1)

    def test_weekly_report_cached(self):
        """Calling the endpoint should write to reports_cache."""
        cache_count_before = ReportCache.objects.filter(
            user=self.user, report_type="weekly"
        ).count()
        self.client.get("/api/reports/weekly/")
        cache_count_after = ReportCache.objects.filter(
            user=self.user, report_type="weekly"
        ).count()
        self.assertEqual(cache_count_after, cache_count_before + 1)

    def test_weekly_requires_auth(self):
        client = APIClient()
        response = client.get("/api/reports/weekly/")
        self.assertEqual(response.status_code, 401)

    def test_weekly_zero_tasks(self):
        Task.objects.filter(user=self.user).delete()
        response = self.client.get("/api/reports/weekly/")
        data = response.data["data"]
        self.assertEqual(data["total_tasks"], 0)
        self.assertEqual(data["completed_tasks"], 0)
        self.assertEqual(data["completion_rate"], 0.0)


class MonthlyReportTests(BaseReportTestCase):

    def test_monthly_report_success(self):
        response = self.client.get("/api/reports/monthly/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_monthly_report_contract_fields(self):
        """contract.md c018 — exact field names."""
        response = self.client.get("/api/reports/monthly/")
        data = response.data["data"]
        for field in ["total_tasks", "completed_tasks", "completion_rate"]:
            self.assertIn(field, data)

    def test_monthly_report_counts(self):
        response = self.client.get("/api/reports/monthly/")
        data = response.data["data"]
        # 5 tasks in last 30 days (W1, W2, W3, M1, M2) — NOT "Old"
        self.assertEqual(data["total_tasks"], 5)
        # W1, M1, M2 are completed
        self.assertEqual(data["completed_tasks"], 3)

    def test_monthly_completion_rate(self):
        response = self.client.get("/api/reports/monthly/")
        rate = response.data["data"]["completion_rate"]
        expected = round((3 / 5) * 100, 2)
        self.assertAlmostEqual(rate, expected, places=1)

    def test_monthly_report_cached(self):
        cache_count_before = ReportCache.objects.filter(
            user=self.user, report_type="monthly"
        ).count()
        self.client.get("/api/reports/monthly/")
        cache_count_after = ReportCache.objects.filter(
            user=self.user, report_type="monthly"
        ).count()
        self.assertEqual(cache_count_after, cache_count_before + 1)

    def test_monthly_requires_auth(self):
        client = APIClient()
        response = client.get("/api/reports/monthly/")
        self.assertEqual(response.status_code, 401)

    def test_reports_are_user_isolated(self):
        """Other users' tasks must not appear in this user's report."""
        other = User.objects.create_user(
            email="intruder@example.com", name="Intruder", password="pass"
        )
        Task.objects.create(user=other, title="Intruder Task", status="completed")

        response = self.client.get("/api/reports/monthly/")
        data = response.data["data"]
        # total_tasks should still be 5, not 6
        self.assertEqual(data["total_tasks"], 5)

    def test_response_never_raw_array(self):
        response = self.client.get("/api/reports/monthly/")
        self.assertIsInstance(response.data, dict)
        self.assertIn("success", response.data)
