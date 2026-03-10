from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'condition', 'price', 'status', 'owner', 'owner_username', 'created_at']
        read_only_fields = ['owner']
