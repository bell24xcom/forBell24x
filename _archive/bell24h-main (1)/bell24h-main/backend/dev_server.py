from fastapi import FastAPI, Body
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict, Any, Optional
import json
import os

# Import the ai endpoints router
try:
    from app.api.endpoints import ai as ai_endpoints
except Exception:
    ai_endpoints = None

# Lightweight local explainer for dev: reads backend/data/suppliers.json and returns
# a simplified explanations list matching the demo page and Cypress expectations.
def _local_explain_from_json(supplier_id: int):
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'suppliers.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            suppliers = json.load(f)
    except Exception:
        # Default mock if file is missing
        suppliers = []

    supplier = next((s for s in suppliers if int(s.get('id', -1)) == int(supplier_id)), None)
    if supplier is None:
        # If not found, return deterministic default explanations
        vals = [0.25, 0.25, 0.25, 0.25]
    else:
        # Map the first four features to friendly names
        vals = [
            float(supplier.get('feature_0', 0.25)),
            float(supplier.get('feature_1', 0.25)),
            float(supplier.get('feature_2', 0.25)),
            float(supplier.get('feature_3', 0.25)),
        ]

    feature_names = ['price', 'delivery', 'quality', 'compliance']
    explanations = [
        { 'feature': name, 'importance': float(val), 'contribution': 'positive' if val >= 0 else 'negative' }
        for name, val in zip(feature_names, vals)
    ]
    return explanations

app = FastAPI(title="Bell24h Dev Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend assets from the repo `public/` directory so the demo is same-origin
public_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'public'))
if os.path.isdir(public_dir):
    app.mount('/public', StaticFiles(directory=public_dir), name='public')

@app.get("/api/health")
async def health():
    import os
    environment = os.getenv("ENVIRONMENT", "dev")
    return {
        "status": "healthy",
        "version": environment,
        "service": "bell24h-backend",
        "model_loaded": hasattr(app, 'model_loaded') and app.model_loaded
    }

if ai_endpoints and hasattr(ai_endpoints, 'router'):
    app.include_router(ai_endpoints.router, prefix="/api/v1/ai")

# Include admin routes
try:
    from app.api.admin import ab_test, tasks
    app.include_router(ab_test.router)
    app.include_router(tasks.router)
except Exception as e:
    print(f"Warning: Could not load admin routes: {e}")


@app.post('/api/v1/ai/explain-match/{supplier_id}')
async def explain_match_demo(supplier_id: int, features: Optional[Dict[str, Any]] = Body(None)):
    """Enhanced explain endpoint that uses real AI service with SHAP visualizations.
    
    This endpoint uses the real AI service if available, otherwise falls back to lightweight demo.
    Accepts features in request body for real-time SHAP explanations.
    """
    # Try to use real AI service first
    try:
        from app.services.ai_services import ai_service
        
        # Use provided features or defaults
        if features is None:
            features = {
                "price": 125000,
                "lead_time": 7,
                "supplier_rating": 4.8,
                "distance_km": 89,
                "past_on_time_rate": 0.97,
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
        
        # Generate SHAP explanations with visualizations
        result = ai_service.explain_rfq(features)
        return result
    except Exception as e:
        # Fallback to lightweight demo if AI service fails
        try:
            explanations = _local_explain_from_json(supplier_id)
            return {"explanations": explanations, "model_used": False}
        except Exception as e2:
            return {"success": False, "error": str(e2), "model_used": False}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)
