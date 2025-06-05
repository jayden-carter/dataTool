import { fetchedData } from './script.js';
import { renderBarChart } from './barChart.js';
import { renderPieChart } from './pieChart.js';
import { renderBoxPlot } from './boxPlot.js';
import { renderHistogram } from './histogram.js';
import { renderScatterPlot } from './scatterPlot.js';
import { renderHeatmap } from './heatmap.js';
import { classifyDataFields } from './dataClassifier.js';

export function initializeDataHandler() {
  // Elements
  const loadingDiv = document.getElementById('loading');
  const contentDiv = document.getElementById('content');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const recordCount = document.getElementById('recordCount');
  const avgValue = document.getElementById('avgValue');
  const uniqueCategories = document.getElementById('uniqueCategories');
  const visualizationType = document.getElementById('visualizationType');
  const visualizationPlaceholder = document.getElementById('visualizationPlaceholder');
  const refreshButton = document.getElementById('refresh');
  const variableLabel = document.getElementById('variableLabel');
  const variableSelect = document.getElementById('variable');
  const independentLabel = document.getElementById('independentLabel');
  const dependentLabel = document.getElementById('dependentLabel');
  const independentSelect = document.getElementById('independentVariable');
  const dependentSelect = document.getElementById('dependentVariable');

  // Error handling for missing elements
  if (!independentSelect || !dependentSelect) {
    console.error('Dropdown elements not found. Check index.html for correct IDs.');
    return;
  }

  let filteredData = [...fetchedData];
  let chartInstance = null;
  let fieldTypes = {};

  // Define field labels for display (assuming coffee and main have similar structures)
  const fieldLabels = {
    product_category: 'Product Category',
    product_detail: 'Product Detail',
    product_id: 'Product ID',
    product_type: 'Product Type',
    store_id: 'Store ID',
    store_location: 'Store Location',
    transaction_date: 'Transaction Date',
    transaction_id: 'Transaction ID',
    transaction_qty: 'Transaction Quantity',
    transaction_time: 'Transaction Time',
    unit_price: 'Unit Price'
  };

  // Populate variable dropdowns dynamically
  function populateVariableDropdowns(visualization) {
    const isTwoVariable = ['histogram', 'scatter'].includes(visualization.toLowerCase());

    // Debug: Log visualization type and condition
    console.log('Visualization Type:', visualization, 'Is Two Variable:', isTwoVariable);

    // Show/hide dropdowns
    variableLabel.classList.add('hidden');
    independentLabel.classList.add('hidden');
    dependentLabel.classList.add('hidden');

    if (visualization === 'table' || visualization === 'heatmap') {
      console.log('Hiding all variable dropdowns for table/heatmap');
      return;
    } else if (isTwoVariable) {
      console.log('Showing Independent and Dependent dropdowns');
      independentLabel.classList.remove('hidden');
      dependentLabel.classList.remove('hidden');
      // Use only numeric fields for both dropdowns
      const numericFields = Object.keys(fieldTypes).filter(field => fieldTypes[field] === 'numeric');
      const numericFieldObjects = numericFields.map(field => ({
        value: field,
        label: fieldLabels[field] || field
      }));
      independentSelect.innerHTML = numericFieldObjects.map(field => `<option value="${field.value}">${field.label}</option>`).join('');
      dependentSelect.innerHTML = numericFieldObjects.map(field => `<option value="${field.value}">${field.label}</option>`).join('');
      // Set default values to numeric fields
      independentSelect.value = numericFields.includes('product_id') ? 'product_id' : numericFields[0];
      dependentSelect.value = numericFields.includes('unit_price') ? 'unit_price' : numericFields[1] || numericFields[0];
      // Ensure dropdowns are enabled
      independentSelect.disabled = false;
      dependentSelect.disabled = false;
      console.log('Independent Dropdown Options:', independentSelect.innerHTML);
      console.log('Dependent Dropdown Options:', dependentSelect.innerHTML);
      console.log('Independent Default Value:', independentSelect.value);
      console.log('Dependent Default Value:', dependentSelect.value);
    } else {
      console.log('Showing Variable dropdown for other visualizations');
      variableLabel.classList.remove('hidden');
      const allFields = Object.keys(fieldTypes).map(field => ({
        value: field,
        label: fieldLabels[field] || field
      }));
      variableSelect.innerHTML = allFields.map(field => `<option value="${field.value}">${field.label}</option>`).join('');
      variableSelect.value = 'product_detail';
    }
  }

  // Show content after data is available
  function checkDataAndShow() {
    if (fetchedData.length > 0) {
      // Classify data fields once data is available
      fieldTypes = classifyDataFields(fetchedData);
      console.log('Field Types:', fieldTypes);

      filteredData = [...fetchedData];
      loadingDiv.style.display = 'none';
      contentDiv.style.display = 'block';
      updateUI();
    } else {
      setTimeout(checkDataAndShow, 500);
    }
  }
  checkDataAndShow();

  // Update UI based on filtered data
  function updateUI() {
    recordCount.textContent = filteredData.length;
    // Update average value to use unit_price or a similar numeric field
    const numericFields = Object.keys(fieldTypes).filter(field => fieldTypes[field] === 'numeric');
    const avgField = numericFields.includes('unit_price') ? 'unit_price' : (numericFields[0] || 'transaction_qty');
    const totalValue = filteredData.reduce((sum, item) => sum + (item[avgField] || 0), 0);
    avgValue.textContent = filteredData.length ? (totalValue / filteredData.length).toFixed(2) : '0.00';
    // Update unique categories to use product_detail or a similar string field
    const stringFields = Object.keys(fieldTypes).filter(field => fieldTypes[field] === 'string');
    const uniqueField = stringFields.includes('product_detail') ? 'product_detail' : (stringFields[0] || 'product_category');
    const uniqueItems = new Set(filteredData.map(item => item[uniqueField] || '')).size;
    uniqueCategories.textContent = uniqueItems;

    // Update dropdowns based on current visualization
    populateVariableDropdowns(visualizationType.value);

    renderVisualization();
  }

  // Apply date filters
  function applyFilters() {
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    filteredData = fetchedData.filter(item => {
      const itemDate = item.transaction_date;
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });

    updateUI();
  }

  // Render visualization
  function renderVisualization() {
    const type = visualizationType.value;
    const variable = variableSelect.value;
    const independentVar = independentSelect.value;
    const dependentVar = dependentSelect.value;

    console.log('Rendering Visualization:', type, 'Independent:', independentVar, 'Dependent:', dependentVar);

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    visualizationPlaceholder.innerHTML = '';

    if (type === 'table') {
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.innerHTML = `
        <thead>
          <tr>
            ${Object.keys(fieldTypes).map(field => `<th style="border: 1px solid #ccc; padding: 8px;">${fieldLabels[field] || field}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredData.map(item => `
            <tr>
              ${Object.keys(fieldTypes).map(field => {
                const value = item[field];
                return `<td style="border: 1px solid #ccc; padding: 8px;">${value != null ? (fieldTypes[field] === 'numeric' ? value : value.toString()) : 'N/A'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      `;
      visualizationPlaceholder.appendChild(table);
    } else if (type === 'bar') {
      renderBarChart(visualizationPlaceholder, filteredData, variable);
    } else if (type === 'pie') {
      renderPieChart(visualizationPlaceholder, filteredData, variable);
    } else if (type === 'box') {
      renderBoxPlot(visualizationPlaceholder, filteredData, variable);
    } else if (type === 'histogram') {
      renderHistogram(visualizationPlaceholder, filteredData, independentVar);
    } else if (type === 'scatter') {
      renderScatterPlot(visualizationPlaceholder, filteredData, independentVar, dependentVar);
    } else if (type === 'heatmap') {
      renderHeatmap(visualizationPlaceholder, filteredData);
    }
  }

  startDateInput.addEventListener('change', applyFilters);
  endDateInput.addEventListener('change', applyFilters);
  visualizationType.addEventListener('change', () => {
    console.log('Visualization Type Changed:', visualizationType.value);
    populateVariableDropdowns(visualizationType.value);
    renderVisualization();
  });
  variableSelect.addEventListener('change', () => {
    console.log('Variable Changed:', variableSelect.value);
    renderVisualization();
  });
  independentSelect.addEventListener('change', () => {
    console.log('Independent Variable Changed:', independentSelect.value);
    renderVisualization();
  });
  dependentSelect.addEventListener('change', () => {
    console.log('Dependent Variable Changed:', dependentSelect.value);
    renderVisualization();
  });
  refreshButton.addEventListener('change', () => {
    startDateInput.value = '';
    endDateInput.value = '';
    visualizationType.value = 'table';
    populateVariableDropdowns('table');
    filteredData = [...fetchedData];
    updateUI();
  });
}