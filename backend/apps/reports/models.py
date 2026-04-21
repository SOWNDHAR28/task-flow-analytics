"""
reports/models.py
ReportCache model — db_schema.md §3.4

Stores precomputed report results for faster access.
Reduces repeated aggregation queries on the tasks table.

Table: reports_cache
Indexed: user_id — db_schema.md §6
"""

from django.db import models
from django.conf import settings


class ReportCache(models.Model):
    """
    db_schema.md → reports_cache table

    Fields:
      id              : auto PK
      user_id         : FK → users
      report_type     : "weekly" | "monthly"
      total_tasks     : integer
      completed_tasks : integer
      completion_rate : float  (0–100)
      start_date      : date
      end_date        : date
      generated_at    : timestamp
    """

    WEEKLY = "weekly"
    MONTHLY = "monthly"
    REPORT_TYPE_CHOICES = [
        (WEEKLY, "Weekly"),
        (MONTHLY, "Monthly"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="report_caches",
        db_index=True,      # index on user_id — db_schema.md §6
    )
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    total_tasks = models.IntegerField(default=0)
    completed_tasks = models.IntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)
    start_date = models.DateField()
    end_date = models.DateField()
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reports_cache"
        ordering = ["-generated_at"]
        indexes = [
            models.Index(
                fields=["user", "report_type", "start_date"],
                name="idx_rptcache_user_type_dt",
            )
        ]

    def __str__(self):
        return (
            f"{self.report_type} report for user={self.user_id} "
            f"({self.start_date} → {self.end_date})"
        )
