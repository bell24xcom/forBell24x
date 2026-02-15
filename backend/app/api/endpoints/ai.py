from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from app.services.ai_services import ai_service
from typing import Dict, Any
import numpy as np

router = APIRouter()

# Default features for demo
SUPPLIER_FEATURE_SAMPLE = {
    "price": 70000,
    "lead_time": 12,
    "supplier_rating": 4.5,
    "rfq_length": 100,
    "buyer_tier": 2,
    "quantity": 300,
    "urgency_score": 0.8,
    "region": 1,
    "past_success_rate": 0.95,
    "negotiations_count": 3,
    "previous_orders": 28,
    "multimodal_rfq": 1,
    "transcript_length": 325,
    "industry_type": 1,
    "quoted_suppliers": 9,
}

@router.post("/explain-match/{rfq_id}")
async def explain_match(rfq_id: int, features: Dict[str, Any] = Body(None)):
    """
    Generate SHAP explanations for RFQ match.
    Accepts features in request body or uses defaults.
    """
    # Use provided features or defaults
    input_features = features if features else SUPPLIER_FEATURE_SAMPLE
    
    # Generate SHAP explanations with visualizations
    result = ai_service.explain_rfq(input_features)
    
    if not result or not result.get("feature_importance"):
        raise HTTPException(status_code=500, detail="SHAP explanation failed")
    
    return JSONResponse(content=result)
