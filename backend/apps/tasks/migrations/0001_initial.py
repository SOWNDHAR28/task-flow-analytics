import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=500)),
                ("description", models.TextField(blank=True, null=True)),
                ("status", models.CharField(
                    choices=[("pending", "Pending"), ("completed", "Completed"), ("partial", "Partial")],
                    default="pending",
                    max_length=20,
                )),
                ("remarks", models.TextField(blank=True, null=True)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("is_deleted", models.BooleanField(default=False)),
                ("user", models.ForeignKey(
                    db_index=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="tasks",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "db_table": "tasks",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="TaskLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("old_status", models.CharField(blank=True, max_length=20, null=True)),
                ("new_status", models.CharField(max_length=20)),
                ("remarks", models.TextField(blank=True, null=True)),
                ("changed_at", models.DateTimeField(auto_now_add=True)),
                ("task", models.ForeignKey(
                    db_index=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="logs",
                    to="tasks.task",
                )),
            ],
            options={
                "db_table": "task_logs",
                "ordering": ["-changed_at"],
            },
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["created_at"], name="idx_tasks_created_at"),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["user", "is_deleted"], name="idx_tasks_user_deleted"),
        ),
    ]
