"""
common/permissions.py
Custom DRF permissions.
IsOwner — ensures users can only access their own objects.
"""

from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission: allow access only if obj.user == request.user.
    Used on Task detail endpoints to prevent cross-user data access.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
