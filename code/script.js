document.addEventListener("DOMContentLoaded", function () {
    const loadingMessage = document.getElementById("loadingMessage");
    const productChartCanvas = document.getElementById("salesByCategoryChart");
    const timeChartCanvas = document.getElementById("salesByTimeChart");
    const top5Table = document.getElementById("top5Table");
    const top5Body = document.getElementById("top5Body");

    const metricButton = document.getElementById("metricButton");
    const metricDropdown = document.getElementById("metricDropdown");
    const productChartButton = document.getElementById("showProductChart");
    const timeChartButton = document.getElementById("showTimeChart");

    const optionsButton = document.getElementById("optionsButton");
    const optionsDropdown = document.getElementById("optionsDropdown");
    const showTop5Button = document.getElementById("showTop5");
    const showGraphButton = document.getElementById("showGraph");

    let selectedMetric = "product"; // Default selection
    let chartData = {};

    // Hide elements initially
    productChartCanvas.style.display = "none";
    timeChartCanvas.style.display = "none";
    top5Table.style.display = "none";

    fetch("../data/coffee.json")
        .then(response => response.json())
        .then(data => {
            console.log("Coffee data loaded:", data);
            visualizeData(data);

            // Hide loading message once data is loaded
            loadingMessage.style.display = "none";
        })
        .catch(error => {
            loadingMessage.innerText = "Failed to load data!";
            console.error("Error loading coffee.json:", error);
        });

    // Toggle Metric Dropdown
    metricButton.addEventListener("click", function () {
        metricDropdown.classList.toggle("hidden");
    });

    // Toggle Options Dropdown
    optionsButton.addEventListener("click", function () {
        optionsDropdown.classList.toggle("hidden");
    });

    // Show Product Sales Chart
    productChartButton.addEventListener("click", function () {
        selectedMetric = "product";
        metricButton.innerText = "Item";
        metricDropdown.classList.add("hidden");
    });

    // Show Time Sales Chart
    timeChartButton.addEventListener("click", function () {
        selectedMetric = "time";
        metricButton.innerText = "Time";
        metricDropdown.classList.add("hidden");
    });

    // Show Top 5 Chart (Table)
    showTop5Button.addEventListener("click", function () {
        optionsButton.innerText = "Chart";
        optionsDropdown.classList.add("hidden");

        productChartCanvas.style.display = "none";
        timeChartCanvas.style.display = "none";
        top5Table.style.display = "table";

        let sortedData = Object.entries(chartData[selectedMetric])
            .sort((a, b) => b[1] - a[1]) // Sort descending
            .slice(0, 5); // Get top 5

        top5Body.innerHTML = sortedData.map(item => 
            `<tr>
                <td class="border border-gray-400 px-4 py-2">${item[0]}</td>
                <td class="border border-gray-400 px-4 py-2">${item[1]}</td>
            </tr>`
        ).join("");
    });

    // Show Graph (Bar or Line)
    showGraphButton.addEventListener("click", function () {
        optionsButton.innerText = "Graph";
        optionsDropdown.classList.add("hidden");

        top5Table.style.display = "none";

        if (selectedMetric === "product") {
            productChartCanvas.style.display = "block";
            timeChartCanvas.style.display = "none";
        } else {
            productChartCanvas.style.display = "none";
            timeChartCanvas.style.display = "block";
        }
    });

    function visualizeData(data) {
        let productTypeCounts = {};
        let salesByHour = Array(24).fill(0);

        data.forEach(row => {
            const productType = row.product_type;
            productTypeCounts[productType] = (productTypeCounts[productType] || 0) + 1;

            const hour = parseInt(row.transaction_time.split(":")[0]);
            salesByHour[hour]++;
        });

        chartData = { product: productTypeCounts, time: salesByHour };

        const productLabels = Object.keys(productTypeCounts);
        const productValues = Object.values(productTypeCounts);

        // Sales by Product Chart
        const ctx1 = document.getElementById("salesByCategoryChart").getContext("2d");
        new Chart(ctx1, {
            type: "bar",
            data: {
                labels: productLabels,
                datasets: [{
                    label: "Most Sold Product Types",
                    data: productValues,
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Sales by Time Chart
        const ctx2 = document.getElementById("salesByTimeChart").getContext("2d");
        new Chart(ctx2, {
            type: "line",
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [{
                    label: "Sales by Hour",
                    data: salesByHour,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }
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


