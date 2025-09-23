import React, { useEffect, useState } from "react";
import axios from "axios";

const ForexTable = ({ onPairSelect }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setError(null);
        const res = await axios.get("/api/forex-data");
        setRates(res.data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rates:", err);
        setError("Failed to fetch forex data. Please check if the backend is running.");
        setLoading(false);
      }
    };

    fetchRates(); // initial fetch
    const interval = setInterval(fetchRates, 30000); // fetch every 30 seconds

    return () => clearInterval(interval); // cleanup interval on unmount
  }, []);

  const handleRowClick = (pair) => {
    onPairSelect(pair);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading forex data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="forex-table-container">
      <div className="table-header">
        <h2>Live Forex Data with Time-based SMAs</h2>
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      <div className="table-wrapper">
        <table className="forex-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Current Rate</th>
              <th>SMA 3min</th>
              <th>SMA 5min</th>
              <th>SMA 15min</th>
              <th>SMA 30min</th>
              <th>Data Points</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No data available. Please wait for data collection...
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr 
                  key={rate._id}
                  className="data-row"
                  onClick={() => handleRowClick(rate.pair)}
                >
                  <td className="pair-cell">
                    <strong>{rate.pair}</strong>
                    <small>{rate.base}/{rate.target}</small>
                  </td>
                  <td className="rate-cell">
                    {rate.rate != null ? rate.rate.toFixed(5) : "-"}
                  </td>
                  <td className={`sma-cell ${rate.sma3min ? 'has-data' : 'calculating'}`}>
                    {rate.sma3min != null ? rate.sma3min.toFixed(5) : "Calculating..."}
                  </td>
                  <td className={`sma-cell ${rate.sma5min ? 'has-data' : 'calculating'}`}>
                    {rate.sma5min != null ? rate.sma5min.toFixed(5) : "Calculating..."}
                  </td>
                  <td className={`sma-cell ${rate.sma15min ? 'has-data' : 'calculating'}`}>
                    {rate.sma15min != null ? rate.sma15min.toFixed(5) : "Calculating..."}
                  </td>
                  <td className={`sma-cell ${rate.sma30min ? 'has-data' : 'calculating'}`}>
                    {rate.sma30min != null ? rate.sma30min.toFixed(5) : "Calculating..."}
                  </td>
                  <td className="data-points-cell">
                    {rate.dataPointsUsed || 0}
                  </td>
                  <td className="timestamp-cell">
                    {rate.timestamp ? new Date(rate.timestamp).toLocaleTimeString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForexTable;
