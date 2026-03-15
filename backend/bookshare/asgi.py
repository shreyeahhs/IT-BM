import os

from django.core.asgi import get_asgi_application

from .startup import bootstrap_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookshare.settings')

bootstrap_application()

application = get_asgi_application()
