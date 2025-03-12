document.addEventListener("DOMContentLoaded", function () {
    const jsonFileInput = document.getElementById("jsonFileInput");
    const loadFileButton = document.getElementById("loadFileButton");
    const placeholderMessage = document.getElementById("placeholderMessage");
    const metricButton = document.getElementById("metricButton");
    const metricDropdown = document.getElementById("metricDropdown");
    const optionsButton = document.getElementById("optionsButton");
    const optionsDropdown = document.getElementById("optionsDropdown");
    const showTop5Button = document.getElementById("showTop5");
    const showGraphButton = document.getElementById("showGraph");
    const top5Table = document.getElementById("top5Table");
    const top5Body = document.getElementById("top5Body");
    const dynamicChartCanvas = document.getElementById("dynamicChart");
    const metricSection = document.getElementById("metricSection");
    const optionsSection = document.getElementById("optionsSection");

    let selectedMetric = null;
    let chartData = {};
    let chartInstance = null;

    // Hide metric and options sections initially
    metricSection.style.display = "none";
    optionsSection.style.display = "none";
    top5Table.style.display = "none";
    dynamicChartCanvas.style.display = "none";

    // Wait for file upload
    loadFileButton.addEventListener("click", function () {
        const file = jsonFileInput.files[0];
        if (!file) {
            alert("Please upload a JSON file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const jsonData = JSON.parse(event.target.result);
            placeholderMessage.style.display = "none"; // Hide placeholder message
            metricSection.style.display = "inline-block"; // Show metric selection
            optionsSection.style.display = "inline-block"; // Show options selection
            generateMetricsDropdown(jsonData);
            processData(jsonData);
        };
        reader.readAsText(file);
    });

    // Toggle Metric Dropdown
    metricButton.addEventListener("click", function () {
        metricDropdown.classList.toggle("hidden");
    });

    // Toggle Options Dropdown
    optionsButton.addEventListener("click", function () {
        optionsDropdown.classList.toggle("hidden");
    });

    // Generate Metrics Dropdown Dynamically
    function generateMetricsDropdown(data) {
        metricDropdown.innerHTML = ""; // Clear existing options
        const sampleRow = data[0];
        Object.keys(sampleRow).forEach(variable => {
            let button = document.createElement("button");
            button.innerText = variable;
            button.className = "block w-full px-4 py-2 text-left hover:bg-gray-200";
            button.addEventListener("click", function () {
                selectedMetric = variable;
                metricButton.innerText = variable;
                metricDropdown.classList.add("hidden");
            });
            metricDropdown.appendChild(button);
        });
    }

    // Process Data and Prepare for Charts
    function processData(data) {
        chartData = {};
        let sampleRow = data[0];

        Object.keys(sampleRow).forEach(variable => {
            chartData[variable] = {};
        });

        data.forEach(row => {
            Object.keys(row).forEach(variable => {
                let value = row[variable];
                chartData[variable][value] = (chartData[variable][value] || 0) + 1;
            });
        });
    }

    // Show Top 5 Chart (Table)
    showTop5Button.addEventListener("click", function () {
        if (!selectedMetric) return alert("Please select a metric first.");
        optionsButton.innerText = "Chart";
        optionsDropdown.classList.add("hidden");

        top5Table.style.display = "table";
        dynamicChartCanvas.style.display = "none";

        let sortedData = Object.entries(chartData[selectedMetric])
            .sort((a, b) => b[1] - a[1]) 
            .slice(0, 5); 

        top5Body.innerHTML = sortedData.map(item =>
            `<tr>
                <td class="border border-gray-400 px-4 py-2">${item[0]}</td>
                <td class="border border-gray-400 px-4 py-2">${item[1]}</td>
            </tr>`
        ).join("");
    });

    // Show Graph (Bar Chart)
    showGraphButton.addEventListener("click", function () {
        if (!selectedMetric) return alert("Please select a metric first.");
        optionsButton.innerText = "Graph";
        optionsDropdown.classList.add("hidden");

        top5Table.style.display = "none";
        dynamicChartCanvas.style.display = "block";

        let labels = Object.keys(chartData[selectedMetric]);
        let values = Object.values(chartData[selectedMetric]);

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = dynamicChartCanvas.getContext("2d");
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: `Distribution of ${selectedMetric}`,
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    });
});



document.getElementById("jsonFileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const jsonData = JSON.parse(e.target.result);
        visualizeData(jsonData);
    };
    reader.readAsText(file);
});


