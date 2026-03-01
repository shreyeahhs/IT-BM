from django.contrib import admin
from .models import DiscussionBoard, BoardMembership, Post

@admin.register(DiscussionBoard)
class DiscussionBoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(BoardMembership)
class BoardMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'board', 'joined_at')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'board', 'created_at')
    search_fields = ('content',)
