from django.db import models
from django.contrib.auth.models import User
from books.models import Book

class DiscussionBoard(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    members = models.ManyToManyField(User, through='BoardMembership', related_name='joined_boards')

    def __str__(self):
        return self.name

class BoardMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    board = models.ForeignKey(DiscussionBoard, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'board')

class Post(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    board = models.ForeignKey(DiscussionBoard, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)

    book_id = models.IntegerField(null=True, blank=True) 
    rating = models.IntegerField(null=True, blank=True)

    class Meta:
        # One user only have one post for a book
        constraints = [
            models.UniqueConstraint(
                fields=['author', 'book_id'], 
                name='unique_review_per_user',
                condition=models.Q(book_id__isnull=False)
            )
        ]

    def __str__(self):
        return f"Post by {self.author.username} on {self.board.name}"


class TradeChatRoom(models.Model):
    INTENT_CHOICES = [
        ('buy', 'Buy'),
        ('borrow', 'Borrow'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='trade_chat_rooms')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_trade_chat_rooms')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_trade_chat_rooms')
    initial_intent = models.CharField(max_length=10, choices=INTENT_CHOICES, default='buy')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('book', 'buyer', 'seller')

    def __str__(self):
        return f"{self.book.title}: {self.buyer.username} <-> {self.seller.username}"


class TradeChatMessage(models.Model):
    room = models.ForeignKey(TradeChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trade_chat_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} in room {self.room_id}"
