from fastapi import FastAPI

app = FastAPI(title="real_estate-api")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
