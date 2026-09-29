from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to POS administrators.
    """

    message = "Admin access is required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsBillingStaff(BasePermission):
    """
    Allows access only to active billing staff.
    """

    message = "Billing staff access is required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return False

        try:
            profile = request.user.staffprofile
        except Exception:
            return False

        return profile.is_active


class IsAdminOrBillingStaff(BasePermission):
    """
    Allows access to either an administrator
    or an active billing staff member.
    """

    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        try:
            return request.user.staffprofile.is_active
        except Exception:
            return False