from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import shap
import lime
from lime.lime_tabular import LimeTabularExplainer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
import json
import pickle
import logging
from datetime import datetime
import os
from monitoring import monitor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bell24H Explainable AI Service",
    description="SHAP/LIME explanations for RFQ-Supplier matching",
    version="1.0.0"
)

# CORS middleware for integration with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class RFQData(BaseModel):
    rfq_id: str
    title: str
    description: str
    category: str
    budget_min: float
    budget_max: float
    quantity: int
    urgency: str
    location: str
    specifications: List[str]

class SupplierData(BaseModel):
    supplier_id: str
    name: str
    category_expertise: List[str]
    rating: float
    location: str
    price_range: str
    delivery_capability: str
    certifications: List[str]
    past_performance: float

class ExplainMatchingRequest(BaseModel):
    rfq: RFQData
    suppliers: List[SupplierData]
    explanation_type: str = "both"  # "shap", "lime", or "both"

class ExplanationResponse(BaseModel):
    rfq_id: str
    explanations: List[Dict[str, Any]]
    model_confidence: float
    processing_time: float
    timestamp: str

# Global variables for models
matching_model = None
scaler = None
feature_names = []
shap_explainer = None
lime_explainer = None

class RFQSupplierMatcher:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.category_encoder = LabelEncoder()
        self.urgency_encoder = LabelEncoder()
        self.location_encoder = LabelEncoder()
        
    def create_features(self, rfq: RFQData, supplier: SupplierData) -> np.ndarray:
        """Create feature vector for RFQ-Supplier pair"""
        features = []
        
        # Budget compatibility (0-1 score)
        supplier_price_avg = self._parse_price_range(supplier.price_range)
        rfq_budget_avg = (rfq.budget_min + rfq.budget_max) / 2
        budget_compatibility = 1 - abs(supplier_price_avg - rfq_budget_avg) / max(supplier_price_avg, rfq_budget_avg)
        features.append(max(0, min(1, budget_compatibility)))
        
        # Category expertise match (0-1 score)
        category_match = 1.0 if rfq.category in supplier.category_expertise else 0.0
        features.append(category_match)
        
        # Supplier rating (normalized)
        features.append(supplier.rating / 5.0)
        
        # Location proximity (simplified - same location = 1, different = 0.5)
        location_score = 1.0 if rfq.location == supplier.location else 0.5
        features.append(location_score)
        
        # Quantity capability (simplified scoring)
        quantity_score = min(1.0, rfq.quantity / 1000)  # Normalize by 1000 units
        features.append(quantity_score)
        
        # Urgency vs delivery capability
        urgency_score = {"high": 1.0, "medium": 0.7, "low": 0.3}.get(rfq.urgency.lower(), 0.5)
        delivery_score = {"fast": 1.0, "medium": 0.7, "slow": 0.3}.get(supplier.delivery_capability.lower(), 0.5)
        urgency_match = 1 - abs(urgency_score - delivery_score)
        features.append(urgency_match)
        
        # Past performance
        features.append(supplier.past_performance / 100.0)
        
        # Certification relevance (simplified)
        cert_relevance = len(supplier.certifications) / 10.0  # Normalize by max 10 certs
        features.append(min(1.0, cert_relevance))
        
        return np.array(features)
    
    def _parse_price_range(self, price_range: str) -> float:
        """Parse price range string and return average"""
        # Simplified price parsing - in real implementation, this would be more sophisticated
        if "low" in price_range.lower():
            return 50000
        elif "medium" in price_range.lower():
            return 250000
        elif "high" in price_range.lower():
            return 1000000
        else:
            return 250000
    
    def train_model(self, training_data: List[Dict]):
        """Train the matching model (in real implementation, this would use historical data)"""
        # For demo purposes, create a simple model
        self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        
        # Create dummy training data if none provided
        if not training_data:
            X, y = self._generate_dummy_training_data()
        else:
            X, y = self._process_training_data(training_data)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Store feature names
        global feature_names
        feature_names = [
            "budget_compatibility", "category_match", "supplier_rating",
            "location_proximity", "quantity_capability", "urgency_match",
            "past_performance", "certification_relevance"
        ]
        
        return self.model
    
    def _generate_dummy_training_data(self):
        """Generate dummy training data for demonstration"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate random features
        X = np.random.random((n_samples, 8))
        
        # Generate target (matching score) based on feature importance
        weights = np.array([0.25, 0.30, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05])
        y = np.dot(X, weights) + np.random.normal(0, 0.1, n_samples)
        y = np.clip(y, 0, 1)  # Ensure scores are between 0 and 1
        
        return X, y
    
    def predict_match_score(self, rfq: RFQData, supplier: SupplierData) -> float:
        """Predict matching score for RFQ-Supplier pair"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        features = self.create_features(rfq, supplier)
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        score = self.model.predict(features_scaled)[0]
        return max(0, min(1, score))

