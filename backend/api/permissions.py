"""
Custom permission classes for role-based access control.
Different users have different levels of access.
"""

from rest_framework import permissions


def role_for(user):
    """Return the profile role while remaining safe for legacy accounts."""
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return 'admin'
    return getattr(getattr(user, 'profile', None), 'role', 'staff')

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    Admin has full access to everything.
    """
    def has_permission(self, request, view):
        return role_for(request.user) == 'admin'

class IsManagerUser(permissions.BasePermission):
    """
    Allows access to admin and manager users.
    Managers have elevated privileges but not full admin.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return role_for(request.user) in ['admin', 'manager']

class IsStaffUser(permissions.BasePermission):
    """
    Allows access to staff, manager, and admin users.
    Staff can perform basic operations.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return role_for(request.user) in ['admin', 'manager', 'staff']
