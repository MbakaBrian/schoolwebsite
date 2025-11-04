from rest_framework.permissions import BasePermission

class IsRole(BasePermission):
    """
    Allows access only to users with specific role(s).
    Usage: permission_classes = [IsRole.for_roles("Teacher", "Parent")]
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'userprofile', None)
        print("DEBUG ROLE:", profile.role.name)
        if profile and profile.role:
            return profile.role.name in self.allowed_roles
        return False

    @classmethod
    def for_roles(cls, *roles):
        """
        Returns a subclass of IsRole configured with the given roles.
        """
        return type("IsRoleSubclass", (cls,), {"allowed_roles": roles})
