from __future__ import annotations

from app.schemas import LoginRequest, LoginResponse, User


def login(payload: LoginRequest) -> LoginResponse:
    # Stub auth: always succeeds for now.
    return LoginResponse(
        ok=True,
        user=User(
            id=f"user:{payload.username}",
            username=payload.username,
        ),
    )
