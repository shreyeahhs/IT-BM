from rest_framework import permissions
from .models import BoardMembership

class IsBoardMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a board to create posts.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is authenticated for POST
        if not request.user or not request.user.is_authenticated:
            return False

        # For post creation, we need the board_id from the URL
        board_id = view.kwargs.get('board_pk') or request.data.get('board')
        if board_id:
            return BoardMembership.objects.filter(user=request.user, board_id=board_id).exists()
        
        return True
