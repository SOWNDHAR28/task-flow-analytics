"""
users/views.py
Authentication endpoints — contract.md §4.

POST /api/auth/register/  → RegisterView
POST /api/auth/login/     → LoginView

Both are AllowAny (no JWT required).
Business logic delegated to services.py.
"""

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.common.utils import success_response, error_response
from .serializers import RegisterSerializer, LoginSerializer
from .services import build_login_response


class RegisterView(APIView):
    """
    POST /api/auth/register/
    contract.md c004 → c005
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # Return first validation error in contract error format
            first_error = next(iter(serializer.errors.values()))[0]
            return error_response(str(first_error))

        user = serializer.save()

        # contract.md c005 response data
        data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
        return success_response(data, http_status=201)


class LoginView(APIView):
    """
    POST /api/auth/login/
    contract.md c006 → c007
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return error_response(str(first_error))

        user = serializer.validated_data["user"]
        data = build_login_response(user)
        return success_response(data)
