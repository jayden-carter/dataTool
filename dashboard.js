import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const db = getFirestore();

// Load Overview Data
const loadOverviewData = async () => {
  const currentDocRef = doc(db, "overview", "current");
  const lastDocRef = doc(db, "overview", "last");
  const currentSnap = await getDoc(currentDocRef);
  const lastSnap = await getDoc(lastDocRef);
  if (currentSnap.exists() && lastSnap.exists()) {
    const current = currentSnap.data();
    const last = lastSnap.data();
    $('#revenue .value').text('$' + current.revenue.toLocaleString());
    $('#revenue .compare').text('Last: $' + last.revenue.toLocaleString());
    $('#profit .value').text('$' + current.profit.toLocaleString());
    $('#profit .compare').text('Last: $' + last.profit.toLocaleString());
    $('#sold .value').text(current.time_sold);
    $('#sold .compare').text('Last: ' + last.time_sold);
    $('#growth .value').text(current.growth.toFixed(1) + '%');
    $('#growth .compare').text('Last: ' + last.growth.toFixed(1) + '%');
  } else {
    console.error("Overview data not found");
  }
};

// Load Attendance Data
const loadAttendanceData = async () => {
  const attendanceColRef = collection(db, "attendance");
  const snapshot = await getDocs(attendanceColRef);
  const data = {};
  snapshot.forEach(doc => { data[doc.id] = doc.data().hours; });
  const days = Object.keys(data).sort();
  let maxCount = 0;
  days.forEach(d => Object.values(data[d]).forEach(c => { if (c > maxCount) maxCount = c; }));
  const chart = $('#attendance-chart').empty();
  chart.append($('<div>').addClass('cell'));
  for (let h = 0; h < 24; h++) {
    chart.append($('<div>').addClass('cell hour-label').text(h));
  }
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach(date => {
    const wd = new Date(date).getDay();
    chart.append($('<div>').addClass('cell day-label').text(weekday[wd]));
    for (let h = 0; h < 24; h++) {
      const cnt = data[date][h] || 0;
      const shade = Math.round(240 - (cnt / maxCount) * 200);
      const color = `rgb(${shade},${shade},${shade})`;
      chart.append($('<div>').addClass('cell heat-cell').css('background', color).attr('title', `${date} @ ${h}:00 → ${cnt}`));
    }
  });
};

// Load Revenue Data
const loadRevenueData = () => {
  const revenueColRef = collection(db, "revenue");
  onSnapshot(revenueColRef, (snapshot) => {
    const res = [];
    snapshot.forEach(doc => res.push(doc.data()));
    const labels = res.map(r => r.date);
    const data = res.map(r => r.revenue);
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Revenue', data, backgroundColor: 'rgba(128,0,128,0.6)', borderRadius: 5 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } }, x: { title: { display: true, text: 'Date' } } } }
    });
  });
};

// Load Top Items Data
const loadTopItemsData = () => {
  const topItemsColRef = collection(db, "top_items");
  onSnapshot(topItemsColRef, (snapshot) => {
    const res = [];
    snapshot.forEach(doc => res.push(doc.data()));
    res.sort((a, b) => b.count - a.count);
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

// Load data after DOM is ready
$(document).ready(() => {
  loadOverviewData();
  loadAttendanceData();
  loadRevenueData();
  loadTopItemsData();
});