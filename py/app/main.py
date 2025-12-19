from fastapi import FastAPI
from fastapi import HTTPException
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
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class PropertySummary(BaseModel):
    id: str
    price: int
    beds: int
    baths: float
    sqft: int
    address: str
    city: str
    state: str
    zip: str
    image_url: str | None = None


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


@app.get("/properties", response_model=list[PropertySummary])
def list_properties() -> list[PropertySummary]:
    # Mock data for now.
    return [
        PropertySummary(
            id="prop_1001",
            price=895000,
            beds=3,
            baths=2.0,
            sqft=1680,
            address="123 Maple St",
            city="San Jose",
            state="CA",
            zip="95112",
            image_url=None,
        ),
        PropertySummary(
            id="prop_1002",
            price=1249000,
            beds=4,
            baths=3.0,
            sqft=2450,
            address="78 Oak Ave",
            city="Santa Clara",
            state="CA",
            zip="95050",
            image_url=None,
        ),
        PropertySummary(
            id="prop_1003",
            price=699000,
            beds=2,
            baths=1.0,
            sqft=980,
            address="455 Cedar Ct",
            city="Campbell",
            state="CA",
            zip="95008",
            image_url=None,
        ),
        PropertySummary(
            id="prop_1004",
            price=1545000,
            beds=4,
            baths=2.5,
            sqft=3010,
            address="9 Ridgeview Dr",
            city="Los Gatos",
            state="CA",
            zip="95032",
            image_url=None,
        ),
    ]


@app.get("/properties/{property_id}", response_model=PropertySummary)
def get_property(property_id: str) -> PropertySummary:
    for prop in list_properties():
        if prop.id == property_id:
            return prop

    raise HTTPException(status_code=404, detail="Property not found")
