"""Quick test script to verify AI service works"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.services.ai_services import ai_service

# Test with sample features
test_features = {
    "price": 125000,
    "lead_time": 7,
    "supplier_rating": 4.8,
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

print("Testing AI Service...")
print(f"Model used: {ai_service.model_used}")
print(f"Features: {len(ai_service.features)}")

result = ai_service.explain_rfq(test_features)
print(f"\nResult keys: {result.keys()}")
print(f"Feature importance count: {len(result.get('feature_importance', {}))}")
print(f"Has SHAP plots: {bool(result.get('shap_plots'))}")
print("\n✅ AI Service test complete!")

