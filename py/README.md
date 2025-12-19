# Python Backend (FastAPI)

## Setup

```bash
cd py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
cd py
source .venv/bin/activate
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000
- Docs (Swagger): http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health
