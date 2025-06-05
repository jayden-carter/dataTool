import { fetchedData } from './script.js';

export function renderBoxPlot(visualizationPlaceholder, filteredData, variable) {
  const canvas = document.createElement('canvas');
  visualizationPlaceholder.innerHTML = '';
  visualizationPlaceholder.appendChild(canvas);

  const values = filteredData.map(item => item[variable]).filter(val => val != null);

  new Chart(canvas, {
    type: 'boxplot',
    data: {
      labels: [variable.replace(/([A-Z])/g, ' $1').trim()],
      datasets: [{
        label: `Box Plot of ${variable.replace(/([A-Z])/g, ' $1').trim()}`,
        data: [values],
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