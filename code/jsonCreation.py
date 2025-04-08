import pandas as pd

df = pd.read_csv("/Users/jaydencarter/Desktop/dataTool/data/shopping.csv")  # Read CSV
df.to_json("/Users/jaydencarter/Desktop/dataTool/data/shopping.json", orient="records", indent=4)  # Convert to JSON

print("CSV successfully converted to JSON!")


