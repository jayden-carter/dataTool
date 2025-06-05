import { fetchedData } from './script.js';

export function renderScatterPlot(visualizationPlaceholder, filteredData, independentVar, dependentVar) {
  const canvas = document.createElement('canvas');
  visualizationPlaceholder.innerHTML = '';
  visualizationPlaceholder.appendChild(canvas);

  const dataPoints = filteredData.map(item => ({
    x: item[independentVar] || 0,
    y: item[dependentVar] || 0
  }));
  const chartLabel = `${dependentVar.replace(/([A-Z])/g, ' $1').trim()} vs ${independentVar.replace(/([A-Z])/g, ' $1').trim()}`;

  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [{
        label: chartLabel,
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: independentVar.replace(/([A-Z])/g, ' $1').trim() } },
        y: { title: { display: true, text: dependentVar.replace(/([A-Z])/g, ' $1').trim() } }
      }
    }
  });
}