import logging
import os
import threading

import django
from django.core.management import call_command


logger = logging.getLogger(__name__)
_bootstrap_lock = threading.Lock()
_bootstrap_completed = False


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def bootstrap_application():
    global _bootstrap_completed

    if not env_bool('AUTO_BOOTSTRAP', default=False):
        return

    if _bootstrap_completed:
        return

    with _bootstrap_lock:
        if _bootstrap_completed:
            return

        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookshare.settings')
        django.setup()

        logger.info('Running startup migrations')
        call_command('migrate', interactive=False, verbosity=0)

        if env_bool('AUTO_SEED_DEMO', default=False):
            from django.contrib.auth.models import User
            from books.models import Book

            if not User.objects.exists() and not Book.objects.exists():
                logger.info('Seeding demo data on startup')
                call_command('seed_db', verbosity=0)

        _bootstrap_completed = True