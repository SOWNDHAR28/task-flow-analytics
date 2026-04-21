"""
users/models.py
Custom User model.
Schema aligned with db_schema.md — table: users
Fields: id, name, email, password, created_at
Extends AbstractBaseUser + PermissionsMixin for full Django auth support.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    """Custom manager: email is the unique identifier (not username)."""

    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        if not name:
            raise ValueError("Name is required.")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)  # hashes password via Django's hasher
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    db_schema.md → users table
    id         : auto PK
    name       : varchar, not null
    email      : varchar, unique, not null
    password   : varchar, not null (managed by AbstractBaseUser)
    created_at : timestamp, default current time
    """

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Django internals
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.name} <{self.email}>"
