import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth, db } from './firebaseConfig.js';

// FilterPanel Component
const FilterPanel = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-64 p-4 bg-gray-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      <label className="block mb-2">
        Start Date:
        <input
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleFilterChange}
          className="w-full p-1 border rounded"
        />
      </label>
      <label className="block mb-2">
        End Date:
        <input
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleFilterChange}
          className="w-full p-1 border rounded"
        />
      </label>
      <label className="block mb-2">
        Metric:
        <select
          name="metric"
          value={filters.metric}
          onChange={handleFilterChange}
          className="w-full p-1 border rounded"
        >
          <option value="totalSales">Total Sales</option>
          <option value="numberOfOrders">Number of Orders</option>
          <option value="avgOrderValue">Average Order Value</option>
        </select>
      </label>
      <label className="block mb-2">
        Visualization:
        <select
          name="visualization"
          value={filters.visualization}
          onChange={handleFilterChange}
          className="w-full p-1 border rounded"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="table">Table</option>
        </select>
      </label>
    </div>
  );
};

// TableComponent for displaying data
const TableComponent = ({ data }) => (
  <table className="min-w-full bg-white border-collapse">
    <thead>
      <tr>
        <th className="py-2 px-4 border">Date</th>
        <th className="py-2 px-4 border">Value</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          <td className="py-2 px-4 border">{row.x}</td>
          <td className="py-2 px-4 border">{row.y.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ChartComponent for rendering charts
const ChartComponent = ({ type, data }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      let chartInstance = Chart.getChart(ctx);
      if (chartInstance) chartInstance.destroy();

      new Chart(ctx, {
        type: type,
        data: {
          labels: data.map(d => d.x),
          datasets: [{
            label: type === 'line' ? 'Metric over Time' : 'Metric by Date',
            data: data.map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: type === 'bar'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: type === 'line' ? { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } } : {},
            y: { beginAtZero: true }
          }
        }
      });
    }
  }, [type, data]);

  return <canvas ref={canvasRef} className="w-full h-96"></canvas>;
};

// Visualization Component
const Visualization = ({ type, data }) => {
  return type === 'table' ? <TableComponent data={data} /> : <ChartComponent type={type} data={data} />;
};

// AnalyticsDashboard Component
const AnalyticsDashboard = () => {
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    metric: 'totalSales',
    visualization: 'bar'
  });
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Authentication check
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true); // Trigger data fetch
      } else {
        window.location.href = 'login.html';
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when filters or user changes
  React.useEffect(() => {
    if (!user) return; // Wait for user to be authenticated

    const fetchData = async () => {
      setLoading(true);
      let q = query(collection(db, 'transactions'));
      if (filters.startDate) q = query(q, where('Date', '>=', filters.startDate));
      if (filters.endDate) q = query(q, where('Date', '<=', filters.endDate));

      try {
        const snapshot = await getDocs(q);
        const rawData = snapshot.docs.map(doc => doc.data());
        const processedData = processData(rawData, filters.metric);
        setData(processedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters, user]);

  const processData = (rawData, metric) => {
    const grouped = rawData.reduce((acc, curr) => {
      const key = curr.Date || 'Unknown';
      if (!acc[key]) acc[key] = { count: 0, total: 0 };
      acc[key].count += 1;
      acc[key].total += curr.Total || 0;
      return acc;
    }, {});
    return Object.entries(grouped).map(([key, value]) => {
      let metricValue;
      switch (metric) {
        case 'totalSales':
          metricValue = value.total;
          break;
        case 'numberOfOrders':
          metricValue = value.count;
          break;
        case 'avgOrderValue':
          metricValue = value.count > 0 ? value.total / value.count : 0;
          break;
        default:
          metricValue = 0;
      }
      return { x: key, y: metricValue };
    });
  };

  return (
    <div className="flex min-h-screen">
      <FilterPanel filters={filters} setFilters={setFilters} />
      <div className="flex-grow p-4">
        <div className="mb-4">
          <button
            onClick={() => signOut(auth).then(() => window.location.href = 'login.html')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : data.length > 0 ? (
          <Visualization type={filters.visualization} data={data} />
        ) : (
          <p className="text-center text-lg">No data available for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

// Render the Dashboard
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnalyticsDashboard />);