import pandas as pd

df = pd.read_csv("/Users/jaydencarter/Desktop/dataTool/data/ufc-master.csv")  # Read CSV
df.to_json("/Users/jaydencarter/Desktop/dataTool/data/ufc.json", orient="records", indent=4)  # Convert to JSON

print("CSV successfully converted to JSON!")


