"""
Real-time Conversion Dashboard for A/B Tests
Uses Prisma via REST API (no Supabase needed)
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import Dict, List
import requests
import os

router = APIRouter(prefix="/api/admin/ab-test", tags=["A/B Testing"])

# API base URL (Next.js API routes that use Prisma)
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", os.getenv("API_URL", "http://localhost:3000"))

@router.get("/stats")
async def get_ab_test_stats(hours: int = 24):
    """Get A/B test statistics for last N hours via API"""
    try:
        # Forward to Next.js API that uses Prisma
        response = requests.get(
            f"{API_BASE_URL}/api/admin/ab-test/stats",
            params={"hours": hours},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph")
async def get_conversion_graph(hours: int = 24, interval_minutes: int = 60):
    """Get time-series conversion graph data via API"""
    try:
        # Forward to Next.js API that uses Prisma
        response = requests.get(
            f"{API_BASE_URL}/api/admin/ab-test/graph",
            params={"hours": hours, "interval_minutes": interval_minutes},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
