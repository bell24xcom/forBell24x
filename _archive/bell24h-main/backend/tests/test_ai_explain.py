# === PERMANENT FIX: Add backend root to Python path ===
import sys
import os

# Add the backend/ directory to sys.path so `from app.services...` works
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Now safe to import
from app.services.ai_services import ai_service
import joblib
import numpy as np
import pytest

# Auto-train model if missing
model_path = os.path.join(backend_root, "app", "models", "rfq_model.pkl")
if not os.path.exists(model_path):
    print("No model found. Auto-training sample model...")
    os.system(f"py {os.path.join(backend_root, 'scripts', 'train_sample_rfq_model.py')}")

# === ACTUAL TESTS ===
def test_explain_with_model_loaded(tmp_path):
    # Arrange: Train a tiny model and save it
    from sklearn.ensemble import RandomForestRegressor
    X = np.random.rand(100, 5)
    y = np.random.rand(100)
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    model_path = os.path.join(backend_root, "app", "models", "rfq_model.pkl")
    joblib.dump(model, model_path)
    
    # Act
    result = ai_service.explain_supplier_match({
        "price": 100.0,
        "lead_time": 5,
        "supplier_rating": 4.5,
        "distance_km": 120,
        "past_on_time_rate": 0.95
    })
    
    # Assert
    assert "feature_importance" in result
    assert len(result["feature_importance"]) == 5
    assert result["model_used"] is True
    assert isinstance(result["shap_values"], list)
    os.unlink(model_path)  # cleanup

def test_explain_model_missing_fallback():
    # Arrange: Ensure no model exists
    model_path = os.path.join(backend_root, "app", "models", "rfq_model.pkl")
    if os.path.exists(model_path):
        os.rename(model_path, model_path + ".bak")
    
    # Act
    result = ai_service.explain_supplier_match({
        "price": 100.0,
        "lead_time": 5,
        "supplier_rating": 4.5,
        "distance_km": 120,
        "past_on_time_rate": 0.95
    })
    
    # Assert fallback works
    assert "feature_importance" in result
    assert result["model_used"] is False
    assert all(v == 0.2 for v in result["feature_importance"].values())
    
    # Restore if backup exists
    if os.path.exists(model_path + ".bak"):
        os.rename(model_path + ".bak", model_path)
