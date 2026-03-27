import logging
import joblib
import shap
import numpy as np
import os
import base64
import io
from typing import List, Dict, Any, Optional
from matplotlib import pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

class AIService:
    """AIService loads, caches, and explains RFQ model predictions with SHAP visualizations."""
    def __init__(self, model_path=None):
        # Try multiple possible paths for the model
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            possible_paths = [
                os.path.join(base_dir, "app", "models", "rfq_model.pkl"),
                os.path.join(base_dir, "models", "rfq_model.pkl"),
                "./app/models/rfq_model.pkl",
                "app/models/rfq_model.pkl"
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    model_path = path
                    break
            else:
                model_path = possible_paths[0]  # Use first as default
        
        self.model = None
        self.features = []
        self.explainer = None
        self.model_path = model_path
        self.model_used = False
        self._init_model()
    
    def _init_model(self):
        if os.path.exists(self.model_path):
            try:
                model_data = joblib.load(self.model_path)
                self.model = model_data['model'] if isinstance(model_data, dict) and 'model' in model_data else model_data
                self.features = model_data.get('features') if isinstance(model_data, dict) else []
                if self.model and len(self.features) > 0:
                    self.explainer = shap.TreeExplainer(self.model)
                    self.model_used = True
                    logging.info(f"✅ Model loaded successfully from {self.model_path} with {len(self.features)} features")
                else:
                    logging.warning(f"[AI] Model or features missing in {self.model_path}")
            except Exception as e:
                logging.error(f"[AI] Failed to load model/explainer from {self.model_path}: {e}")
                self.model = None
                self.explainer = None
        else:
            logging.warning(f"[AI] Model file not found at {self.model_path}. Run: python scripts/train_sample_rfq_model.py")
    
    def predict(self, features: Dict[str, float]) -> float:
        """Predicts the deal value given feature inputs."""
        if self.model and set(self.features) <= set(features.keys()):
            X = np.array([[features.get(f, 0) for f in self.features]])
            return float(self.model.predict(X)[0])
        else:
            logging.warning("Using fallback value for prediction.")
            return 50000.0  # fallback for CI

    def explain_rfq(self, numerical_features: dict) -> Dict[str, Any]:
        """Returns SHAP explanations with visualizations."""
        result = {
            "feature_importance": {},
            "model_used": self.model_used,
            "shap_plots": {}
        }
        
        if self.explainer and self.model and self.features:
            try:
                X = np.array([[numerical_features.get(f, 0) for f in self.features]])
                shap_values = self.explainer.shap_values(X)[0]
                
                # Create feature importance dict
                for f, val in zip(self.features, shap_values):
                    result["feature_importance"][f] = float(val)
                
                # Generate SHAP force plot HTML (simplified version)
                try:
                    base_value = float(self.explainer.expected_value) if hasattr(self.explainer, 'expected_value') else 0.0
                    # Create a simple HTML representation of the force plot
                    force_html = f"""
                    <div style="padding: 20px; background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); border-radius: 8px; color: white;">
                        <h3 style="margin: 0 0 10px 0;">SHAP Force Plot</h3>
                        <p style="margin: 0;">Base Value: {base_value:.2f}</p>
                        <div style="margin-top: 15px;">
                            <p><strong>Top Positive Features:</strong></p>
                            <ul style="list-style: none; padding: 0;">
                                {''.join([f'<li style="padding: 5px;">{f}: +{float(v):.3f}</li>' for f, v in sorted(zip(self.features, shap_values), key=lambda x: x[1], reverse=True)[:5] if v > 0])}
                            </ul>
                            <p><strong>Top Negative Features:</strong></p>
                            <ul style="list-style: none; padding: 0;">
                                {''.join([f'<li style="padding: 5px;">{f}: {float(v):.3f}</li>' for f, v in sorted(zip(self.features, shap_values), key=lambda x: x[1])[:5] if v < 0])}
                            </ul>
                        </div>
                    </div>
                    """
                    result["shap_plots"]["force"] = force_html
                except Exception as e:
                    logging.warning(f"Could not generate force plot: {e}")
                    result["shap_plots"]["force"] = '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;"><p>Force plot unavailable</p></div>'
                
                # Generate waterfall plot
                try:
                    plt.figure(figsize=(10, 6))
                    shap.waterfall_plot(
                        shap.Explanation(
                            values=shap_values,
                            base_values=self.explainer.expected_value if hasattr(self.explainer, 'expected_value') else 0,
                            data=X[0],
                            feature_names=self.features
                        ),
                        show=False
                    )
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
                    buf.seek(0)
                    result["shap_plots"]["waterfall"] = f"data:image/png;base64,{base64.b64encode(buf.read()).decode()}"
                    plt.close()
                except Exception as e:
                    logging.warning(f"Could not generate waterfall plot: {e}")
                    result["shap_plots"]["waterfall"] = None
                    
            except Exception as e:
                logging.error(f"[AI] SHAP explain error: {e}")
                # Fallback
                fallback_features = list(numerical_features.keys())[:10]
                n = len(fallback_features) if fallback_features else 1
                for f in fallback_features:
                    result["feature_importance"][f] = round(1/n, 3)
        else:
            # Fallback: equal contributions
            fallback_features = list(numerical_features.keys())[:10]
            n = len(fallback_features) if fallback_features else 1
            for f in fallback_features:
                result["feature_importance"][f] = round(1/n, 3)
        
        return result

ai_service = AIService()
