from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import base64
import hashlib

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


Confidence = Literal["high", "medium", "low"]


class BriefKV(BaseModel):
    label: str
    value: str
    confidence: Confidence


class BriefMoneyLine(BaseModel):
    label: str
    monthly: int


class BriefAssumptions(BaseModel):
    down_payment_percent: float
    interest_rate_percent: float
    loan_term_years: int


class BriefConflict(BaseModel):
    field: str
    values: list[str]
    note: str


class BriefSource(BaseModel):
    name: str
    last_updated: str
    reliability: Confidence


class PropertyBrief(BaseModel):
    property_id: str
    title: str
    summary: str
    quick_facts: list[BriefKV]
    estimated_monthly_costs: list[BriefMoneyLine]
    assumptions: BriefAssumptions
    highlights: list[str]
    watchouts: list[str]
    conflicts: list[BriefConflict]
    sources: list[BriefSource]


def _mock_image_data_uri(title: str, subtitle: str, seed: str) -> str:
        # Inline SVG placeholder (no external dependencies / no copyrighted photos).
        h = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        # Derive two accent-ish colors from the hash.
        c1 = f"#{h[0:6]}"
        c2 = f"#{h[6:12]}"

        svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'>
    <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='{c1}' stop-opacity='0.55'/>
            <stop offset='60%' stop-color='{c2}' stop-opacity='0.35'/>
            <stop offset='100%' stop-color='#000' stop-opacity='0.35'/>
        </linearGradient>
        <filter id='soft' x='-20%' y='-20%' width='140%' height='140%'>
            <feGaussianBlur stdDeviation='18'/>
        </filter>
    </defs>
    <rect width='1200' height='675' fill='#111'/>
    <rect width='1200' height='675' fill='url(#g)'/>
    <circle cx='980' cy='120' r='220' fill='{c1}' opacity='0.20' filter='url(#soft)'/>
    <circle cx='220' cy='560' r='260' fill='{c2}' opacity='0.16' filter='url(#soft)'/>
    <g font-family='system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' fill='white'>
        <text x='70' y='360' font-size='54' font-weight='700' opacity='0.95'>{title}</text>
        <text x='70' y='410' font-size='28' font-weight='500' opacity='0.82'>{subtitle}</text>
        <text x='70' y='460' font-size='18' font-weight='500' opacity='0.65'>Mock image • replace with real listing photos later</text>
    </g>
</svg>"""

        encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"


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
            image_url=_mock_image_data_uri(
                title="123 Maple St",
                subtitle="San Jose, CA",
                seed="prop_1001",
            ),
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
            image_url=_mock_image_data_uri(
                title="78 Oak Ave",
                subtitle="Santa Clara, CA",
                seed="prop_1002",
            ),
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
            image_url=_mock_image_data_uri(
                title="455 Cedar Ct",
                subtitle="Campbell, CA",
                seed="prop_1003",
            ),
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
            image_url=_mock_image_data_uri(
                title="9 Ridgeview Dr",
                subtitle="Los Gatos, CA",
                seed="prop_1004",
            ),
        ),
    ]


@app.get("/properties/{property_id}", response_model=PropertySummary)
def get_property(property_id: str) -> PropertySummary:
    for prop in list_properties():
        if prop.id == property_id:
            return prop

    raise HTTPException(status_code=404, detail="Property not found")


def _estimate_monthly_costs(price: int) -> tuple[list[BriefMoneyLine], BriefAssumptions]:
    # Simple, explainable mock estimate for MVP UI only.
    assumptions = BriefAssumptions(
        down_payment_percent=20.0,
        interest_rate_percent=6.75,
        loan_term_years=30,
    )

    loan_amount = int(price * (1.0 - assumptions.down_payment_percent / 100.0))
    r = (assumptions.interest_rate_percent / 100.0) / 12.0
    n = assumptions.loan_term_years * 12
    if r <= 0:
        mortgage = loan_amount // n
    else:
        mortgage = int(loan_amount * (r * (1 + r) ** n) / ((1 + r) ** n - 1))

    taxes = int(price * 0.012 / 12)  # ~1.2% annual
    insurance = 175
    hoa = 0
    utilities = 250
    return (
        [
            BriefMoneyLine(label="Mortgage (P&I)", monthly=mortgage),
            BriefMoneyLine(label="Property taxes", monthly=taxes),
            BriefMoneyLine(label="Home insurance", monthly=insurance),
            BriefMoneyLine(label="HOA", monthly=hoa),
            BriefMoneyLine(label="Utilities (est.)", monthly=utilities),
        ],
        assumptions,
    )


@app.get("/properties/{property_id}/brief", response_model=PropertyBrief)
def get_property_brief(property_id: str) -> PropertyBrief:
    prop = get_property(property_id)
    monthly_costs, assumptions = _estimate_monthly_costs(prop.price)

    conflicts: list[BriefConflict] = []
    # Add a lightweight example conflict for UX demonstration.
    if prop.sqft >= 1600:
        conflicts.append(
            BriefConflict(
                field="Living area",
                values=[f"{prop.sqft} sqft (listing)", f"{max(0, prop.sqft - 80)} sqft (public record)",],
                note="Records disagree; verify with disclosures, appraisal, or a measurement report.",
            )
        )

    highlights = [
        f"Great layout: {prop.beds} bed / {prop.baths} bath",
        "Strong natural light (per listing)",
        "Convenient access to groceries and parks (verify location fit)",
    ]

    watchouts = [
        "Ask for the seller disclosure package early",
        "Confirm roof age, HVAC age, and any major repairs",
        "Check insurance availability/costs (wildfire/flood considerations vary by area)",
    ]

    quick_facts = [
        BriefKV(label="Price", value=f"${prop.price:,}", confidence="high"),
        BriefKV(label="Beds / Baths", value=f"{prop.beds} / {prop.baths}", confidence="high"),
        BriefKV(label="Living area", value=f"{prop.sqft:,} sqft", confidence="medium" if conflicts else "high"),
        BriefKV(label="Home type", value="Single-family (mock)", confidence="low"),
        BriefKV(label="HOA", value="No HOA (mock)", confidence="low"),
    ]

    sources = [
        BriefSource(name="Listing (mock feed)", last_updated="2025-12-19", reliability="medium"),
        BriefSource(name="County record (mock)", last_updated="2025-12-01", reliability="high"),
        BriefSource(name="User notes", last_updated="2025-12-19", reliability="low"),
    ]

    return PropertyBrief(
        property_id=prop.id,
        title=f"Property Brief: {prop.address}, {prop.city}",
        summary=(
            "A home-buyer focused snapshot of the property, key costs, and questions to ask "
            "before you make an offer."
        ),
        quick_facts=quick_facts,
        estimated_monthly_costs=monthly_costs,
        assumptions=assumptions,
        highlights=highlights,
        watchouts=watchouts,
        conflicts=conflicts,
        sources=sources,
    )
