"""API views for professor research endpoints."""
from __future__ import annotations

from celery.result import AsyncResult
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Professor
from .serializers import ProfessorSerializer
from .services import get_or_research_professor


class ProfessorResearchView(APIView):
    """POST /api/research/professor/ to fetch or trigger professor research."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request) -> Response:
        professor_name = str(request.data.get("professor_name", "")).strip()
        if not professor_name:
            return Response(
                {
                    "status": "error",
                    "message": "Field 'professor_name' is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = get_or_research_professor(request.user, professor_name)

        if result["status"] == "from_cache":
            professor = Professor.objects.filter(pk=result["professor_data"]["id"]).first()
            professor_payload = (
                ProfessorSerializer(professor).data if professor else result["professor_data"]
            )
            return Response(
                {
                    "status": "success",
                    "source": "cache",
                    "professor": professor_payload,
                    "fit_score": result["score_data"],
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "processing",
                "task_id": result["task_id"],
                "message": "Research started. Poll this task_id for completion.",
            },
            status=status.HTTP_202_ACCEPTED,
        )


class TaskStatusView(APIView):
    """GET /api/research/task/<task_id>/ to poll background research jobs."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, task_id: str) -> Response:
        task_result = AsyncResult(task_id)
        task_state = task_result.state

        if task_state in {"PENDING", "RECEIVED", "STARTED", "RETRY", "PROGRESS"}:
            return Response(
                {
                    "status": "processing",
                    "message": "Still gathering professor information...",
                },
                status=status.HTTP_202_ACCEPTED,
            )

        if task_state == "SUCCESS":
            payload = task_result.result if isinstance(task_result.result, dict) else {}
            if payload.get("status") == "failed":
                return Response(
                    {
                        "status": "failed",
                        "error": payload.get("error", "Task failed."),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            payload["status"] = "success"
            return Response(payload, status=status.HTTP_200_OK)

        if task_state == "FAILURE":
            return Response(
                {
                    "status": "failed",
                    "error": str(task_result.info),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if task_state == "REVOKED":
            return Response(
                {
                    "status": "failed",
                    "error": "Task was revoked before completion.",
                },
                status=status.HTTP_410_GONE,
            )

        return Response(
            {
                "status": "failed",
                "error": f"Unhandled task state: {task_state}",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
