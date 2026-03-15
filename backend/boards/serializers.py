from rest_framework import serializers, viewsets, permissions
from .models import DiscussionBoard, BoardMembership, Post, TradeChatRoom, TradeChatMessage

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
        fields = [
            'id', 'content', 'author', 'author_username', 'board', 'created_at', 'book_id', 'rating'
        ]
        read_only_fields = ['author', 'board']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Content cannot be empty.')
        return value.strip()

    def validate(self, data):
        request = self.context.get('request')

        board = self.context.get('board') or data.get('board')
        if board is None and self.instance:
            board = self.instance.board

        # Accept review fields from either validated_data or initial payload.
        raw_book_id = data.get('book_id', self.initial_data.get('book_id'))
        if raw_book_id in (None, '', 'null') and self.instance:
            raw_book_id = self.instance.book_id

        book_id = None
        if raw_book_id not in (None, '', 'null'):
            try:
                book_id = int(raw_book_id)
                if book_id <= 0:
                    raise ValueError
            except (TypeError, ValueError):
                raise serializers.ValidationError('book_id must be a positive integer.')

        if board and board.name == '__SYSTEM_REVIEWS__':
            if book_id is None:
                raise serializers.ValidationError('Book review should connect with specific book ID.')
        elif book_id is not None:
            raise serializers.ValidationError('book_id is only allowed in the system review board.')

        raw_rating = data.get('rating', self.initial_data.get('rating'))
        rating = None
        if raw_rating not in (None, '', 'null'):
            try:
                rating = int(raw_rating)
            except (TypeError, ValueError):
                raise serializers.ValidationError('Rating must be an integer between 1 and 5.')
            if rating < 1 or rating > 5:
                raise serializers.ValidationError('Rating must be between 1 and 5.')

        if request and request.method == 'POST' and book_id is not None:
            if Post.objects.filter(author=request.user, book_id=book_id).exists():
                raise serializers.ValidationError('You have already reviewed this book. Please edit it instead.')

        data['book_id'] = book_id
        data['rating'] = rating
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


class TradeChatRoomSerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source='book.title')
    buyer_username = serializers.ReadOnlyField(source='buyer.username')
    seller_username = serializers.ReadOnlyField(source='seller.username')

    class Meta:
        model = TradeChatRoom
        fields = [
            'id',
            'book',
            'book_title',
            'buyer',
            'buyer_username',
            'seller',
            'seller_username',
            'initial_intent',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['buyer', 'seller', 'created_at', 'updated_at']


class TradeChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = TradeChatMessage
        fields = ['id', 'room', 'sender', 'sender_username', 'content', 'created_at']
        read_only_fields = ['room', 'sender', 'created_at']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value.strip()