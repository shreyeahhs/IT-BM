from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'condition', 'price', 'status', 'cover', 'owner', 'owner_username', 'created_at']
        read_only_fields = ['owner']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price can't be negative!")
        return value