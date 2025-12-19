from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["meta"])


@router.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome"}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
