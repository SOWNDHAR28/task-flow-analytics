"""
users/serializers.py
Serializers for Register and Login.
Response fields aligned exactly with contract.md c004–c007.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    contract.md c004 — Register request:
      { "name": "...", "email": "...", "password": "..." }
    contract.md c005 — Register response data:
      { "id": 1, "name": "...", "email": "..." }
    """

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "name", "email", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # set_password hashes the password automatically
        return User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    """
    contract.md c006 — Login request:
      { "email": "...", "password": "..." }
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        attrs["user"] = user
        return attrs


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "created_at"]
