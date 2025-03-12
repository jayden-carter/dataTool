import pandas as pd

df = pd.read_csv("../data/shopping.csv")  # Read CSV
df.to_json("../data/shopping.json", orient="records", indent=4)  # Convert to JSON

print("CSV successfully converted to JSON!")
