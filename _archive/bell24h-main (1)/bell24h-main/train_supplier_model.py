import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# Generate dummy data for supplier RFQ classification
# Features: price, quantity, category (encoded as int)
data = pd.DataFrame({
    'price': [10, 20, 15, 40, 25, 30, 12, 18, 22, 35],
    'quantity': [100, 200, 150, 400, 250, 300, 120, 180, 220, 350],
    'category': ['A', 'B', 'A', 'B', 'C', 'A', 'C', 'B', 'C', 'A'],
    'label': [0, 1, 0, 1, 2, 0, 2, 1, 2, 0]
})

# Encode category
le = LabelEncoder()
data['category_encoded'] = le.fit_transform(data['category'])

X = data[['price', 'quantity', 'category_encoded']]
y = data['label']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'supplier_model.pkl')

print('Trained and saved supplier_model.pkl')
