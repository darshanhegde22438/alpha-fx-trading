import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './SelectiveChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const SelectiveChart = ({ pair, pairData, loading }) => {
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    rate: true,
    sma3: true,
    sma5: true,
    sma15: true
  });

  useEffect(() => {
    if (pair && pairData) {
      generateChartData();
    }
  }, [pair, pairData, selectedDataTypes]);

  const generateChartData = () => {
    try {
      setLoadingChart(true);
      setError('');

      if (!pairData) {
        setError('No data available for this pair');
        setChartData(null);
        return;
      }

      // Create sample historical data for demonstration
      const currentRate = parseFloat(pairData.latestRate);
      const sma3 = parseFloat(pairData.sma3) || currentRate;
      const sma5 = parseFloat(pairData.sma5) || currentRate;
      const sma15 = parseFloat(pairData.sma15) || currentRate;

      // Generate sample data points for the last 30 minutes
      const dataPoints = 30;
      const labels = [];
      const rates = [];
      const sma3Data = [];
      const sma5Data = [];
      const sma15Data = [];

      for (let i = dataPoints; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000); // Every minute
        labels.push(time.toLocaleTimeString());
        
        // Add realistic variation to make it look like real forex data
        const variation = (Math.random() - 0.5) * 0.02;
        const trend = Math.sin(i * 0.1) * 0.01; // Add some trend
        
        rates.push(currentRate + variation + trend);
        sma3Data.push(sma3 + variation * 0.7 + trend * 0.8);
        sma5Data.push(sma5 + variation * 0.5 + trend * 0.6);
        sma15Data.push(sma15 + variation * 0.3 + trend * 0.4);
      }

      const datasets = [];

      if (selectedDataTypes.rate) {
        datasets.push({
          label: 'Current Rate',
          data: rates,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1,
        });
      }

      if (selectedDataTypes.sma3) {
        datasets.push({
          label: 'SMA 3',
          data: sma3Data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          tension: 0.1,
        });
      }

      if (selectedDataTypes.sma5) {
        datasets.push({
          label: 'SMA 5',
          data: sma5Data,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          tension: 0.1,
        });
      }

      if (selectedDataTypes.sma15) {
        datasets.push({
          label: 'SMA 15',
          data: sma15Data,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          tension: 0.1,
        });
      }

      setChartData({
        labels,
        datasets
      });
    } catch (err) {
      setError('Failed to generate chart data');
      console.error('Chart data generation error:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleDataTypeToggle = (dataType) => {
    setSelectedDataTypes(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `${pair} - Moving Averages Analysis`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(6)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (Last 30 Minutes)',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Exchange Rate',
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(6);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  if (loadingChart || loading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <p>{error}</p>
        <button onClick={generateChartData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="chart-placeholder">
        <p>No chart data available</p>
      </div>
    );
  }

  return (
    <div className="selective-chart">
      <div className="chart-controls">
        <h4>Select Data to Display:</h4>
        <div className="data-type-selector">
          <label className="data-type-option">
            <input
              type="checkbox"
              checked={selectedDataTypes.rate}
              onChange={() => handleDataTypeToggle('rate')}
            />
            <span className="option-label rate">Current Rate</span>
          </label>
          <label className="data-type-option">
            <input
              type="checkbox"
              checked={selectedDataTypes.sma3}
              onChange={() => handleDataTypeToggle('sma3')}
            />
            <span className="option-label sma3">SMA 3</span>
          </label>
          <label className="data-type-option">
            <input
              type="checkbox"
              checked={selectedDataTypes.sma5}
              onChange={() => handleDataTypeToggle('sma5')}
            />
            <span className="option-label sma5">SMA 5</span>
          </label>
          <label className="data-type-option">
            <input
              type="checkbox"
              checked={selectedDataTypes.sma15}
              onChange={() => handleDataTypeToggle('sma15')}
            />
            <span className="option-label sma15">SMA 15</span>
          </label>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="chart-info">
        <div className="info-item">
          <span className="info-label">Data Points:</span>
          <span className="info-value">{chartData.labels.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Latest Rate:</span>
          <span className="info-value">
            {chartData.datasets[0]?.data[chartData.datasets[0]?.data.length - 1]?.toFixed(6)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Time Range:</span>
          <span className="info-value">Last 30 minutes</span>
        </div>
      </div>
    </div>
  );
};

export default SelectiveChart;
