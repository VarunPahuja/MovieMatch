import csv
import json
import os

csv_path = 'popular_movies.csv'
json_path = '../src/data/popular_movies.json'

# Read CSV and convert to list of dicts
data = []
with open(csv_path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append(row)

# Ensure output directory exists
os.makedirs(os.path.dirname(json_path), exist_ok=True)

# Write JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Converted {csv_path} to {json_path} with {len(data)} records.")
