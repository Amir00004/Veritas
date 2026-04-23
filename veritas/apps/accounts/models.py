"""
Custom User model for Veritas.

Uses email as USERNAME_FIELD (no username). Stores the research-profile
fields directly on the user so we avoid a separate Profile table — the
user *is* the researcher.
"""
from __future__ import annotations

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import CustomUserManager


class AcademicLevel(models.TextChoices):
    UNDERGRAD = "undergrad", "Undergraduate"
    MASTER = "master", "Master's"
    PHD = "phd", "PhD"
    POSTDOC = "postdoc", "Post-Doc"
    OTHER = "other", "Other"


class User(AbstractBaseUser, PermissionsMixin):
    """Email-authenticated user with embedded research profile."""

    # ── Auth fields ──────────────────────────────
    email = models.EmailField("email address", unique=True, db_index=True)

    # ── Profile fields ───────────────────────────
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    field_of_study = models.CharField(
        max_length=255,
        blank=True,
        help_text="e.g. Computer Science, Biomedical Engineering",
    )
    research_interests = models.JSONField(
        default=list,
        blank=True,
        help_text='List of research interests, e.g. ["NLP", "computer vision"]',
    )
    career_goals = models.TextField(
        blank=True,
        default="",
        help_text="Free-form career objectives",
    )
    academic_level = models.CharField(
        max_length=20,
        choices=AcademicLevel.choices,
        default=AcademicLevel.OTHER,
    )

    # ── Status / permission flags ────────────────
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's email has been verified.",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # ── Timestamps ───────────────────────────────
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── Manager ──────────────────────────────────
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []  # email is already required by USERNAME_FIELD

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email
