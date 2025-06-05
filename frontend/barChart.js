import { fetchedData } from './script.js';

export function renderBarChart(visualizationPlaceholder, filteredData, variable) {
  const canvas = document.createElement('canvas');
  visualizationPlaceholder.innerHTML = '';
  visualizationPlaceholder.appendChild(canvas);

  const numericFields = ['customerId', 'customerSatisfaction', 'employeeId', 'price', 'quantity', 'total'];
  const isNumericCategory = numericFields.includes(variable);

  const dataByCategory = filteredData.reduce((acc, item) => {
    const key = item[variable] != null ? String(item[variable]) : 'N/A';
    if (!acc[key]) acc[key] = 0;

    if (isNumericCategory) {
      acc[key] += item[variable] || 0;
    } else {
      acc[key] += 1;
    }
    return acc;
  }, {});
  const labels = Object.keys(dataByCategory);
  const dataValues = Object.values(dataByCategory);
  const chartLabel = isNumericCategory ? `Sum of ${variable.replace(/([A-Z])/g, ' $1').trim()}` : `Count by ${variable.replace(/([A-Z])/g, ' $1').trim()}`;

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