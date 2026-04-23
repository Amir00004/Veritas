"""API views for the accounts app."""
from __future__ import annotations

import structlog
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, UserSerializer

logger = structlog.get_logger(__name__)
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def perform_create(self, serializer: RegisterSerializer) -> None:
        user = serializer.save()
        logger.info("user_registered", user_id=user.pk, email=user.email)


class MeView(APIView):
    """
    GET  /api/me/ — return the authenticated user's profile.
    PATCH /api/me/ — partial-update the authenticated user's profile.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request: Request) -> Response:
        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info("user_profile_updated", user_id=request.user.pk)
        return Response(serializer.data)


class HealthCheckView(APIView):
    """GET /api/health/ — unauthenticated liveness probe."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request: Request) -> Response:
        return Response({"status": "ok", "service": "veritas"}, status=status.HTTP_200_OK)
