from __future__ import annotations

from fastapi import APIRouter

from app.schemas import LoginRequest, LoginResponse
from app.services.auth_service import login as login_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    return login_service(payload)
