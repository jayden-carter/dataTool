import json
import os
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase Admin SDK using the service account key file
cred = credentials.Certificate('serviceAccountKeyPython.json')
initialize_app(cred)
db = firestore.client()

# Get the JSON file name from command-line arguments (default to 'data.json')
json_file_name = os.sys.argv[1] if len(os.sys.argv) > 1 else 'data.json'
collection_name = os.path.splitext(json_file_name)[0]  # e.g., 'main' for 'main.json'

# Read the JSON file
try:
    with open(json_file_name, 'r') as file:
        raw_data = file.read()
        print(f"Raw content of {json_file_name}:", raw_data[:100] + "..." if len(raw_data) > 100 else raw_data)
        records = json.loads(raw_data)
        print(f"Loaded {len(records)} records from {json_file_name}:", json.dumps(records[:3], indent=2))
except FileNotFoundError:
    print(f"File {json_file_name} not found. Please create or check the file path.")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Invalid JSON in {json_file_name}. Ensure it’s a valid JSON array. Raw content: {raw_data if 'raw_data' in locals() else 'Empty or undefined'}")
    exit(1)
except Exception as e:
    print(f"Error reading or parsing {json_file_name}: {e}")
    exit(1)

# Upload raw data to Firestore
def upload_to_firestore():
    try:
        batch = db.batch()
        collection_ref = db.collection(collection_name)
        for record in records:
            doc_ref = collection_ref.document()  # Autogenerate document ID
            batch.set(doc_ref, record)
        batch.commit()
        print(f"Successfully uploaded {len(records)} records to Firestore collection '{collection_name}'")
    except Exception as e:
        print(f"Error uploading data to Firestore: {e}")
        exit(1)

# Run the upload
if __name__ == "__main__":
    upload_to_firestore()