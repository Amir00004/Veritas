
from __future__ import annotations

import json
import os
import re
from typing import Any

import requests
import structlog
from celery import shared_task
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Professor, SerpApiRawResponse
from .serializers import ProfessorSerializer
from .services import calculate_fit_score

logger = structlog.get_logger(__name__)
User = get_user_model()
SERPAPI_URL = "https://serpapi.com/search"
MAX_RETRIES = 3


def _json_safe(obj: Any) -> Any:
    """Convert nested structures into JSON-serializable primitives."""
    if isinstance(obj, dict):
        return {str(k): _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_json_safe(x) for x in obj]
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    return str(obj)


class ProfessorNotFoundError(Exception):
    """Raised when Scholar search returns no matching author rows."""


def _serpapi_key() -> str:
    key = os.getenv("SERPAPI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("SERPAPI_API_KEY is missing.")
    return key


def _request_serpapi(params: dict[str, Any]) -> dict[str, Any]:
    response = requests.get(SERPAPI_URL, params=params, timeout=60)
    response.raise_for_status()
    return response.json() if response.content else {}


def _persist_raw_response(author_id: str, step: str, payload: dict[str, Any]) -> str:
    timestamp = timezone.now().strftime("%Y%m%dT%H%M%S%fZ")
    storage_key = f"research/raw/{author_id}/{timestamp}_{step}.json"
    content = json.dumps(_json_safe(payload), ensure_ascii=True, indent=2)
    default_storage.save(storage_key, ContentFile(content.encode("utf-8")))
    SerpApiRawResponse.objects.create(
        author_id=author_id,
        step=step,
        storage_key=storage_key,
    )
    return storage_key


def _extract_first_author_id(search_payload: dict[str, Any]) -> str:
    profiles = search_payload.get("profiles")
    if not isinstance(profiles, dict):
        raise ProfessorNotFoundError(
            "Professor not found: SerpAPI search response is missing 'profiles'."
        )
    authors = profiles.get("authors")
    if not isinstance(authors, list) or not authors:
        raise ProfessorNotFoundError(
            "Professor not found: SerpAPI returned no author profiles for this name + university."
        )
    first = authors[0]
    if not isinstance(first, dict):
        raise ProfessorNotFoundError("Professor not found: first author profile is malformed.")
    author_id = str(first.get("author_id", "")).strip()
    if not author_id:
        raise ProfessorNotFoundError(
            "Professor not found: first profile does not include an author_id."
        )
    return author_id


def _normalized_email(raw_email: Any) -> str | None:
    value = str(raw_email or "").strip()
    if not value:
        return None
    prefix = "Verified email at "
    if value.lower().startswith(prefix.lower()):
        value = value[len(prefix) :].strip()
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", value)
    return match.group(0) if match else value or None


def _interests_titles(author_payload: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for item in author_payload.get("interests", []) or []:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip()
        if title:
            out.append(title)
    return out


def _extract_metric_row(rows: list[Any], metric_name: str) -> dict[str, int]:
    print(f"[enrich_author_profile_task] cited_table={rows}", flush=True)
    for row in rows:
        print(f"[enrich_author_profile_task] row={row}", flush=True)
        if not isinstance(row, dict):
            continue

        nested = row.get(metric_name)
        if isinstance(nested, dict):
            return {
                "all": int(nested.get("all", 0) or 0),
                "since_2021": int(nested.get("since_2021", 0) or 0),
            }

        # Fallback: older/alternative flat row shape
        row_type = str(row.get("type", row.get("metric", row.get("name", "")))).strip().lower()
        if row_type == metric_name:
            return {
                "all": int(row.get("all", 0) or 0),
                "since_2021": int(row.get("since_2021", 0) or 0),
            }
    return {"all": 0, "since_2021": 0}


def _extract_sorted_articles(author_payload: dict[str, Any]) -> list[dict[str, Any]]:
    articles_out: list[dict[str, Any]] = []
    for article in author_payload.get("articles", []) or []:
        if not isinstance(article, dict):
            continue
        year_raw = article.get("year")
        year = int(year_raw) if isinstance(year_raw, int) else 0
        articles_out.append(
            {
                "title": str(article.get("title", "")).strip(),
                "link": str(article.get("link", "")).strip(),
                "authors": str(article.get("authors", "")).strip(),
                "publication": str(article.get("publication", "")).strip(),
                "year": year if year > 0 else None,
                "citation_count": int(article.get("cited_by", {}).get("value", 0) or 0),
            }
        )
    articles_out.sort(key=lambda item: item.get("year") or 0, reverse=True)
    return articles_out


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


@shared_task(bind=True, name="research.find_author_id_task")
def find_author_id_task(
    self, full_name: str, university_name: str, user_id: int
) -> dict[str, Any]:
    """Step 1: search Scholar by full name + university and extract first author_id."""
    try:
        params = {
            "engine": "google_scholar",
            "q": f"{full_name.strip()} {university_name.strip()}".strip(),
            "api_key": _serpapi_key(),
        }
        payload = _request_serpapi(params)
        author_id = _extract_first_author_id(payload)
        _persist_raw_response(author_id=author_id, step=SerpApiRawResponse.STEP_SEARCH, payload=payload)
        return {
            "user_id": user_id,
            "full_name": full_name.strip(),
            "university_name": university_name.strip(),
            "author_id": author_id,
        }
    except ProfessorNotFoundError:
        raise
    except Exception as exc:
        if self.request.retries >= MAX_RETRIES:
            raise
        raise self.retry(exc=exc, countdown=2 ** (self.request.retries + 1))


@shared_task(bind=True, name="research.enrich_author_profile_task")
def enrich_author_profile_task(self, step1_payload: dict[str, Any]) -> dict[str, Any]:
    """Step 2+3: fetch author profile, transform fields, persist by author_id."""
    try:
        author_id = str(step1_payload.get("author_id", "")).strip()
        if not author_id:
            raise RuntimeError("author_id missing from step 1 result.")
        user_id = int(step1_payload.get("user_id"))
        user = User.objects.filter(pk=user_id).first()
        if user is None:
            return {"status": "failed", "error": "user_not_found"}

        payload = _request_serpapi(
            {
                "engine": "google_scholar_author",
                "author_id": author_id,
                "api_key": _serpapi_key(),
            }
        )
        _persist_raw_response(author_id=author_id, step=SerpApiRawResponse.STEP_AUTHOR, payload=payload)

        author = payload.get("author", {}) if isinstance(payload.get("author"), dict) else {}
        cited_by = payload.get("cited_by", {}) if isinstance(payload.get("cited_by"), dict) else {}
        cited_table = cited_by.get("table", []) if isinstance(cited_by.get("table"), list) else []
        citations = _extract_metric_row(cited_table, "citations")
        h_index = _extract_metric_row(cited_table, "h-index")
        i10_index = _extract_metric_row(cited_table, "i10-index")
        articles = _extract_sorted_articles(payload)

        profile_urls = {}
        for key in ("link", "serpapi_link"):
            val = author.get(key)
            if isinstance(val, str) and val.strip():
                profile_urls["google_scholar" if key == "link" else "serpapi"] = val.strip()

        professor, _created = Professor.objects.update_or_create(
            author_id=author_id,
            defaults={
                "full_name": str(author.get("name", "")).strip() or step1_payload.get("full_name", ""),
                "university": str(author.get("affiliations", "")).strip()
                or step1_payload.get("university_name", "")
                or "Unknown University",
                "department": "",
                "research_areas": _interests_titles(author),
                "h_index": h_index["all"],
                "h_index_since_2021": h_index["since_2021"],
                "i10_index": i10_index["all"],
                "i10_index_since_2021": i10_index["since_2021"],
                "total_citations": citations["all"],
                "citations_since_2021": citations["since_2021"],
                "recent_papers": articles,
                "profile_urls": profile_urls,
                "profile_picture_url": str(author.get("thumbnail", "")).strip(),
                "email": _normalized_email(author.get("email")),
                "last_scraped": timezone.now(),
                "last_enriched_at": timezone.now(),
                "profile_data": _json_safe(
                    {
                        "source": "serpapi_google_scholar_author",
                        "author_raw": author,
                        "cited_by_raw": cited_by,
                    }
                ),
            },
        )
        fit_score_data = calculate_fit_score(user, professor)
        professor.fit_score = fit_score_data["total_score"]
        professor.save(update_fields=["fit_score", "updated_at"])
        return {
            "status": "success",
            "professor_id": professor.pk,
            "author_id": professor.author_id,
            "fit_score": fit_score_data,
            "professor": ProfessorSerializer(professor).data,
        }
    except Exception as exc:
        if self.request.retries >= MAX_RETRIES:
            raise
        raise self.retry(exc=exc, countdown=2 ** (self.request.retries + 1))
