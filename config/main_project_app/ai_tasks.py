"""
AI uchun asinxron task queue (xotirada saqlanadigan).

Sekin AI chaqiruvlar (top-5 nomzod/vakansiya) HTTP so'rovini bloklab
qo'ymasligi uchun ThreadPoolExecutor orqali fon rejimida bajariladi.

Foydalanuvchi:
1. POST/GET ...?async=true   → {"task_id": "..."}
2. GET /api/ai/tasks/{id}/   → {"status": "pending|done|error", "result": ...}

Cheklovlar:
- Tasklar xotirada saqlanadi → server qayta ishga tushsa yo'qoladi
- Bitta server uchun mos (multi-instance deploy uchun Celery + Redis kerak)
- Tasklar 10 daqiqada avtomatik o'chiriladi
"""
from __future__ import annotations

import logging
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)

# 8 ta parallel AI chaqiruv (Gemini bepul tier limitidan oshmasligi uchun)
_executor = ThreadPoolExecutor(max_workers=8, thread_name_prefix="ai-task-")

# Tasklar holati
_tasks: dict[str, dict[str, Any]] = {}
_lock = threading.Lock()

# Task qancha vaqt xotirada saqlanadi (foydalanuvchi olib ulgurmasa, o'chiriladi)
TASK_TTL_SECONDS = 600  # 10 daqiqa


def submit(
    fn: Callable[..., Any],
    *args,
    owner_id: Optional[int] = None,
    **kwargs,
) -> str:
    """
    Funksiyani fon rejimida ishga tushiradi va task_id qaytaradi.

    owner_id — foydalanuvchi ID si (boshqa user task'ini ko'rishni cheklash uchun).
    """
    task_id = uuid.uuid4().hex[:16]

    def _wrapper() -> None:
        started = time.time()
        try:
            result = fn(*args, **kwargs)
            with _lock:
                _tasks[task_id] = {
                    "status": "done",
                    "result": result,
                    "owner_id": owner_id,
                    "created_at": started,
                    "finished_at": time.time(),
                }
            logger.info("AI task done: %s (%.2fs)", task_id, time.time() - started)
        except Exception as e:
            with _lock:
                _tasks[task_id] = {
                    "status": "error",
                    "error": str(e),
                    "owner_id": owner_id,
                    "created_at": started,
                    "finished_at": time.time(),
                }
            logger.error("AI task failed: %s — %s", task_id, e)

    # Boshlang'ich holatni yozish
    with _lock:
        _tasks[task_id] = {
            "status": "pending",
            "owner_id": owner_id,
            "created_at": time.time(),
        }

    _executor.submit(_wrapper)
    _cleanup_expired()
    return task_id


def get(task_id: str, owner_id: Optional[int] = None) -> Optional[dict[str, Any]]:
    """
    Task holatini olish. owner_id berilsa, faqat o'sha foydalanuvchining task'i
    qaytariladi (boshqa userlar task'ini ko'ra olmaydi).
    """
    _cleanup_expired()
    with _lock:
        task = _tasks.get(task_id)
        if not task:
            return None
        if owner_id is not None and task.get("owner_id") not in (None, owner_id):
            # Boshqa foydalanuvchining task'i — ko'rsatmaymiz
            return None
        # Owner_id'ni javobdan olib tashlaymiz (foydalanuvchiga kerak emas)
        return {k: v for k, v in task.items() if k != "owner_id"}


def _cleanup_expired() -> None:
    """Eskirgan task'larni xotiradan tozalash."""
    now = time.time()
    with _lock:
        expired = [
            k for k, v in _tasks.items()
            if now - v.get("created_at", now) > TASK_TTL_SECONDS
        ]
        for k in expired:
            del _tasks[k]
    if expired:
        logger.debug("Cleaned %d expired AI tasks", len(expired))


def task_count() -> dict[str, int]:
    """Diagnostika uchun — task'lar statistikasi."""
    _cleanup_expired()
    with _lock:
        counts = {"pending": 0, "done": 0, "error": 0}
        for t in _tasks.values():
            counts[t["status"]] = counts.get(t["status"], 0) + 1
        counts["total"] = len(_tasks)
        return counts
