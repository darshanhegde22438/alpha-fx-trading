import React from 'react';

const CurrencyFilterTest = () => {
  // Test data with the specified currencies
  const testCurrencies = [
    'VES', 'ZWL', 'TRY', 'ARS', 'NGN', 'SSP', 'IRR', 'AOA', 
    'EGP', 'PKR', 'UZS', 'GHS', 'UAH', 'BRL', 'INR'
  ];

  const allowedCurrencies = [
    'VES', 'ZWL', 'TRY', 'ARS', 'NGN', 'SSP', 'IRR', 'AOA', 
    'EGP', 'PKR', 'UZS', 'GHS', 'UAH', 'BRL', 'INR'
  ];

  // Simulate forex data
  const mockForexData = [
    { _id: 'USDVES', pair: 'USD/VES', latestRate: '36.50', sma3: '36.45', sma5: '36.40', sma15: '36.35' },
    { _id: 'USDZWL', pair: 'USD/ZWL', latestRate: '322.00', sma3: '321.50', sma5: '321.00', sma15: '320.50' },
    { _id: 'USDTRY', pair: 'USD/TRY', latestRate: '30.25', sma3: '30.20', sma5: '30.15', sma15: '30.10' },
    { _id: 'USDARS', pair: 'USD/ARS', latestRate: '850.00', sma3: '849.50', sma5: '849.00', sma15: '848.50' },
    { _id: 'USDNGN', pair: 'USD/NGN', latestRate: '780.00', sma3: '779.50', sma5: '779.00', sma15: '778.50' },
    { _id: 'USDSSP', pair: 'USD/SSP', latestRate: '1300.00', sma3: '1299.50', sma5: '1299.00', sma15: '1298.50' },
    { _id: 'USDIRR', pair: 'USD/IRR', latestRate: '42000.00', sma3: '41950.00', sma5: '41900.00', sma15: '41850.00' },
    { _id: 'USDAOA', pair: 'USD/AOA', latestRate: '830.00', sma3: '829.50', sma5: '829.00', sma15: '828.50' },
    { _id: 'USDEGP', pair: 'USD/EGP', latestRate: '31.00', sma3: '30.95', sma5: '30.90', sma15: '30.85' },
    { _id: 'USDPKR', pair: 'USD/PKR', latestRate: '280.00', sma3: '279.50', sma5: '279.00', sma15: '278.50' },
    { _id: 'USDUZS', pair: 'USD/UZS', latestRate: '12350.00', sma3: '12300.00', sma5: '12250.00', sma15: '12200.00' },
    { _id: 'USDGHS', pair: 'USD/GHS', latestRate: '12.50', sma3: '12.45', sma5: '12.40', sma15: '12.35' },
    { _id: 'USDUAH', pair: 'USD/UAH', latestRate: '37.50', sma3: '37.45', sma5: '37.40', sma15: '37.35' },
    { _id: 'USDBRL', pair: 'USD/BRL', latestRate: '5.20', sma3: '5.18', sma5: '5.16', sma15: '5.14' },
    { _id: 'USDINR', pair: 'USD/INR', latestRate: '83.25', sma3: '83.20', sma5: '83.15', sma15: '83.10' },
    // These should be filtered out
    { _id: 'USDEUR', pair: 'USD/EUR', latestRate: '0.85', sma3: '0.84', sma5: '0.83', sma15: '0.82' },
    { _id: 'USDGBP', pair: 'USD/GBP', latestRate: '0.78', sma3: '0.77', sma5: '0.76', sma15: '0.75' },
    { _id: 'USDJPY', pair: 'USD/JPY', latestRate: '150.00', sma3: '149.50', sma5: '149.00', sma15: '148.50' }
  ];

  // Filter the data
  const filteredData = mockForexData.filter(rate => {
    return allowedCurrencies.some(currency => 
      rate._id.includes(currency) || rate.pair.includes(currency)
    );
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Currency Filter Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Allowed Currencies ({allowedCurrencies.length}):</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {allowedCurrencies.map(currency => (
            <span key={currency} style={{ 
              padding: '4px 8px', 
              background: '#e3f2fd', 
              border: '1px solid #2196f3',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {currency}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Total Mock Data: {mockForexData.length} pairs</h3>
        <h3>Filtered Data: {filteredData.length} pairs</h3>
      </div>

      <div>
        <h3>Filtered Currency Pairs:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {filteredData.map(rate => (
            <div key={rate._id} style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '6px',
              background: '#f9f9f9'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{rate.pair}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Rate: {rate.latestRate}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                SMA3: {rate.sma3} | SMA5: {rate.sma5} | SMA15: {rate.sma15}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e8', borderRadius: '6px' }}>
        <strong>✅ Test Result:</strong> {filteredData.length === allowedCurrencies.length ? 
          'SUCCESS - All specified currencies are present' : 
          'FAILED - Some currencies are missing'
        }
      </div>
    </div>
  );
};

export default CurrencyFilterTest;
