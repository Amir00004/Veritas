"""Models for professor research and enrichment workflow."""
from __future__ import annotations

from django.db import models
from django.utils import timezone


class Professor(models.Model):
    """Research profile for a professor discovered by the system."""

    full_name = models.CharField(max_length=255, db_index=True)
    university = models.CharField(max_length=255, default="Unknown University")
    department = models.CharField(max_length=255, blank=True)
    research_areas = models.JSONField(default=list, blank=True)
    h_index = models.IntegerField(null=True, blank=True)
    total_citations = models.IntegerField(null=True, blank=True)
    recent_papers = models.JSONField(default=list, blank=True)
    profile_urls = models.JSONField(default=dict, blank=True)
    email = models.EmailField(blank=True, null=True)
    profile_data = models.JSONField(default=dict, blank=True) #?
    fit_score = models.FloatField(default=0.0)
    last_scraped = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["full_name", "university"],
                name="unique_professor_name_university",
            )
        ]

    def __str__(self) -> str:
        return self.full_name