# Initialize the matcher
matcher = RFQSupplierMatcher()

@app.on_event("startup")
async def startup_event():
    """Initialize models and explainers on startup"""
    global matching_model, shap_explainer, lime_explainer
    
    logger.info("Initializing AI models and explainers...")
    
    # Train the matching model
    matching_model = matcher.train_model([])
    
    # Initialize SHAP explainer
    # Generate background data for SHAP
    np.random.seed(42)
    background_data = np.random.random((100, 8))
    background_data_scaled = matcher.scaler.transform(background_data)
    shap_explainer = shap.Explainer(matching_model, background_data_scaled)
    
    # Initialize LIME explainer
    lime_explainer = LimeTabularExplainer(
        background_data_scaled,
        feature_names=feature_names,
        class_names=['match_score'],
        mode='regression'
    )
    
    logger.info("AI models and explainers initialized successfully")

@app.post("/explain-matching", response_model=ExplanationResponse)
async def explain_matching(request: ExplainMatchingRequest):
    start_time = datetime.now()
    
    try:
        explanations = []
        
        for supplier in request.suppliers:
            # Calculate matching score
            match_score = matcher.predict_match_score(request.rfq, supplier)
            
            # Get features for this RFQ-Supplier pair
            features = matcher.create_features(request.rfq, supplier)
            features_scaled = matcher.scaler.transform(features.reshape(1, -1))
            
            supplier_explanation = {
                "supplier_id": supplier.supplier_id,
                "supplier_name": supplier.name,
                "match_score": float(match_score),
                "explanations": {}
            }
            
            # Generate SHAP explanation
            if request.explanation_type in ["shap", "both"]:
                shap_values = shap_explainer(features_scaled)
                shap_explanation = {
                    "method": "SHAP",
                    "feature_importance": {},
                    "base_value": float(shap_values.base_values[0]),
                    "prediction": float(match_score)
                }
                
                for i, feature_name in enumerate(feature_names):
                    shap_explanation["feature_importance"][feature_name] = {
                        "value": float(features[i]),
                        "importance": float(shap_values.values[0][i]),
                        "description": get_feature_description(feature_name, features[i])
                    }
                
                supplier_explanation["explanations"]["shap"] = shap_explanation
            
            # Generate LIME explanation
            if request.explanation_type in ["lime", "both"]:
                def predict_fn(X):
                    return matcher.model.predict(X)
                
                lime_exp = lime_explainer.explain_instance(
                    features_scaled[0], 
                    predict_fn, 
                    num_features=len(feature_names)
                )
                
                lime_explanation = {
                    "method": "LIME",
                    "feature_importance": {},
                    "local_prediction": float(match_score),
                    "score": lime_exp.score
                }
                
                for feature_name, importance in lime_exp.as_list():
                    lime_explanation["feature_importance"][feature_name] = {
                        "importance": importance,
                        "description": get_feature_description(feature_name, 0)  # LIME doesn't provide feature values
                    }
                
                supplier_explanation["explanations"]["lime"] = lime_explanation
            
            explanations.append(supplier_explanation)
        
        # Sort suppliers by match score
        explanations.sort(key=lambda x: x["match_score"], reverse=True)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Log successful request
        monitor.log_request(processing_time, request.explanation_type)
        
        return ExplanationResponse(
            rfq_id=request.rfq.rfq_id,
            explanations=explanations,
            model_confidence=0.85,  # This would be calculated based on model uncertainty
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        # Log error
        monitor.log_error(str(e))
        logger.error(f"Error in explain_matching: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")

def get_feature_description(feature_name: str, value: float) -> str:
    """Get human-readable description for feature importance"""
    descriptions = {
        "budget_compatibility": f"Budget alignment score: {value:.2f} (1.0 = perfect match)",
        "category_match": f"Category expertise: {value:.2f} (1.0 = exact match)",
        "supplier_rating": f"Supplier rating: {value:.2f} (normalized 0-1)",
        "location_proximity": f"Location match: {value:.2f} (1.0 = same location)",
        "quantity_capability": f"Quantity handling: {value:.2f} (normalized by volume)",
        "urgency_match": f"Delivery urgency alignment: {value:.2f}",
        "past_performance": f"Historical performance: {value:.2f}",
        "certification_relevance": f"Relevant certifications: {value:.2f}"
    }
    return descriptions.get(feature_name, f"{feature_name}: {value:.2f}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": matching_model is not None,
        "explainers_ready": shap_explainer is not None and lime_explainer is not None
    }

@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model"""
    if matching_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": "GradientBoostingRegressor",
        "feature_names": feature_names,
        "n_features": len(feature_names),
        "explainers": ["SHAP", "LIME"],
        "last_trained": datetime.now().isoformat()  # In real implementation, track actual training time
    }

@app.get("/metrics")
async def get_metrics():
    """Get service performance metrics"""
    return monitor.get_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 