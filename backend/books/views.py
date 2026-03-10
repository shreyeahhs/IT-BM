from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
from .permissions import IsOwnerOrReadOnly

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-books', permission_classes=[permissions.IsAuthenticated])
    def my_books(self, request):
        books = Book.objects.filter(owner=request.user)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly])
    def update_status(self, request, pk=None):
        book = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Book.STATUS_CHOICES):
            book.status = new_status
            book.save()
            return Response({'status': book.status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
