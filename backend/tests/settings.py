"""
tests/settings.py
Test-only Django settings.
Uses SQLite in-memory so tests run without MySQL dependency.
All other settings inherited from config.settings.
"""

from config.settings import *  # noqa: F401, F403

# Override DB to SQLite for fast, dependency-free tests
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Disable debug in tests
DEBUG = False

# Use a fixed secret key for tests
SECRET_KEY = "test-secret-key-not-for-production"
