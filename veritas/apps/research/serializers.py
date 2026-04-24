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
            "author_id",
            "full_name",
            "university",
            "department",
            "research_areas",
            "h_index",
            "h_index_since_2021",
            "i10_index",
            "i10_index_since_2021",
            "total_citations",
            "citations_since_2021",
            "recent_papers",
            "profile_urls",
            "profile_picture_url",
            "email",
            "profile_data",
            "fit_score",
            "last_scraped",
            "last_enriched_at",
            "updated_at",
        )
