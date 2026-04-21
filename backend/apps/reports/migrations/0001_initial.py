import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReportCache",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("report_type", models.CharField(
                    choices=[("weekly", "Weekly"), ("monthly", "Monthly")],
                    max_length=20,
                )),
                ("total_tasks", models.IntegerField(default=0)),
                ("completed_tasks", models.IntegerField(default=0)),
                ("completion_rate", models.FloatField(default=0.0)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("generated_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(
                    db_index=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="report_caches",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "db_table": "reports_cache",
                "ordering": ["-generated_at"],
            },
        ),
        migrations.AddIndex(
            model_name="reportcache",
            index=models.Index(
                fields=["user", "report_type", "start_date"],
                name="idx_rptcache_user_type_dt",
            ),
        ),
    ]
