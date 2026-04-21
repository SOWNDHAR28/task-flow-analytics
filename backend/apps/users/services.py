"""
users/services.py
Business logic for authentication.
Views stay thin — all logic lives here.
"""

from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


def register_user(validated_data: dict) -> User:
    """
    Create a new user.
    Password hashing is handled inside UserManager.create_user().
    """
    return User.objects.create_user(
        email=validated_data["email"],
        name=validated_data["name"],
        password=validated_data["password"],
    )


def generate_jwt_token(user: User) -> str:
    """
    Generate a JWT access token for the given user.
    Returns the access token string (contract.md c007 → "token").
    """
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def build_login_response(user: User) -> dict:
    """
    Build the data payload for the login response.
    contract.md c007:
      { "token": "...", "user": { "id": ..., "name": ..., "email": ... } }
    """
    return {
    "token": generate_jwt_token(user),
    "user": {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at,  # ✅ ADD THIS
    },
}
