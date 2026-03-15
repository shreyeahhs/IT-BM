import os

from django.core.wsgi import get_wsgi_application

from .startup import bootstrap_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookshare.settings')

bootstrap_application()

application = get_wsgi_application()
