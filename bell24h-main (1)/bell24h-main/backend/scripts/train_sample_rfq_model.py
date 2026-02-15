"""
train_sample_rfq_model.py
--------------------------
Generates synthetic RFQ dataset (10-15 features), trains RandomForestRegressor, and saves model to ../app/models/rfq_model.pkl
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

NUM_SAMPLES = 1000
np.random.seed(42)

def generate_synthetic_rfq_data(n=NUM_SAMPLES):
    data = pd.DataFrame({
        'price': np.random.uniform(1000, 100000, n),
        'lead_time': np.random.randint(1, 30, n),
        'supplier_rating': np.random.uniform(2.5, 5.0, n),
        'rfq_length': np.random.randint(15, 250, n),
        'buyer_tier': np.random.choice([1, 2, 3], n),
        'quantity': np.random.randint(1, 5000, n),
        'urgency_score': np.random.uniform(0, 1, n),
        'region': np.random.choice([0, 1, 2], n),
        'past_success_rate': np.random.uniform(0.3, 1.0, n),
        'negotiations_count': np.random.randint(0, 15, n),
        'previous_orders': np.random.randint(0, 100, n),
        'multimodal_rfq': np.random.choice([0,1], n),
        'transcript_length': np.random.randint(70, 600, n),
        'industry_type': np.random.choice([0,1,2,3], n),
        'quoted_suppliers': np.random.randint(1, 25, n),
    })
    # Target: simulated expected deal value (nonlinear)
    data['deal_value'] = (
        data['price'] * np.clip(data['supplier_rating'] / 5.0, 0.5, 1.2) *
        np.clip(data['past_success_rate'] + 0.1 * data['buyer_tier'], 0.4, 1.4) *
        (1 - data['urgency_score'] * 0.1) *
        (1 + 0.01 * data['negotiations_count'])
    )
    return data

def main():
    data = generate_synthetic_rfq_data()
    feature_cols = data.columns[:-1]
    X = data[feature_cols].values
    y = data['deal_value']
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    output_dir = os.path.join(os.path.dirname(__file__), '../app/models')
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'rfq_model.pkl')
    joblib.dump({'model': model, 'features': feature_cols.tolist()}, model_path)
    print(f'Trained RFQ model saved to: {model_path}')

if __name__ == '__main__':
    main()
