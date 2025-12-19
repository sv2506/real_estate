from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="real_estate-api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login")
def login(payload: LoginRequest) -> dict:
    # Stub auth: always succeeds for now.
    return {
        "ok": True,
        "user": {
            "id": f"user:{payload.username}",
            "username": payload.username,
        },
    }
