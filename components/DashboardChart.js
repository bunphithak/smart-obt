import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { REPAIR_STATUS, REPAIR_STATUS_LABELS } from '../lib/constants';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardChart() {
  const [chartData, setChartData] = useState({
    repairsByMonth: [],
    reportsByStatus: {},
    assetsByCategory: {}
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setChartData({
            repairsByMonth: data.data.repairsByMonth.map(item => ({
              month: item.month,
              count: parseInt(item.count) || 0
            })),
            reportsByStatus: data.data.reportsByStatus || {},
            assetsByCategory: data.data.assetsByCategory || {}
          });
        } else {
          console.error('API Error:', data.error);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  // Calculate max values for progress bars
  const maxStatusCount = Math.max(...Object.values(chartData.reportsByStatus), 1);
  const maxCategoryCount = Math.max(...Object.values(chartData.assetsByCategory), 1);

  // Prepare data for Chart.js
  const barChartData = {
    labels: chartData.repairsByMonth.map(d => d.month),
    datasets: [{
      label: 'จำนวนรายงาน',
      data: chartData.repairsByMonth.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} งาน`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={barChartData} options={barChartOptions} />
    </div>
  );
}

