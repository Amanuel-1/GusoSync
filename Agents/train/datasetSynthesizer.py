import pandas as pd
import numpy as np
import os

# --- Configuration ---
NUM_DATASETS = 200
NUM_SAMPLES = 2000
RANDOM_SEED = 42

output_dir = "synthetic_datasets"
os.makedirs(output_dir, exist_ok=True)

def generate_single_dataset(seed):
    np.random.seed(seed)

    # 1. Queue Length
    queue_length = np.random.poisson(lam=8, size=NUM_SAMPLES) + np.random.randint(0, 5, size=NUM_SAMPLES)
    queue_length = np.clip(queue_length, 0, 70)

    # 2. Traffic Load
    traffic_conditions = [
        np.random.uniform(0.1, 0.4, size=NUM_SAMPLES // 3),
        np.random.uniform(0.35, 0.75, size=NUM_SAMPLES // 3),
        np.random.uniform(0.7, 1.0, size=NUM_SAMPLES - 2 * (NUM_SAMPLES // 3))
    ]
    traffic_load = np.concatenate(traffic_conditions)
    np.random.shuffle(traffic_load)
    traffic_load = np.round(traffic_load, 2)

    # 3. ETA of Existing Buses
    eta_existing_buses = np.random.gamma(shape=2.0, scale=10.0, size=NUM_SAMPLES) + 1
    eta_existing_buses = np.clip(eta_existing_buses, 1, 75).astype(int)

    # 4. Route Distance
    route_distance = np.random.normal(loc=15, scale=8, size=NUM_SAMPLES)
    route_distance = np.clip(route_distance, 2, 50)
    route_distance = np.round(route_distance, 1)

    # 5. Priority Score Calculation
    priority_scores = []
    for i in range(NUM_SAMPLES):
        queue = queue_length[i]
        traffic = traffic_load[i]
        eta = eta_existing_buses[i]
        distance = route_distance[i]
        score = 0

        if queue >= 30:
            score += 40
        elif queue >= 15:
            score += 25
        elif queue >= 5:
            score += 10
        elif queue > 0:
            score += 5

        if eta >= 45:
            score += 35
        elif eta >= 25:
            score += 20
        elif eta >= 10:
            score += 10

        if queue >= 15 and eta >= 25:
            score += 20
        elif queue >= 10 and eta >= 15:
            score += 10

        if traffic >= 0.8 and score > 20:
            score -= 10
        elif traffic >= 0.6 and score > 15:
            score -= 5
        elif traffic <= 0.3:
            score += 10

        if distance >= 35 and score > 20:
            score -= 7
        elif distance <= 5:
            score += 5

        score += np.random.normal(0, 5)
        score = np.clip(score, 0, 100)
        priority_scores.append(int(round(score)))

    df = pd.DataFrame({
        'estimated_queue_length': queue_length,
        'traffic_load': traffic_load,
        'shortest_eta_existing_buses_min': eta_existing_buses,
        'route_distance_km': route_distance,
        'priority_score': priority_scores
    })

    return df

# --- Generate and Save ---
for i in range(NUM_DATASETS):
    df = generate_single_dataset(RANDOM_SEED + i)
    filename = f"{output_dir}/dataset_{i+1:03}.csv"
    df.to_csv(filename, index=False)
    print(f"Saved: {filename}")

print(f"\nAll {NUM_DATASETS} datasets saved to '{output_dir}' folder.")
