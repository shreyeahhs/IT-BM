from rest_framework import serializers
from .models import DiscussionBoard, BoardMembership, Post

class DiscussionBoardSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source='members.count', read_only=True)
    is_member = serializers.SerializerMethodField()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(pk=request.user.pk).exists()
        return False

    class Meta:
        model = DiscussionBoard
        fields = ['id', 'name', 'description', 'member_count', 'is_member']

class BoardMembershipSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    board_name = serializers.ReadOnlyField(source='board.name')

    class Meta:
        model = BoardMembership
        fields = ['id', 'user', 'username', 'board', 'board_name', 'joined_at']
        read_only_fields = ['user', 'joined_at']

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'author_username', 'board', 'created_at']
        read_only_fields = ['author', 'board']
