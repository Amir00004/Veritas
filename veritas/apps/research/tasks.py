"""
Celery tasks for the research app.

Phase 1: dummy debug task to verify the Celery worker is wired up.
Phase 2+: scraping, enrichment, fit-score computation tasks.
"""
from __future__ import annotations

import structlog
from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Professor
from .serializers import ProfessorSerializer
from .services import calculate_fit_score

logger = structlog.get_logger(__name__)
User = get_user_model()


@shared_task(bind=True, name="research.debug_task")
def debug_task(self) -> dict:
    """
    Smoke-test task: logs its own request info and returns it.

    Usage:
        from apps.research.tasks import debug_task
        result = debug_task.delay()
        result.get(timeout=10)
    """
    info = {
        "task_id": self.request.id,
        "task_name": self.name,
        "message": "Celery is alive and well!",
    }
    logger.info("debug_task_executed", **info)
    return info


@shared_task(name="research.research_and_save_professor")
def research_and_save_professor(professor_name: str, user_id: int) -> dict:
    """
    Placeholder background research task.

    Phase 2 will replace this with scraping/enrichment logic.
    """
    try:
        # Validate user exists; no-op if deleted.
        user = User.objects.filter(pk=user_id).first()
        if user is None:
            logger.warning(
                "research_task_skipped_user_missing",
                user_id=user_id,
                professor_name=professor_name,
            )
            return {"status": "failed", "error": "user_not_found"}

        normalized_name = professor_name.strip()
        placeholder_university = "Unknown University"

        # Placeholder record until real scraper is implemented.
        professor, _created = Professor.objects.update_or_create(
            full_name=normalized_name,
            university=placeholder_university,
            defaults={
                "department": "",
                "research_areas": [],
                "h_index": None,
                "total_citations": None,
                "recent_papers": [
                    {
                        "title": f"Recent work by {normalized_name}",
                        "year": timezone.now().year,
                        "citations": 0,
                    }
                ],
                "profile_urls": {},
                "email": None,
                "last_scraped": timezone.now(),
                "profile_data": {
                    "source": "placeholder",
                    "topics": [],
                },
            },
        )
        fit_score_data = calculate_fit_score(user, professor)
        professor.fit_score = fit_score_data["total_score"]
        professor.save(update_fields=["fit_score", "updated_at"])

        logger.info(
            "professor_research_saved",
            professor_id=professor.pk,
            professor_name=professor.full_name,
            user_id=user_id,
        )
        return {
            "status": "success",
            "professor_id": professor.pk,
            "fit_score": fit_score_data,
            "professor": ProfessorSerializer(professor).data,
        }
    except Exception as exc:
        logger.exception(
            "professor_research_failed",
            professor_name=professor_name,
            user_id=user_id,
            error=str(exc),
        )
        return {"status": "failed", "error": str(exc)}
