from django.apps import AppConfig
from django.db.models.signals import post_migrate

def create_system_review_board(sender, **kwargs):
    from .models import DiscussionBoard 
    DiscussionBoard.objects.get_or_create(
        name="__SYSTEM_REVIEWS__",
        defaults={
            'description': 'System auto-generated board for book reviews. Do not delete.'
        }
    )

class BoardsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'boards'

    def ready(self):
        post_migrate.connect(create_system_review_board, sender=self)
