# Frontend-Backend Connection Guide

## 🔍 Overview

This guide helps you troubleshoot and verify the connection between the React frontend and Node.js backend for the AlphaFxTrader application.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

The backend should start on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```

The frontend should start on `http://localhost:3000`

## 🔧 Connection Testing

### Method 1: Use the Built-in Test Component
1. Open the frontend application
2. Navigate to the dashboard
3. Check the connection status indicator in the header
4. Look for console logs showing API requests/responses

### Method 2: Use the Backend Connection Test Component
1. Import and use the `BackendConnectionTest` component
2. Click "Run Connection Test" to test all endpoints
3. Review the detailed results

### Method 3: Use the Node.js Test Script
```bash
node test-backend-connection.js
```

### Method 4: Manual API Testing
Test these endpoints directly in your browser or Postman:

- **Health Check**: `http://localhost:5000/health`
- **Database Test**: `http://localhost:5000/test-db`
- **Latest Rates**: `http://localhost:5000/api/forex/latest-rates`
- **Available Pairs**: `http://localhost:5000/api/forex/available-pairs`
- **Stats**: `http://localhost:5000/api/forex/stats`

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend server"
**Symptoms:**
- Frontend shows "Disconnected" status
- Console shows network errors
- API calls fail with timeout

**Solutions:**
1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Verify backend port:**
   - Backend should be on port 5000
   - Check `backend/server.js` for port configuration

3. **Check CORS settings:**
   - Backend has CORS enabled
   - Frontend proxy is configured in `frontend/package.json`

### Issue 2: "Failed to fetch dashboard data"
**Symptoms:**
- Backend is running but frontend can't get data
- API calls return errors
- Empty or undefined data

**Solutions:**
1. **Check MongoDB connection:**
   ```bash
   curl http://localhost:5000/test-db
   ```

2. **Verify forex data exists:**
   - Check if cron job is running
   - Look for forex data in database
   - Check backend console for data fetch logs

3. **Check API endpoint responses:**
   ```bash
   curl http://localhost:5000/api/forex/latest-rates
   ```

### Issue 3: "No data available for this pair"
**Symptoms:**
- Currency pairs are filtered out
- Empty currency table
- No data in charts

**Solutions:**
1. **Check currency filtering:**
   - Verify allowed currencies in `EnhancedDashboard.js`
   - Check if backend has data for these currencies

2. **Verify data format:**
   - Check if backend returns data in expected format
   - Verify currency pair naming convention

### Issue 4: Proxy Issues
**Symptoms:**
- API calls go to wrong URL
- CORS errors
- Network timeouts

**Solutions:**
1. **Check proxy configuration:**
   - Verify `frontend/package.json` has `"proxy": "http://localhost:5000"`
   - Check `frontend/src/setupProxy.js` exists

2. **Alternative: Use environment variable:**
   ```bash
   # In frontend directory
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   ```

## 📊 Expected Data Flow

### 1. Backend Data Fetching
```
Cron Job (every minute) → Exchange Rate API → MongoDB → Moving Averages Calculation
```

### 2. Frontend Data Retrieval
```
Frontend → API Service → Backend Endpoints → Database → Response to Frontend
```

### 3. Data Structure
```javascript
// Expected response format
{
  success: true,
  data: [
    {
      _id: "USDTRY",
      pair: "USD/TRY", 
      latestRate: "30.25",
      sma3: "30.20",
      sma5: "30.15", 
      sma15: "30.10",
      timestamp: "2024-01-01T12:00:00.000Z",
      base: "USD",
      target: "TRY"
    }
  ],
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

## 🔍 Debugging Steps

### Step 1: Check Backend Logs
Look for these log messages in the backend console:
```
🚀 AlphaFxTrader server running on http://localhost:5000
✅ MongoDB Connected successfully
🔄 Fetching forex data...
💾 Stored X currency pairs
📈 USD-TRY: Rate=30.25, SMA3=30.20, SMA5=30.15, SMA15=30.10
```

### Step 2: Check Frontend Console
Look for these log messages in the browser console:
```
🚀 API Request: GET /api/forex/latest-rates
✅ API Response: 200 /api/forex/latest-rates
📊 Latest rates fetched: {success: true, data: [...]}
📊 All rates: [...]
📊 Filtered rates: [...]
```

### Step 3: Verify Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Refresh the page
4. Look for API requests to `/api/forex/*`
5. Check response status and data

## 🛠️ Configuration Files

### Backend Configuration
- **Port**: `backend/server.js` (line 14)
- **Database**: `backend/config/db.js`
- **CORS**: `backend/server.js` (line 20)
- **Routes**: `backend/routes/forex.js`

### Frontend Configuration
- **API URL**: `frontend/src/services/api.js` (line 3)
- **Proxy**: `frontend/package.json` (line 45)
- **Proxy Setup**: `frontend/src/setupProxy.js`

## 📞 Support

If you're still having issues:

1. **Check the console logs** for detailed error messages
2. **Verify all dependencies** are installed correctly
3. **Ensure MongoDB** is running and accessible
4. **Test each endpoint** individually using curl or Postman
5. **Check network connectivity** between frontend and backend

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Backend shows "server running" message
- ✅ Frontend shows "Live Data" status
- ✅ Currency table displays data
- ✅ Charts render with moving averages
- ✅ Console shows successful API calls
- ✅ No error messages in browser or server console
