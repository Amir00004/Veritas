"""Service-layer functions for professor research flow."""
from __future__ import annotations

from datetime import timedelta

from celery import chain
from django.utils import timezone

from .models import Professor

STALE_AFTER_DAYS = 14
WEIGHTS = {
    "research_overlap": 50,
    "level_compatibility": 20,
    "publication_activity": 20,
    "other": 10,
}


def is_data_stale(last_scraped) -> bool:
    """Return True when professor data is missing or older than threshold."""
    if last_scraped is None:
        return True
    return last_scraped < timezone.now() - timedelta(days=STALE_AFTER_DAYS)


def calculate_fit_score(user, professor: Professor) -> dict:
    """Compute a structured 0-100 fit score with an explainable breakdown."""
    user_interests = {
        str(i).strip().lower()
        for i in getattr(user, "research_interests", []) or []
        if str(i).strip()
    }
    professor_research_areas = [
        str(a).strip().lower() for a in (professor.research_areas or []) if str(a).strip()
    ]
    paper_titles = [
        str(paper.get("title", "")).strip().lower()
        for paper in (professor.recent_papers or [])
        if isinstance(paper, dict)
    ]

    matches = 0
    for interest in user_interests:
        in_areas = any(interest in area for area in professor_research_areas)
        in_titles = any(interest in title for title in paper_titles)
        if in_areas or in_titles:
            matches += 1

    overlap_ratio = (matches / len(user_interests)) if user_interests else 0.0
    research_overlap = int(round(overlap_ratio * WEIGHTS["research_overlap"]))

    academic_level = getattr(user, "academic_level", "") or ""
    if academic_level in {"phd", "postdoc"}:
        level_compatibility = WEIGHTS["level_compatibility"]
    elif academic_level in {"master", "undergrad"}:
        level_compatibility = int(round(WEIGHTS["level_compatibility"] * 0.7))
    else:
        level_compatibility = int(round(WEIGHTS["level_compatibility"] * 0.4))

    publication_activity = 0
    if (professor.h_index or 0) > 20:
        publication_activity += int(round(WEIGHTS["publication_activity"] * 0.7))
    if professor.recent_papers:
        publication_activity += int(round(WEIGHTS["publication_activity"] * 0.3))
    publication_activity = min(publication_activity, WEIGHTS["publication_activity"])

    other = WEIGHTS["other"] if professor.email else int(round(WEIGHTS["other"] * 0.5))

    total_score = research_overlap + level_compatibility + publication_activity + other
    total_score = max(0, min(100, int(total_score)))

    explanation = (
        f"Matched {matches} research interests; level='{academic_level or 'unknown'}'; "
        f"h-index={professor.h_index if professor.h_index is not None else 'n/a'}; "
        f"papers={len(professor.recent_papers or [])}."
    )

    return {
        "total_score": total_score,
        "max_score": 100,
        "breakdown": {
            "research_overlap": int(research_overlap),
            "level_compatibility": int(level_compatibility),
            "publication_activity": int(publication_activity),
            "other": int(other),
        },
        "explanation": explanation,
    }


def _serialize_professor(professor: Professor) -> dict:
    """Return API-friendly dict for professor payload."""
    return {
        "id": professor.id,
        "author_id": professor.author_id,
        "full_name": professor.full_name,
        "university": professor.university,
        "department": professor.department,
        "research_areas": professor.research_areas,
        "h_index": professor.h_index,
        "h_index_since_2021": professor.h_index_since_2021,
        "i10_index": professor.i10_index,
        "i10_index_since_2021": professor.i10_index_since_2021,
        "total_citations": professor.total_citations,
        "citations_since_2021": professor.citations_since_2021,
        "recent_papers": professor.recent_papers,
        "profile_urls": professor.profile_urls,
        "profile_picture_url": professor.profile_picture_url,
        "email": professor.email,
        "last_scraped": professor.last_scraped.isoformat() if professor.last_scraped else None,
        "last_enriched_at": (
            professor.last_enriched_at.isoformat() if professor.last_enriched_at else None
        ),
        "updated_at": professor.updated_at.isoformat() if professor.updated_at else None,
    }


def trigger_professor_enrichment(user, full_name: str, university_name: str) -> dict:
    """Queue the two-step SerpAPI enrichment chain and return task id immediately."""
    normalized_full_name = full_name.strip()
    normalized_university = university_name.strip()
    from .tasks import enrich_author_profile_task, find_author_id_task

    task = chain(
        find_author_id_task.s(normalized_full_name, normalized_university, user.id),
        enrich_author_profile_task.s(),
    ).apply_async()
    return {
        "professor_data": None,
        "score_data": None,
        "status": "processing",
        "task_id": task.id,
    }
