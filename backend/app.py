from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKeyPython.json')
initialize_app(cred, {'projectId': 'synq-data'})
db = firestore.client()
collection_name = 'main'

# Root route for testing
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask backend is running. Use /api/* endpoints.'}), 200

def parse_date(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d')

def get_week_start(date_str):
    date = parse_date(date_str)
    day = date.weekday()
    diff = (day - 0) % 7
    date -= timedelta(days=diff)
    return date.strftime('%Y-%m-%d')

def fetch_records(employee_id):
    try:
        print(f"Fetching records for Employee ID: {employee_id}")
        # Fetch all documents and filter in-memory
        all_docs = db.collection(collection_name).stream()
        records = [doc.to_dict() for doc in all_docs if doc.to_dict().get('Employee ID') == int(employee_id)]
        print(f"Records found (filtered in-memory): {records}")
        
        if not records:
            print("No records found for this Employee ID.")
        
        return records
    except Exception as e:
        print(f"Error fetching records: {str(e)}")
        raise e

def fetch_all_records():
    try:
        records = [doc.to_dict() for doc in db.collection(collection_name).stream()]
        print(f"All records fetched: {len(records)} documents")
        return records
    except Exception as e:
        print(f"Error fetching all records: {str(e)}")
        raise e

@app.route('/api/overview/<employee_id>', methods=['GET'])
def get_overview(employee_id):
    try:
        records = fetch_records(employee_id)
        if not records:
            return jsonify({'message': 'No records found for this Employee ID'}), 404
        
        total_revenue = sum(r['Total'] for r in records)
        total_sold = sum(r['Quantity'] for r in records)
        profit_margin = 0.3
        return jsonify({
            'total_revenue': total_revenue,
            'profit': total_revenue * profit_margin,
            'items_sold': total_sold,
            'last_revenue': total_revenue * 0.9,
            'last_profit': (total_revenue * 0.9) * profit_margin,
            'last_sold': int(total_sold * 0.9)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-items/<employee_id>', methods=['GET'])
def get_top_items(employee_id):
    try:
        records = fetch_records(employee_id)
        if not records:
            return jsonify({'message': 'No records found for this Employee ID'}), 404
        
        item_sales = {}
        for r in records:
            name = r['Item']
            quantity = r['Quantity']
            if name not in item_sales:
                item_sales[name] = {'name': name, 'count': 0}
            item_sales[name]['count'] += quantity
        top_items = sorted(item_sales.values(), key=lambda x: x['count'], reverse=True)[:5]
        max_count = top_items[0]['count'] if top_items else 1
        for item in top_items:
            item['percentage'] = round((item['count'] / max_count) * 100)
        return jsonify(top_items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weekly-revenue/<employee_id>', methods=['GET'])
def get_weekly_revenue(employee_id):
    try:
        records = fetch_records(employee_id)
        if not records:
            return jsonify({'message': 'No records found for this Employee ID'}), 404

        revenue_by_week = {}
        for r in records:
            week_start = get_week_start(r['Date'])
            revenue = r['Total']
            revenue_by_week[week_start] = revenue_by_week.get(week_start, 0) + revenue

        weeks = sorted([w for w in revenue_by_week.keys() if w >= '2024-04-01'])
        weekly_data = [{'week': w, 'revenue': revenue_by_week[w]} for w in weeks]

        changes = []
        for i in range(1, len(weekly_data)):
            prev = weekly_data[i-1]['revenue']
            curr = weekly_data[i]['revenue']
            change = 'N/A' if prev == 0 else round((curr - prev) / prev * 100, 1)
            changes.append({'week': weekly_data[i]['week'], 'change': change})

        return jsonify({
            'weekly_revenue': weekly_data,
            'week_changes': changes
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-employees', methods=['GET'])
def get_top_employees():
    try:
        records = fetch_all_records()
        if not records:
            return jsonify({'message': 'No records found in the database'}), 404

        satisfaction_by_employee = {}
        for r in records:
            emp_id = r['Employee ID']
            if emp_id not in satisfaction_by_employee:
                satisfaction_by_employee[emp_id] = {'total': 0, 'count': 0}
            satisfaction_by_employee[emp_id]['total'] += r['Customer Satisfaction']
            satisfaction_by_employee[emp_id]['count'] += 1

        top_employees = [
            {'empId': int(emp_id), 'avgSatisfaction': data['total'] / data['count']}
            for emp_id, data in satisfaction_by_employee.items()
        ]
        top_employees = sorted(top_employees, key=lambda x: x['avgSatisfaction'], reverse=True)[:5]
        return jsonify(top_employees)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)