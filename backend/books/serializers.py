from rest_framework import serializers
from .models import Book
from django.db.models import Avg
from boards.models import Post

class BookSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    
    #  Add the SerializerMethodField for average rating 
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Book
        #  Append 'average_rating' to the fields list 
        fields = [
            'id', 'title', 'author', 'condition', 'price', 
            'status', 'cover', 'owner', 'owner_username', 
            'created_at', 'average_rating'
        ]
        read_only_fields = ['owner']

    #  Add the method to calculate the average rating 
    def get_average_rating(self, obj):
        # Filter all system reviews for this specific book
        reviews = Post.objects.filter(book_id=obj.id, board__name='__SYSTEM_REVIEWS__')
        # Calculate the average of the 'rating' field
        avg = reviews.aggregate(Avg('rating'))['rating__avg']
        # Return rounded integer, or 0 if no reviews exist
        return round(avg) if avg is not None else 0
    

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price can't be negative!")
        return value


