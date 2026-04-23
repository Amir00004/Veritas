"""Serializers for the accounts app."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read/update serializer for the authenticated user's profile."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "field_of_study",
            "research_interests",
            "career_goals",
            "academic_level",
            "is_verified",
            "date_joined",
            "updated_at",
        )
        read_only_fields = ("id", "email", "is_verified", "date_joined", "updated_at")


class RegisterSerializer(serializers.ModelSerializer):
    """Handles user registration (email + password)."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "field_of_study",
            "research_interests",
            "career_goals",
            "academic_level",
        )

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)
