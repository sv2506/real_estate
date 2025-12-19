from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class User(BaseModel):
    id: str
    username: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    ok: bool
    user: User | None = None


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
    why: list[str] = []
    context: str | None = None


class BriefMoneyLine(BaseModel):
    label: str
    monthly: int


class BriefMoneyRangeLine(BaseModel):
    label: str
    low: int
    high: int


class BriefRange(BaseModel):
    low: int
    high: int


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


class BriefVerifyItem(BaseModel):
    item: str
    why: str


class PropertyBrief(BaseModel):
    property_id: str
    title: str
    summary: str
    what_this_means: str

    overall_confidence: Confidence
    overall_confidence_why: str

    quick_facts: list[BriefKV]

    estimated_monthly_total_range: BriefRange
    estimated_monthly_fixed: list[BriefMoneyLine]
    estimated_monthly_variable: list[BriefMoneyRangeLine]
    estimated_monthly_costs: list[BriefMoneyLine]
    assumptions: BriefAssumptions
    highlights: list[str]

    risks: list[str]
    watchouts: list[BriefVerifyItem]
    conflicts: list[BriefConflict]
    sources: list[BriefSource]
