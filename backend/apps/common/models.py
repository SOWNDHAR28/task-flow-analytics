"""
common/models.py
BaseModel — shared by all domain models.
Provides created_at (auto_now_add) and updated_at (auto_now) per db_schema.md.
"""

from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model injected into every domain model.
    created_at : set once on INSERT (auto_now_add)
    updated_at : refreshed on every UPDATE (auto_now)
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
