"""
common/utils.py
Shared response helpers and custom DRF exception handler.
ALL responses MUST follow contract.md:
  SUCCESS → { "success": true,  "data": ... }
  ERROR   → { "success": false, "message": "..." }
"""

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler


# ---------------------------------------------------------------------------
# Standard response builders
# ---------------------------------------------------------------------------

def success_response(data, http_status=status.HTTP_200_OK):
    """Wrap any data payload in the contract.md success envelope."""
    return Response({"success": True, "data": data}, status=http_status)


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST):
    """Wrap an error message in the contract.md error envelope."""
    return Response({"success": False, "message": message}, status=http_status)


# ---------------------------------------------------------------------------
# Custom DRF exception handler — converts ALL errors to contract format
# ---------------------------------------------------------------------------

def custom_exception_handler(exc, context):
    """
    Override DRF's default handler so every unhandled exception still
    returns { "success": false, "message": "..." }.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Flatten DRF's nested error dicts into a readable string
        errors = response.data

        if isinstance(errors, dict):
            messages = []
            for field, value in errors.items():
                if isinstance(value, list):
                    messages.append(f"{field}: {', '.join(str(v) for v in value)}")
                else:
                    messages.append(str(value))
            message = " | ".join(messages)
        elif isinstance(errors, list):
            message = ", ".join(str(e) for e in errors)
        else:
            message = str(errors)

        response.data = {"success": False, "message": message}

    return response
