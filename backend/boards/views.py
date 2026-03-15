from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from books.models import Book
from .models import DiscussionBoard, BoardMembership, Post, TradeChatRoom, TradeChatMessage
from .serializers import (
    DiscussionBoardSerializer,
    BoardMembershipSerializer,
    PostSerializer,
    TradeChatRoomSerializer,
    TradeChatMessageSerializer,
)
from .permissions import IsBoardMember

class BoardViewSet(viewsets.ModelViewSet):
    queryset = DiscussionBoard.objects.all()
    serializer_class = DiscussionBoardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = DiscussionBoard.objects.all()
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name=name)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        board = self.get_object()
        membership, created = BoardMembership.objects.get_or_create(user=request.user, board=board)
        if created:
            return Response({'status': 'joined'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already a member'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, pk=None):
        board = self.get_object()
        deleted, _ = BoardMembership.objects.filter(user=request.user, board=board).delete()
        if deleted:
            return Response({'status': 'left'}, status=status.HTTP_200_OK)
        return Response({'status': 'not a member'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def posts(self, request, pk=None):
        board = self.get_object()
        if request.method == 'GET':
            book_id = request.query_params.get('book_id')
            posts = board.posts.all().order_by('-created_at')

            if book_id:
                posts = posts.filter(book_id=book_id)

            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data)
        
        if request.method == 'POST':
            # Check if user is a member (handled by IsBoardMember but explicit check anyway)
            is_system_review = (board.name == "__SYSTEM_REVIEWS__")
            is_member = BoardMembership.objects.filter(user=request.user, board=board).exists()
            
            if not is_system_review and not is_member:
                return Response({'error': 'Must be a member to post in this board'}, status=status.HTTP_403_FORBIDDEN)
            
            # if not BoardMembership.objects.filter(user=request.user, board=board).exists():
            #     return Response({'error': 'Must be a member to post'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = PostSerializer(data=request.data, context={'request': request, 'board': board})
            if serializer.is_valid():
                serializer.save(author=request.user, board=board)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        return Post.objects.all()


class TradeChatRoomViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TradeChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TradeChatRoom.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).select_related('book', 'buyer', 'seller').order_by('-updated_at')

    @action(detail=False, methods=['post'], url_path='start')
    def start(self, request):
        book_id = request.data.get('book_id')
        intent = request.data.get('intent', 'buy')

        if intent not in {'buy', 'borrow'}:
            return Response({'error': 'intent must be buy or borrow'}, status=status.HTTP_400_BAD_REQUEST)

        if not book_id:
            return Response({'error': 'book_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        if book.owner_id == request.user.id:
            return Response({'error': 'You cannot start a chat on your own listing'}, status=status.HTTP_400_BAD_REQUEST)

        room, created = TradeChatRoom.objects.get_or_create(
            book=book,
            buyer=request.user,
            seller=book.owner,
            defaults={'initial_intent': intent},
        )

        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        room = self.get_object()

        if request.method == 'GET':
            messages = room.messages.select_related('sender').all()
            serializer = TradeChatMessageSerializer(messages, many=True)
            return Response(serializer.data)

        serializer = TradeChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(room=room, sender=request.user)
            room.save(update_fields=['updated_at'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)