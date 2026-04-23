
from __future__ import annotations

import os
from difflib import SequenceMatcher
from typing import Any
from urllib.parse import parse_qs, urlparse

import requests
import structlog
from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
from scholarly import scholarly

from .models import Professor
from .serializers import ProfessorSerializer
from .services import calculate_fit_score

logger = structlog.get_logger(__name__)
User = get_user_model()
SERPAPI_URL = "https://serpapi.com/search"


def _json_safe(obj: Any) -> Any:
    """Convert nested structures into JSON-serializable primitives."""
    if isinstance(obj, dict):
        return {str(k): _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_json_safe(x) for x in obj]
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    return str(obj)


def _scholar_id_from_serp_author(author: dict[str, Any]) -> str | None:
    """Extract Google Scholar author id from a SerpAPI author object."""
    aid = author.get("author_id")
    if isinstance(aid, str) and aid.strip():
        return aid.strip()

    for key in ("link", "serpapi_link"):
        link = author.get(key)
        if not isinstance(link, str) or not link.strip():
            continue
        query = parse_qs(urlparse(link.strip()).query)
        for param in ("user", "author_id"):
            values = query.get(param)
            if values and values[0]:
                return values[0].strip()
    return None


def _scholarly_details_for_id(author_id: str) -> dict[str, Any]:
    """Mirror previous Flask enrichment flow with scholarly fill()."""
    filled = scholarly.search_author_id(author_id)
    filled = scholarly.fill(filled)
    return {
        "name": filled.get("name"),
        "url_picture": filled.get("url_picture"),
        "interests": filled.get("interests"),
        "citedby": filled.get("citedby"),
        "scholar_id": filled.get("scholar_id"),
        "affiliation": filled.get("affiliation"),
        "hindex": filled.get("hindex"),
    }


def _string_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _pick_best_author(
    professor_name: str, authors: list[dict[str, Any]]
) -> dict[str, Any] | None:
    """Pick best candidate author from SerpAPI profiles."""
    if not authors:
        return None

    best_author = None
    best_score = -1.0
    needle = professor_name.strip().lower()
    for author in authors:
        author_name = str(author.get("name", "")).strip()
        if not author_name:
            continue
        sim = _string_similarity(professor_name, author_name)
        if needle in author_name.lower():
            sim += 0.25
        if sim > best_score:
            best_score = sim
            best_author = author
    return best_author


def _fetch_serp_profiles(professor_name: str, api_key: str) -> list[dict[str, Any]]:
    params = {
        "engine": "google_scholar",
        "q": professor_name,
        "api_key": api_key,
    }
    response = requests.get(SERPAPI_URL, params=params, timeout=60)
    response.raise_for_status()
    payload = response.json() if response.content else {}
    profiles = payload.get("profiles", {})
    authors = profiles.get("authors", [])
    return authors if isinstance(authors, list) else []


def _normalize_research_areas(
    best_author: dict[str, Any] | None,
    scholarly_profile: dict[str, Any] | None,
) -> list[str]:
    if scholarly_profile:
        interests = scholarly_profile.get("interests")
        if isinstance(interests, list):
            return [str(item).strip() for item in interests if str(item).strip()]

    if best_author:
        interests = best_author.get("interests")
        if isinstance(interests, list):
            return [str(item).strip() for item in interests if str(item).strip()]
    return []


