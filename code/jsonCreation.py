import pandas as pd

df = pd.read_csv("/Users/jaydencarter/Desktop/dataTool/data/California_airbnb.csv")  # Read CSV
df.to_json("/Users/jaydencarter/Desktop/dataTool/data/airbnb.json", orient="records", indent=4)  # Convert to JSON

print("CSV successfully converted to JSON!")


