import { fetchedData } from './script.js';
import { classifyDataFields } from './dataClassifier.js';

// Calculate Pearson correlation coefficient
function calculateCorrelation(xValues, yValues) {
  const n = xValues.length;
  if (n !== yValues.length || n < 2) return 0;

  const meanX = xValues.reduce((sum, val) => sum + val, 0) / n;
  const meanY = yValues.reduce((sum, val) => sum + val, 0) / n;

  let cov = 0, varX = 0, varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - meanX;
    const dy = yValues[i] - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  if (varX === 0 || varY === 0) return 0;
  return cov / Math.sqrt(varX * varY);
}

export function renderHeatmap(visualizationPlaceholder, filteredData) {
  // Error handling for empty data
  if (!filteredData || filteredData.length === 0) {
    visualizationPlaceholder.innerHTML = '<p>No data available for Heatmap.</p>';
    return;
  }

  // Ensure Chart.js is available
  if (typeof Chart === 'undefined') {
    visualizationPlaceholder.innerHTML = '<p>Error: Chart.js library not loaded.</p>';
    return;
  }

  // Classify fields to get numeric ones
  const fieldTypes = classifyDataFields(filteredData);
  const numericFields = Object.keys(fieldTypes).filter(field => fieldTypes[field] === 'numeric');

  // Define field labels for display
  const fieldLabels = {
    product_id: 'Product ID',
    store_id: 'Store ID',
    transaction_id: 'Transaction ID',
    transaction_qty: 'Transaction Quantity',
    unit_price: 'Unit Price'
  };

  const numericLabels = numericFields.map(field => fieldLabels[field] || field);

  const canvas = document.createElement('canvas');
  visualizationPlaceholder.innerHTML = '';
  visualizationPlaceholder.appendChild(canvas);

  // Compute correlation matrix
  const correlationMatrix = numericFields.map(xField => {
    return numericFields.map(yField => {
      const xValues = filteredData.map(item => {
        const val = item[xField];
        return typeof val === 'number' && !isNaN(val) ? val : 0;
      });
      const yValues = filteredData.map(item => {
        const val = item[yField];
        return typeof val === 'number' && !isNaN(val) ? val : 0;
      });
      return calculateCorrelation(xValues, yValues);
    });
  });

  // Debug: Log the correlation matrix
  console.log('Correlation Matrix:', correlationMatrix);

  // Prepare data for heatmap
  const dataPoints = [];
  for (let i = 0; i < numericFields.length; i++) {
    for (let j = 0; j < numericFields.length; j++) {
      dataPoints.push({ x: j + 0.5, y: numericFields.length - 1 - i + 0.5, v: correlationMatrix[i][j] });
    }
  }

  // Create the heatmap using scatter plot
  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Correlation Heatmap',
        data: dataPoints,
        backgroundColor: dataPoints.map(d => {
          const val = d.v;
          const r = Math.min(255, Math.max(0, 255 * (val + 1) / 2)); // Red component
          const b = Math.min(255, Math.max(0, 255 * (1 - (val + 1) / 2))); // Blue component
          return `rgba(${r}, 0, ${b}, 0.8)`;
        }),
        pointRadius: 20, // Increased to ensure no gaps
        pointHoverRadius: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // Ensure square grid
      aspectRatio: 1,
      scales: {
        x: {
          title: { display: true, text: 'Variables' },
          min: 0,
          max: numericFields.length,
          ticks: {
            callback: i => numericLabels[i] || '',
            stepSize: 1,
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          title: { display: true, text: 'Variables' },
          min: 0,
          max: numericFields.length,
          ticks: {
            callback: i => numericLabels[numericFields.length - 1 - i] || '',
            stepSize: 1,
            autoSkip: false
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const i = numericFields.length - 1 - Math.floor(context.raw.y - 0.5);
              const j = Math.floor(context.raw.x - 0.5);
              return `${numericLabels[i]} vs ${numericLabels[j]}: ${context.raw.v.toFixed(2)}`;
            }
          }
        }
      }
    }
  });

  // Add manual legend with better styling
  const legendContainer = document.createElement('div');
  legendContainer.style.display = 'flex';
  legendContainer.style.alignItems = 'center';
  legendContainer.style.marginTop = '10px';

  const legendCanvas = document.createElement('canvas');
  legendCanvas.width = 20;
  legendCanvas.height = 100;
  const legendCtx = legendCanvas.getContext('2d');
  for (let i = 0; i < 100; i++) {
    const val = (i / 100) * 2 - 1; // -1.0 to 1.0
    const r = Math.min(255, Math.max(0, 255 * (val + 1) / 2));
    const b = Math.min(255, Math.max(0, 255 * (1 - (val + 1) / 2)));
    legendCtx.fillStyle = `rgba(${r}, 0, ${b}, 0.8)`;
    legendCtx.fillRect(0, 99 - i, 20, 1); // Reverse gradient to match y-axis
  }
  legendContainer.appendChild(legendCanvas);

  const legendLabels = document.createElement('div');
  legendLabels.style.marginLeft = '10px';
  legendLabels.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100px;">
      <span>1.0 <span style="color: red;">■</span></span>
      <span>0.0</span>
      <span>-1.0 <span style="color: blue;">■</span></span>
    </div>
  `;
  legendContainer.appendChild(legendLabels);

  visualizationPlaceholder.appendChild(legendContainer);
}