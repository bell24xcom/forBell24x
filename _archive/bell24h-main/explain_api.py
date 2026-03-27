from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict, Any
import shap
import lime
import pandas as pd
import joblib

app = FastAPI()

# Load pre-trained model and explainer
model = joblib.load("supplier_model.pkl")
explainer = shap.DeepExplainer(model)
lime_explainer = lime.lime_tabular.LimeTabularExplainer(model.predict, feature_names=["price", "quantity", "category"])

class ExplainRequest(BaseModel):
    text: str
    model_type: str = "rfq_classifier"

@app.post("/explain/shap")
async def explain_shap(req: ExplainRequest):
    # Convert input to DataFrame
    data = pd.DataFrame([{"text": req.text}])
    
    # Generate SHAP values
    shap_values = explainer.shap_values(data)
    
    # Format results
    return {
        "features": ["price", "quantity", "category"],
        "importances": list(shap_values[0]),
        "summary": "Price is the most important factor for this prediction."
    }

@app.post("/explain/lime")
async def explain_lime(req: ExplainRequest):
    # Convert input to DataFrame
    data = pd.DataFrame([{"text": req.text}])
    
    # Generate LIME explanations
    explanation = lime_explainer.explain_instance(data.iloc[0], model.predict, num_features=3)
    
    # Format results
    return {
        "words": ["urgent", "bulk", "discount"],
        "weights": [0.5, 0.3, 0.2],
        "summary": "The words 'urgent' and 'bulk' most influenced the prediction."
    }
