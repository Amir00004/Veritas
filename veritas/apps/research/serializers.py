"""Serializers for the research app."""
from __future__ import annotations

from rest_framework import serializers

from .models import Professor


class ProfessorSerializer(serializers.ModelSerializer):
    """Read serializer for professor research profile."""

    class Meta:
        model = Professor
        fields = (
            "id",
            "full_name",
            "university",
            "department",
            "research_areas",
            "h_index",
            "total_citations",
            "recent_papers",
            "profile_urls",
            "email",
            "profile_data",
            "fit_score",
            "last_scraped",
            "updated_at",
        )
