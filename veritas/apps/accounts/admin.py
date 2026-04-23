"""Admin configuration for the custom User model."""
from __future__ import annotations

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin view tailored to our email-based User."""

    model = User
    list_display = (
        "email",
        "first_name",
        "last_name",
        "academic_level",
        "is_verified",
        "is_staff",
        "date_joined",
    )
    list_filter = ("is_staff", "is_superuser", "is_verified", "academic_level")
    search_fields = ("email", "first_name", "last_name", "field_of_study")
    ordering = ("-date_joined",)

    # Override fieldsets so Django admin doesn't expect a `username` field
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "field_of_study",
                    "research_interests",
                    "career_goals",
                    "academic_level",
                ),
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_verified",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "academic_level",
                ),
            },
        ),
    )