def _normalize_recent_papers(
    professor_name: str, best_author: dict[str, Any] | None
) -> list[dict[str, Any]]:
    papers: list[dict[str, Any]] = []
    if best_author:
        for item in best_author.get("articles", []) or []:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title", "")).strip()
            if not title:
                continue
            paper_year = item.get("year")
            year = int(paper_year) if isinstance(paper_year, int) else timezone.now().year
            paper = {
                "title": title,
                "year": year,
                "citations": int(item.get("cited_by", {}).get("value", 0) or 0),
            }
            papers.append(paper)

    if papers:
        return papers[:8]

    # Keep non-empty fallback so fit-score and UI remain usable when providers return sparse data.
    return [
        {
            "title": f"Recent work by {professor_name}",
            "year": timezone.now().year,
            "citations": 0,
        }
    ]


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
    """Research a professor via SerpAPI + scholarly and persist the result."""
    try:
        user = User.objects.filter(pk=user_id).first()
        if user is None:
            logger.warning(
                "research_task_skipped_user_missing",
                user_id=user_id,
                professor_name=professor_name,
            )
            return {"status": "failed", "error": "user_not_found"}

        normalized_name = professor_name.strip()
        serpapi_key = os.getenv("SERPAPI_API_KEY", "").strip()

        authors: list[dict[str, Any]] = []
        scholarly_by_author: list[dict[str, Any]] = []
        provider_error = None
        if not serpapi_key:
            provider_error = "SERPAPI_API_KEY is missing."
            logger.warning(
                "serpapi_key_missing",
                user_id=user_id,
                professor_name=normalized_name,
            )
        else:
            try:
                authors = _fetch_serp_profiles(normalized_name, serpapi_key)
            except Exception as exc:
                provider_error = str(exc)
                logger.warning(
                    "serpapi_request_failed",
                    user_id=user_id,
                    professor_name=normalized_name,
                    error=provider_error,
                )

        for author in authors[:10]:
            if not isinstance(author, dict):
                continue
            scholar_id = _scholar_id_from_serp_author(author)
            if not scholar_id:
                scholarly_by_author.append(
                    {
                        "author_id_used": None,
                        "error": "Could not determine Google Scholar author id.",
                        "scholarly": None,
                    }
                )
                continue
            try:
                scholarly_by_author.append(
                    {
                        "author_id_used": scholar_id,
                        "error": None,
                        "scholarly": _json_safe(_scholarly_details_for_id(scholar_id)),
                    }
                )
            except Exception as exc:
                scholarly_by_author.append(
                    {
                        "author_id_used": scholar_id,
                        "error": str(exc),
                        "scholarly": None,
                    }
                )

        best_author = _pick_best_author(normalized_name, authors)
        scholarly_profile = None
        if best_author:
            best_sid = _scholar_id_from_serp_author(best_author)
            for item in scholarly_by_author:
                if item.get("author_id_used") == best_sid:
                    scholarly_profile = item.get("scholarly")
                    break

        full_name = (
            str(best_author.get("name", "")).strip() if best_author else normalized_name
        ) or normalized_name
        affiliation = str(best_author.get("affiliations", "")).strip() if best_author else ""
        university = affiliation or "Unknown University"
        profile_urls = {}
        if best_author and isinstance(best_author.get("link"), str):
            profile_urls["google_scholar"] = best_author["link"].strip()
        if best_author and isinstance(best_author.get("serpapi_link"), str):
            profile_urls["serpapi"] = best_author["serpapi_link"].strip()
        if (
            scholarly_profile
            and isinstance(scholarly_profile.get("url_picture"), str)
            and scholarly_profile["url_picture"].strip()
        ):
            profile_urls["picture"] = scholarly_profile["url_picture"].strip()

        h_index = (
            int(scholarly_profile.get("hindex"))
            if scholarly_profile and scholarly_profile.get("hindex") is not None
            else None
        )
        total_citations = (
            int(scholarly_profile.get("citedby"))
            if scholarly_profile and scholarly_profile.get("citedby") is not None
            else None
        )
        research_areas = _normalize_research_areas(best_author, scholarly_profile)
        recent_papers = _normalize_recent_papers(normalized_name, best_author)
        profile_data = _json_safe(
            {
                "source": "serpapi+scholarly",
                "query": normalized_name,
                "provider_error": provider_error,
                "authors": authors,
                "scholarly_by_author": scholarly_by_author,
            }
        )

        professor, _created = Professor.objects.update_or_create(
            full_name=full_name,
            university=university,
            defaults={
                "department": "",
                "research_areas": research_areas,
                "h_index": h_index,
                "total_citations": total_citations,
                "recent_papers": recent_papers,
                "profile_urls": profile_urls,
                "email": None,
                "last_scraped": timezone.now(),
                "profile_data": profile_data,
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
