import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Initialize Auth (already initialized in authCheck.js, but included for consistency)
const auth = getAuth();

// Ensure this runs only after authentication (assumed content is injected)
$(document).ready(function() {
  $.ajax({
    url: 'data.php',
    method: 'GET',
    dataType: 'json'
  }).done(function(res) {
    $('#revenue .value').text('$' + res.current.revenue.toLocaleString());
    $('#revenue .compare').text('Last: $' + res.last.revenue.toLocaleString());
    $('#profit .value').text('$' + res.current.profit.toLocaleString());
    $('#profit .compare').text('Last: $' + res.last.profit.toLocaleString());
    $('#sold .value').text(res.current.time_sold);
    $('#sold .compare').text('Last: ' + res.last.time_sold);
    $('#growth .value').text(res.current.growth.toFixed(1) + '%');
    $('#growth .compare').text('Last: ' + res.last.growth.toFixed(1) + '%');
  }).fail(function(err) {
    console.error('Data load failed', err);
  });

  $.getJSON('attendance.php', function(res) {
    const data = res.data;
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
        const cnt = data[date][h];
        const shade = Math.round(240 - (cnt / maxCount) * 200);
        const color = `rgb(${shade},${shade},${shade})`;
        chart.append($('<div>').addClass('cell heat-cell').css('background', color).attr('title', `${date} @ ${h}:00 → ${cnt}`));
      }
    });
  });

  $.getJSON('revenue.php', function(res) {
    const labels = res.map(r => r.date);
    const data = res.map(r => r.revenue);
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Revenue', data, backgroundColor: 'rgba(128,0,128,0.6)', borderRadius: 5 }] },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } }, x: { title: { display: true, text: 'Date' } } }
      }
    });
  });

  $.getJSON('top_items.php', function(res) {
    const container = $('#top-items-container .top-items').empty();
    if (!res.length) {
      container.append('<p>No data available</p>');
      return;
    }
    const maxCount = res[0].count;
    res.forEach(item => {
      const pct = Math.round((item.count / maxCount) * 100);
      const card = $(`
        <div class="item-card">
          <span class="item-name">${item.name}</span>
          <div class="bar-wrapper">
            <div class="bar" style="width:${pct}%"></div>
          </div>
          <span class="count">${item.count} sold</span>
        </div>
      `);
      container.append(card);
    });
  });
});