from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.properties import router as properties_router
from routes.root import router as root_router


def create_app() -> FastAPI:
    app = FastAPI(title="real_estate-api")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(root_router)
    app.include_router(auth_router)
    app.include_router(properties_router)
    return app


app = create_app()
