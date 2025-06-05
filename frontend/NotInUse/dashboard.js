import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

$(document).ready(function() {
    const backendUrl = 'http://127.0.0.1:5000/api';

    function getUserEmployeeId() {
        const employeeId = sessionStorage.getItem('employeeId');
        if (!employeeId) {
            throw new Error("User not authenticated");
        }
        return employeeId;
    }

    async function fetchDocumentCount() {
        const db = getFirestore();
        try {
            const querySnapshot = await getDocs(collection(db, "main"));
            const docCount = querySnapshot.size;
            $('#docCount').text(docCount);
        } catch (error) {
            console.error("Error fetching document count:", error.message);
            $('#docCount').text('Error loading count');
            if (error.code === 'permission-denied') {
                $('#docCount').text('Access denied to main collection');
            }
        }
    }

    function loadDashboard(employeeId) {
        console.log(`Using employeeId: ${employeeId}`);

        // Fetch overview data
        $.get(`${backendUrl}/overview/${employeeId}`, function(data) {
            console.log("Overview data: ", data);
            $('#totalRevenue').text(`$${data.total_revenue.toFixed(2)}`);
            $('#netProfit').text(`$${data.profit.toFixed(2)}`);
            $('#timeSold').text(data.items_sold);
            $('#weekChange').text('N/A');
        }).fail(function(xhr) {
            console.error("Error loading overview: ", xhr.status, xhr.responseText);
        });

        // Fetch top items
        $.get(`${backendUrl}/top-items/${employeeId}`, function(data) {
            console.log("Top items data: ", data);
            const topItemsList = $('#topItemsList');
            topItemsList.empty();
            data.forEach(item => {
                topItemsList.append(`<li>${item.name}: ${item.count} sold (${item.percentage}%)</li>`);
            });
        }).fail(function(xhr) {
            console.error("Error loading top items: ", xhr.status, xhr.responseText);
        });

        // Fetch weekly revenue
        $.get(`${backendUrl}/weekly-revenue/${employeeId}`, function(data) {
            console.log("Weekly revenue data: ", data);
            const ctx = document.getElementById('weeklyRevenueChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.weekly_revenue.map(r => r.week),
                    datasets: [{
                        label: 'Revenue',
                        data: data.weekly_revenue.map(r => r.revenue),
                        backgroundColor: '#4CAF50'
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } }
                }
            });
            if (data.week_changes.length > 0) {
                $('#weekChange').text(`${data.week_changes[0].change}%`);
            }
        }).fail(function(xhr) {
            console.error("Error loading weekly revenue: ", xhr.status, xhr.responseText);
        });

        // Fetch top employees
        $.get(`${backendUrl}/top-employees`, function(data) {
            console.log("Top employees data: ", data);
            const topEmployeesList = $('#topEmployeesList');
            topEmployeesList.empty();
            data.forEach(emp => {
                topEmployeesList.append(`<li>Employee ${emp.empId}: ${emp.avgSatisfaction.toFixed(1)}/5</li>`);
            });
        }).fail(function(xhr) {
            console.error("Error loading top employees: ", xhr.status, xhr.responseText);
        });
    }

    async function initializeDashboard() {
        try {
            const employeeId = getUserEmployeeId();
            await fetchDocumentCount(); // Fetch document count from Firestore
            loadDashboard(employeeId); // Load other data from backend
            $('#loading').hide();
            $('#content').show();
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            $('#loading').hide();
            $('#content').show();
            $('#docCount').text('Error loading count');
        }
    }

    window.addEventListener('load', initializeDashboard);
});