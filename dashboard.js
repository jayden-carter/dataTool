import { getFirestore, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// Default collection name
const collectionName = 'main';

// Get the user's Employee ID from custom claims
const getUserEmployeeId = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdTokenResult();
  return parseInt(token.claims.store_id); // Ensure it's an integer
};

// Parse date
const parseDate = (dateStr) => dateStr;

// Get week start date (Monday)
const getWeekStart = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
};

// Load records for the user
const loadRecords = async (employeeId) => {
  const recordsQuery = query(collection(db, collectionName), where("Employee ID", "==", employeeId));
  const snapshot = await getDocs(recordsQuery);
  const records = [];
  snapshot.forEach(doc => records.push(doc.data()));
  return records;
};

// Load all records for employee satisfaction
const loadAllRecords = async () => {
  const snapshot = await getDocs(collection(db, collectionName));
  const records = [];
  snapshot.forEach(doc => records.push(doc.data()));
  return records;
};

// Load Overview Data
const loadOverviewData = async (employeeId) => {
  const records = await loadRecords(employeeId);
  const totalRevenue = records.reduce((sum, t) => sum + t.Total, 0);
  const totalSold = records.reduce((sum, t) => sum + t.Quantity, 0);
  const profitMargin = 0.3;
  const current = { revenue: totalRevenue, profit: totalRevenue * profitMargin, time_sold: totalSold };
  const last = { revenue: totalRevenue * 0.9, profit: (totalRevenue * 0.9) * profitMargin, time_sold: Math.floor(totalSold * 0.9) };
  $('#revenue .value').text('$' + current.revenue.toLocaleString());
  $('#revenue .compare').text('Last: $' + last.revenue.toLocaleString());
  $('#profit .value').text('$' + current.profit.toLocaleString());
  $('#profit .compare').text('Last: $' + last.profit.toLocaleString());
  $('#sold .value').text(current.time_sold);
  $('#sold .compare').text('Last: ' + last.time_sold);
  $('#growth .value').text('–'); // Placeholder until weekly data is available
  $('#growth .compare').text('–');
};

// Load Top 5 Selling Items
const loadTopItemsData = async (employeeId) => {
  const recordsQuery = query(collection(db, collectionName), where("Employee ID", "==", employeeId));
  onSnapshot(recordsQuery, (snapshot) => {
    const records = [];
    snapshot.forEach(doc => records.push(doc.data()));
    const itemSales = {};
    records.forEach(t => {
      const name = t.Item;
      const quantity = t.Quantity;
      if (!itemSales[name]) itemSales[name] = { name, count: 0 };
      itemSales[name].count += quantity;
    });
    const res = Object.values(itemSales).sort((a, b) => b.count - a.count).slice(0, 5);
    const container = $('#top-items-container .top-items').empty();
    if (!res.length) { container.append('<p>No data available</p>'); return; }
    const maxCount = res[0].count;
    res.forEach(item => {
      const pct = Math.round((item.count / maxCount) * 100);
      const card = $(`<div class="item-card"><span class="item-name">${item.name}</span><div class="bar-wrapper"><div class="bar" style="width:${pct}%"></div></div><span class="count">${item.count} sold</span></div>`);
      container.append(card);
    });
  });
};

// Load Weekly Revenue Data
const loadWeeklyRevenueData = async (employeeId) => {
  const recordsQuery = query(collection(db, collectionName), where("Employee ID", "==", employeeId));
  onSnapshot(recordsQuery, (snapshot) => {
    const records = [];
    snapshot.forEach(doc => records.push(doc.data()));
    const revenueByWeek = {};
    records.forEach(t => {
      const weekStart = getWeekStart(t.Date);
      const revenue = t.Total;
      revenueByWeek[weekStart] = (revenueByWeek[weekStart] || 0) + revenue;
    });
    const res = Object.entries(revenueByWeek)
      .map(([week, revenue]) => ({ week, revenue }))
      .filter(r => r.week >= '2024-04-01')
      .sort((a, b) => a.week.localeCompare(b.week));
    
    const changes = [];
    for (let i = 1; i < res.length; i++) {
      const prev = res[i - 1].revenue;
      const curr = res[i].revenue;
      const change = prev !== 0 ? ((curr - prev) / prev * 100).toFixed(1) : 'N/A';
      changes.push({ week: res[i].week, change });
    }

    const labels = res.map(r => r.week);
    const data = res.map(r => r.revenue);
    const ctx = document.getElementById('weeklyRevenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Weekly Revenue', data, backgroundColor: 'rgba(128,0,128,0.6)', borderRadius: 5 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } }, x: { title: { display: true, text: 'Week Starting' } } } }
    });

    const changeContainer = $('#week-change-container').empty();
    changes.forEach(c => {
      const changeText = c.change === 'N/A' ? 'N/A' : `${c.change}%`;
      const color = c.change === 'N/A' ? '#777' : (c.change >= 0 ? 'green' : 'red');
      changeContainer.append($('<div>').text(`Week ${c.week}: ${changeText}`).css('color', color));
    });

    // Update week-to-week change in overview
    if (changes.length > 0) {
      const latestChange = changes[changes.length - 1].change;
      $('#growth .value').text(latestChange === 'N/A' ? 'N/A' : `${latestChange}%`);
      $('#growth .compare').text(changes.length > 1 ? `${changes[changes.length - 2].change}%` : 'N/A');
    }
  });
};

// Load Top Employees by Satisfaction
const loadTopEmployeesBySatisfaction = async () => {
  const records = await loadAllRecords();
  const satisfactionByEmployee = {};
  records.forEach(t => {
    const empId = t["Employee ID"];
    if (!satisfactionByEmployee[empId]) satisfactionByEmployee[empId] = { total: 0, count: 0 };
    satisfactionByEmployee[empId].total += t["Customer Satisfaction"];
    satisfactionByEmployee[empId].count += 1;
  });
  const res = Object.entries(satisfactionByEmployee)
    .map(([empId, data]) => ({ empId: parseInt(empId), avgSatisfaction: data.total / data.count }))
    .sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)
    .slice(0, 5);
  const container = $('#top-employees-container').empty();
  res.forEach(emp => {
    container.append($('<div>').text(`Employee ${emp.empId}: ${emp.avgSatisfaction.toFixed(1)}/5`));
  });
};

// Load data and handle loading state
$(document).ready(async () => {
  $('#loading').hide();
  $('#content').show();
  try {
    const employeeId = await getUserEmployeeId();
    loadOverviewData(employeeId);
    loadTopItemsData(employeeId);
    loadWeeklyRevenueData(employeeId);
    loadTopEmployeesBySatisfaction();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    $('#loading').text('Error loading data. Check console.');
  }
});

// Logout functionality
$('#logout').on('click', () => firebase.auth().signOut());