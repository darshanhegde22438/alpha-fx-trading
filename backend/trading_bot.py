import os
import random
import pandas as pd
from datetime import datetime

def run_random_trading(
    data_dir,
    NOTIONAL=1_000_000,
    PROFIT_TARGET=10_000_000,
    STOP_LOSS=-1_000_000,
    LOG_FILE="trading_log.txt",
    RESULTS_FILE="trading_simulation_results.csv"
):
    data_path = os.path.join(data_dir, "forex_data.csv")
    df = pd.read_csv(data_path)

    balance = NOTIONAL
    positions = []
    trades = []

    log_file = os.path.join(data_dir, LOG_FILE)
    results_file = os.path.join(data_dir, RESULTS_FILE)

    with open(log_file, "w") as log:
        log.write(f"Random Trading Simulation Started at {datetime.now()}\n")
        log.write(f"Initial Balance: {balance}\n")

    for i in range(len(df)):
        price = df["price"].iloc[i]
        timestamp = df["timestamp"].iloc[i] if "timestamp" in df.columns else str(i)

        # Randomly decide buy, sell, or hold
        action = random.choice(["buy", "sell", "hold"])

        if action == "buy":
            positions.append(price)
        elif action == "sell" and positions:
            entry_price = positions.pop(0)
            profit = (price - entry_price) * 1000  # scale P&L
            balance += profit
            trades.append({
                "timestamp": timestamp,
                "entry": entry_price,
                "exit": price,
                "profit": profit,
                "balance": balance
            })

            with open(log_file, "a") as log:
                log.write(f"{timestamp} - Trade closed. P&L: {profit}, Balance: {balance}\n")

            if balance >= PROFIT_TARGET or balance <= STOP_LOSS:
                with open(log_file, "a") as log:
                    log.write("Simulation stopped: target/stop-loss reached\n")
                break

    pd.DataFrame(trades).to_csv(results_file, index=False)
    return trades

if __name__ == "__main__":
    DATA_DIR = os.path.join(os.path.dirname(__file__), "models")
    run_random_trading(DATA_DIR)
