import { fetchedData } from './script.js';

export function renderHistogram(visualizationPlaceholder, filteredData, independentVar) {
  const canvas = document.createElement('canvas');
  visualizationPlaceholder.innerHTML = '';
  visualizationPlaceholder.appendChild(canvas);

  const values = filteredData.map(item => item[independentVar]).filter(val => val != null);
  const binSize = (Math.max(...values) - Math.min(...values)) / 10;
  const bins = Array(10).fill(0);
  values.forEach(val => {
    const binIndex = Math.min(Math.floor((val - Math.min(...values)) / binSize), 9);
    bins[binIndex]++;
  });
  const labels = Array.from({ length: 10 }, (_, i) => {
    const start = Math.min(...values) + i * binSize;
    return `${start.toFixed(1)} - ${(start + binSize).toFixed(1)}`;
  });
  const dataValues = bins;
  const chartLabel = `Histogram of ${independentVar.replace(/([A-Z])/g, ' $1').trim()}`;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}