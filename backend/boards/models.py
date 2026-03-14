from django.db import models
from django.contrib.auth.models import User

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
