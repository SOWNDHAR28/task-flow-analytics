"""
reports/services.py
Report generation business logic.

Now includes:
- Weekly summary
- Monthly summary
- 🔥 Daily breakdown (for charts)
"""

from django.utils import timezone
from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate

from apps.tasks.models import Task, TaskStatus
from .models import ReportCache

from django.db.models.functions import TruncWeek


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _compute_report(user, days: int) -> dict:
    """
    Aggregate task counts for the given user over the last `days` days.
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)

    qs = Task.objects.filter(
        user=user,
        is_deleted=False,
        created_at__gte=start_date,
        created_at__lte=end_date,
    )

    total_tasks = qs.count()
    completed_tasks = qs.filter(status=TaskStatus.COMPLETED).count()

    completion_rate = (
        round((completed_tasks / total_tasks) * 100, 2)
        if total_tasks > 0 else 0.0
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": completion_rate,
        "_start_date": start_date.date(),
        "_end_date": end_date.date(),
    }


# 🔥 NEW: Daily breakdown for charts
def _compute_daily_breakdown(user, days: int):
    """
    Returns:
    [
      { date: 2026-04-20, total: 5, completed: 3 },
      ...
    ]
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)

    qs = Task.objects.filter(
        user=user,
        is_deleted=False,
        created_at__gte=start_date,
        created_at__lte=end_date,
    )

    daily = (
        qs.annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(
            total=Count("id"),
            completed=Count("id", filter=Q(status=TaskStatus.COMPLETED)),
        )
        .order_by("date")
    )

    return list(daily)


def _cache_report(user, report_type: str, data: dict) -> None:
    """
    Persist computed report to reports_cache.
    """
    ReportCache.objects.create(
        user=user,
        report_type=report_type,
        total_tasks=data["total_tasks"],
        completed_tasks=data["completed_tasks"],
        completion_rate=data["completion_rate"],
        start_date=data["_start_date"],
        end_date=data["_end_date"],
    )


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def get_weekly_report(user) -> dict:
    """
    Weekly report: last 7 days
    """
    data = _compute_report(user, days=7)
    daily = _compute_daily_breakdown(user, days=7)

    _cache_report(user, ReportCache.WEEKLY, data)

    return {
        "total_tasks": data["total_tasks"],
        "completed_tasks": data["completed_tasks"],
        "completion_rate": data["completion_rate"],
        "daily": daily,  # 🔥 added for chart
    }


def get_monthly_report(user) -> dict:
    data = _compute_report(user, days=30)
    weekly = _compute_weekly_breakdown(user, days=30)

    _cache_report(user, ReportCache.MONTHLY, data)

    return {
        "total_tasks": data["total_tasks"],
        "completed_tasks": data["completed_tasks"],
        "completion_rate": data["completion_rate"],
        "weekly": weekly,  # 🔥 NEW
    }


def _compute_weekly_breakdown(user, days: int):
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)

    qs = Task.objects.filter(
        user=user,
        is_deleted=False,
        created_at__gte=start_date,
        created_at__lte=end_date,
    )

    weekly = (
        qs.annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(
            total=Count("id"),
            completed=Count("id", filter=Q(status=TaskStatus.COMPLETED)),
        )
        .order_by("week")
    )

    return list(weekly)