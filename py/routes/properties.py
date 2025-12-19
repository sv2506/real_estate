from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import PropertyBrief, PropertySummary
from app.services.properties_service import (
    get_property as get_property_service,
    get_property_brief as get_property_brief_service,
    list_properties as list_properties_service,
)

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[PropertySummary])
def list_properties() -> list[PropertySummary]:
    return list_properties_service()


@router.get("/{property_id}", response_model=PropertySummary)
def get_property(property_id: str) -> PropertySummary:
    prop = get_property_service(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.get("/{property_id}/brief", response_model=PropertyBrief)
def get_property_brief(property_id: str) -> PropertyBrief:
    brief = get_property_brief_service(property_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Property not found")
    return brief
