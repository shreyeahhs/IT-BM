from rest_framework import serializers, viewsets, permissions
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

    def validate(self, data):
        request = self.context.get('request')
        
        board = data.get('board')
        if not board and self.instance:
            board = self.instance.board
            
        book_id = self.initial_data.get('book_id') or data.get('book_id')
        if not book_id and self.instance:
            book_id = self.instance.book_id

        if board and board.name == "__SYSTEM_REVIEWS__":
            if not book_id:
                raise serializers.ValidationError("Book review should connect with specific book ID.")
        elif book_id:
            raise serializers.ValidationError("Publish failed")

        if book_id:

            rating = data.get('rating')
            if rating is not None and (int(rating) < 1 or int(rating) > 5):
                raise serializers.ValidationError("Rating must be between 1 and 5.")

            if request and request.method == 'POST':
                if Post.objects.filter(author=request.user, book_id=book_id).exists():
                    raise serializers.ValidationError("You have already reviewed this book. Please edit it instead.")
                    
        return data

    # def validate(self, data):
    #     request = self.context.get('request')
    #     user = request.user
    #     board = data.get('board')
    #     # book_id = data.get('book_id')
    #     book_id = self.initial_data.get('book_id') or data.get('book_id')

    #     if board and board.name == "__SYSTEM_REVIEWS__":
    #         if not book_id:
    #             raise serializers.ValidationError("Book review should connect with specific book ID")
        
    #     elif book_id:
    #         raise serializers.ValidationError("Board can not connect with book ID")

    #     if book_id:
    #         exists = Post.objects.filter(author=user, book_id=book_id).exists()
    #         if exists:
    #             raise serializers.ValidationError("You can edit it.")
    #         rating = data.get('rating')
    #         if rating and (rating < 1 or rating > 5):
    #             raise serializers.ValidationError("Rating must be between 1 and 5.")
                
    #     return data