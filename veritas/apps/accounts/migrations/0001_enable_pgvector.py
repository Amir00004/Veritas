"""
Enable the pgvector PostgreSQL extension early.

This is a standalone migration so that any future model migration
that uses VectorField can depend on it.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies: list = []

    operations = [
        migrations.RunSQL(
            sql="CREATE EXTENSION IF NOT EXISTS vector;",
            reverse_sql="DROP EXTENSION IF EXISTS vector;",
        ),
    ]
