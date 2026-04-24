"""Models for professor research and enrichment workflow."""
from __future__ import annotations

from django.db import models
from django.utils import timezone


class Professor(models.Model):
    """Research profile for a professor discovered by the system."""

    author_id = models.CharField(
        max_length=128,
        unique=True,
        db_index=True,
        null=True,
        blank=True,
    )
    full_name = models.CharField(max_length=255, db_index=True)
    university = models.CharField(max_length=255, default="Unknown University")
    department = models.CharField(max_length=255, blank=True)
    research_areas = models.JSONField(default=list, blank=True)
    h_index = models.IntegerField(null=True, blank=True)
    h_index_since_2021 = models.IntegerField(null=True, blank=True)
    i10_index = models.IntegerField(null=True, blank=True)
    i10_index_since_2021 = models.IntegerField(null=True, blank=True)
    total_citations = models.IntegerField(null=True, blank=True)
    citations_since_2021 = models.IntegerField(null=True, blank=True)
    recent_papers = models.JSONField(default=list, blank=True)
    profile_urls = models.JSONField(default=dict, blank=True)
    profile_picture_url = models.URLField(blank=True)
    email = models.EmailField(blank=True, null=True)
    profile_data = models.JSONField(default=dict, blank=True)
    fit_score = models.FloatField(default=0.0)
    last_scraped = models.DateTimeField(default=timezone.now, db_index=True)
    last_enriched_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]
        constraints = []

    def __str__(self) -> str:
        return self.full_name


class SerpApiRawResponse(models.Model):
    """Archived raw SerpAPI payload saved to storage."""

    STEP_SEARCH = "search"
    STEP_AUTHOR = "author"
    STEP_CHOICES = (
        (STEP_SEARCH, "Google Scholar Search"),
        (STEP_AUTHOR, "Google Scholar Author"),
    )

    author_id = models.CharField(max_length=128, db_index=True)
    step = models.CharField(max_length=16, choices=STEP_CHOICES)
    storage_key = models.CharField(max_length=512, unique=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]
