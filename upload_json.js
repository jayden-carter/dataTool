const fs = require('fs');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Read the JSON file
let transactions;
try {
  const rawData = fs.readFileSync('data.json');
  transactions = JSON.parse(rawData);
  console.log('Loaded transactions:', JSON.stringify(transactions.slice(0, 3), null, 2)); // Log first 3 for brevity
} catch (error) {
  console.error('Error reading or parsing data.json:', error);
  process.exit(1);
}

// Function to parse MM/DD/YY to YYYY-MM-DD
const parseDate = (dateStr) => {
  const [month, day, year] = dateStr.split('/');
  const fullYear = `20${year}`; // Assume 20XX for two-digit years (e.g., 23 -> 2023)
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Process and upload data to Firestore
const uploadToFirestore = async () => {
  try {
    // Calculate Overview Data
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.transaction_qty * t.unit_price), 0);
    const totalSold = transactions.reduce((sum, t) => sum + t.transaction_qty, 0);
    const profitMargin = 0.3;
    const current = {
      revenue: totalRevenue,
      profit: totalRevenue * profitMargin,
      time_sold: totalSold,
      growth: 0 // No prior data for growth, set to 0
    };
    const last = {
      revenue: totalRevenue * 0.9, // Mock 10% less for last period
      profit: (totalRevenue * 0.9) * profitMargin,
      time_sold: Math.floor(totalSold * 0.9),
      growth: 0
    };
    await db.collection('overview').doc('current').set(current);
    await db.collection('overview').doc('last').set(last);
    console.log('Overview data uploaded');

    // Calculate Attendance Data
    const attendance = {};
    transactions.forEach(t => {
      const date = parseDate(t.transaction_date);
      const hour = parseInt(t.transaction_time.split(':')[0]);
      if (!attendance[date]) attendance[date] = {};
      attendance[date][hour] = (attendance[date][hour] || 0) + 1;
    });
    for (const [date, hours] of Object.entries(attendance)) {
      // Ensure all hours (0-23) are present
      for (let h = 0; h < 24; h++) {
        hours[h] = hours[h] || 0;
      }
      await db.collection('attendance').doc(date).set({ hours });
    }
    console.log('Attendance data uploaded with', Object.keys(attendance).length, 'days');

    // Calculate Revenue Data
    const revenueByDate = {};
    transactions.forEach(t => {
      const date = parseDate(t.transaction_date);
      const revenue = t.transaction_qty * t.unit_price;
      revenueByDate[date] = (revenueByDate[date] || 0) + revenue;
    });
    for (const [date, revenue] of Object.entries(revenueByDate)) {
      await db.collection('revenue').doc(date).set({ date, revenue });
    }
    console.log('Revenue data uploaded with', Object.keys(revenueByDate).length, 'days');

    // Calculate Top Items Data
    const itemSales = {};
    transactions.forEach(t => {
      const name = t.product_detail;
      const quantity = t.transaction_qty;
      if (!itemSales[name]) itemSales[name] = { name, count: 0 };
      itemSales[name].count += quantity;
    });
    const topItems = Object.values(itemSales).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 items
    for (const item of topItems) {
      await db.collection('top_items').doc(item.name).set(item);
    }
    console.log('Top Items data uploaded with', topItems.length, 'items');

    console.log('All data uploaded to Firestore successfully');
  } catch (error) {
    console.error('Error uploading data to Firestore:', error);
  }
};

// Run the upload
uploadToFirestore();