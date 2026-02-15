"""
Admin API for A/B Testing Dashboard
"""
from fastapi import APIRouter
from app.monitoring.conversion_dashboard import router as conversion_router

router = APIRouter()
router.include_router(conversion_router)

