import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm';

// Initialize Firestore
const db = getFirestore();

// Listen for processed data
const processedDataRef = collection(db, 'processedData');
const q = query(processedDataRef, orderBy('processedAt', 'desc'));

onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
        console.log('No processed data found');
        return;
    }

    // Get the most recent processed data
    const latestData = snapshot.docs[0].data();
    if (!latestData.metrics) {
        console.log('No metrics found in the processed data');
        return;
    }

    const metrics = latestData.metrics;
    
    // Update revenue chart
    updateRevenueChart(metrics.monthlyRevenue);
    
    // Update best sellers list
    updateBestSellers(metrics.bestSellers);
    
    // Update worst sellers list
    updateWorstSellers(metrics.worstSellers);
    
    // Update trending items
    updateTrendingItems(metrics.trendingItems);
});

function updateRevenueChart(monthlyRevenue) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    
    const data = sortedMonths.map(month => monthlyRevenue[month]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Revenue Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function updateBestSellers(bestSellers) {
    const container = document.getElementById('bestSellers');
    container.innerHTML = '<h3>Best Selling Items</h3>';
    
    bestSellers.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-stats">
                <span>Quantity: ${item.totalQuantity.toLocaleString()}</span>
                <span>Revenue: $${item.totalRevenue.toLocaleString()}</span>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

function updateWorstSellers(worstSellers) {
    const container = document.getElementById('worstSellers');
    container.innerHTML = '<h3>Worst Selling Items</h3>';
    
    worstSellers.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-stats">
                <span>Quantity: ${item.totalQuantity.toLocaleString()}</span>
                <span>Revenue: $${item.totalRevenue.toLocaleString()}</span>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

function updateTrendingItems(trendingItems) {
    const container = document.getElementById('trendingItems');
    container.innerHTML = '<h3>Trending Items</h3>';
    
    trendingItems.slice(0, 5).forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        const changeClass = item.changePercent >= 0 ? 'positive' : 'negative';
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="trend-stats">
                <span class="change ${changeClass}">
                    ${item.changePercent >= 0 ? '↑' : '↓'} 
                    ${Math.abs(item.changePercent).toFixed(1)}%
                </span>
                <span class="month">${item.month}</span>
            </div>
        `;
        container.appendChild(itemElement);
    });
} 