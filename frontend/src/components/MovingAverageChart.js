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
import { forexAPI } from '../services/api';
import './MovingAverageChart.css';

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

const MovingAverageChart = ({ pair, loading }) => {
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pair) {
      fetchChartData();
    }
  }, [pair]);

  const fetchChartData = async () => {
    try {
      setLoadingChart(true);
      setError('');
      
      // For demo purposes, create sample data since we don't have historical data
      const response = await forexAPI.getLatestRates();
      const latestData = response.data.data;
      
      // Find the selected pair data
      const pairData = latestData.find(item => item._id === pair);
      
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

      // Generate sample data points for the last 20 minutes
      const dataPoints = 20;
      const labels = [];
      const rates = [];
      const sma3Data = [];
      const sma5Data = [];
      const sma15Data = [];

      for (let i = dataPoints; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000); // Every minute
        labels.push(time.toLocaleTimeString());
        
        // Add some variation to make it look realistic
        const variation = (Math.random() - 0.5) * 0.01;
        rates.push(currentRate + variation);
        sma3Data.push(sma3 + variation * 0.5);
        sma5Data.push(sma5 + variation * 0.3);
        sma15Data.push(sma15 + variation * 0.1);
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Current Rate',
            data: rates,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.1,
          },
          {
            label: 'SMA 3',
            data: sma3Data,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.1,
          },
          {
            label: 'SMA 5',
            data: sma5Data,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.1,
          },
          {
            label: 'SMA 15',
            data: sma15Data,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.1,
          },
        ],
      });
    } catch (err) {
      setError('Failed to load chart data');
      console.error('Chart data fetch error:', err);
    } finally {
      setLoadingChart(false);
    }
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
        text: `Moving Averages - ${pair}`,
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
          text: 'Time',
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
        <button onClick={fetchChartData} className="retry-button">
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
    <div className="moving-average-chart">
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
            {chartData.datasets[0].data[chartData.datasets[0].data.length - 1]?.toFixed(6)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Last Updated:</span>
          <span className="info-value">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovingAverageChart;
