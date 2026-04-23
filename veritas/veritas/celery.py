"""
Celery application for the Veritas project.

Usage:
    celery -A veritas worker -l info
"""
from __future__ import annotations

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "veritas.settings")

app = Celery("veritas")

# Read config from Django settings; all Celery-related keys are prefixed CELERY_
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every installed app
app.autodiscover_tasks()
