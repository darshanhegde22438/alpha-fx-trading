# test_model.py

import pandas as pd
import joblib

# Load saved model + scaler
model = joblib.load("svm_forex_model.pkl")
scaler = joblib.load("scaler.pkl")

print("✅ Forex SVM Model Loaded")

# Ask user input
user_input = input("Enter forex data (Format: PAIR,Open,High,Low,Close):\n> ")

# Example: USD-AED,81.26395,81.30842,81.31689,81.06408
parts = user_input.split(",")

if len(parts) != 5:
    print("❌ Invalid format! Use: PAIR,Open,High,Low,Close")
    exit()

pair = parts[0]
open_price = float(parts[1])
high = float(parts[2])
low = float(parts[3])
close = float(parts[4])

# --- Feature Engineering (SMA3, SMA5, SMA15) ---
# For demo, we simulate SMA values from OHLC (in real case, calculate from historical data)
SMA3 = (open_price + high + low) / 3
SMA5 = (open_price + high + low + close) / 4
SMA15 = (open_price + high + low + close) / 4  # placeholder, same as SMA5

features = pd.DataFrame([{"SMA3": SMA3, "SMA5": SMA5, "SMA15": SMA15}])

# Scale features
features_scaled = scaler.transform(features)

# Predict next rate
predicted_rate = model.predict(features_scaled)[0]

# Trading signal
signal = "BUY ✅" if predicted_rate > close else "SELL ❌"

# --- Print results ---
print("\n📊 Forex Prediction Result")
# print("----------------------------")
# print(f"Currency Pair : {pair}")
# print(f"Open          : {open_price}")
# print(f"High          : {high}")
# print(f"Low           : {low}")
# print(f"Close         : {close}")
# print(f"Predicted Rate: {predicted_rate:.5f}")
print(f"Signal        : {signal}")
