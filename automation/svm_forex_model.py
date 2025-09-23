# svm_forex_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

# 1. Load dataset
data = pd.read_csv("forex_data.csv")

print("Columns in dataset:", data.columns.tolist())
print(data.head())

# 2. Define features and target
X = data[["SMA3", "SMA5", "SMA15"]]   # predictors
y = data["Rate"]                      # target (what we want to predict)

# 3. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. Train SVM regression model
model = SVR(kernel="rbf", C=100, gamma=0.1, epsilon=0.1)
model.fit(X_train_scaled, y_train)

# 6. Predictions
y_pred = model.predict(X_test_scaled)

# 7. Evaluation
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n✅ Model trained successfully!")
print("🔹 Mean Squared Error (MSE):", mse)
print("🔹 Mean Absolute Error (MAE):", mae)
print("🔹 R² Score:", r2)

# 8. Save model + scaler
joblib.dump(model, "svm_forex_model.pkl")
joblib.dump(scaler, "scaler.pkl")
print("\n💾 Model and scaler saved!")
