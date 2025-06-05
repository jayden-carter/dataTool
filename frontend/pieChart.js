import { fetchedData } from './script.js';

export function renderPieChart(visualizationPlaceholder, filteredData, variable) {
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
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}