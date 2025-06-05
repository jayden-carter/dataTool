import json
import os
import sys  # Correct import for command-line arguments
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase Admin SDK using the service account key file
print("Initializing Firebase with serviceAccountKeyPython.json...")
try:
    cred = credentials.Certificate('serviceAccountKeyPython.json')
    initialize_app(cred, {'projectId': 'synq-data'})
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    exit(1)

# Get the JSON file name from command-line arguments (default to 'data.json')
json_file_name = sys.argv[1] if len(sys.argv) > 1 else 'data.json'
collection_name = os.path.splitext(json_file_name)[0]  # e.g., 'coffee' for 'coffee.json'
print(f"Processing file: {json_file_name}, collection: {collection_name}")

# Read the JSON file
try:
    with open(json_file_name, 'r') as file:
        raw_data = file.read()
        print(f"Raw content of {json_file_name} (first 100 chars): {raw_data[:100]}...")
        records = json.loads(raw_data)
        print(f"Loaded {len(records)} records: {json.dumps(records[:3], indent=2)}")
except FileNotFoundError:
    print(f"Error: File {json_file_name} not found. Check the path: {os.getcwd()}")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON in {json_file_name}. Details: {e}. Raw content: {raw_data if 'raw_data' in locals() else 'Empty'}")
    exit(1)
except Exception as e:
    print(f"Error reading or parsing {json_file_name}: {e}")
    exit(1)

# Upload raw data to Firestore
def upload_to_firestore():
    try:
        print(f"Starting batch upload of {len(records)} records to {collection_name}...")
        batch = db.batch()
        collection_ref = db.collection(collection_name)
        count = 0

        for i, record in enumerate(records):
            doc_ref = collection_ref.document()  # Autogenerate document ID
            batch.set(doc_ref, record)
            count += 1

            # Commit batch every 500 operations to avoid Firestore limit
            if count % 500 == 0:
                batch.commit()
                print(f"Committed {count} records to Firestore...")
                batch = db.batch()  # Reset batch

        # Commit any remaining records
        if count % 500 != 0:
            batch.commit()
            print(f"Committed remaining {count % 500} records to Firestore...")

        print(f"Successfully uploaded {count} records to Firestore collection '{collection_name}'")
    except Exception as e:
        print(f"Error uploading data to Firestore: {e}")
        exit(1)
    finally:
        # Clean up Firebase app
        try:
            firebase_admin.delete_app(firebase_admin.get_app())
            print("Firebase app cleaned up.")
        except Exception as e:
            print(f"Error cleaning up Firebase app: {e}")

# Run the upload
if __name__ == "__main__":
    upload_to_firestore()