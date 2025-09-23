# AlphaFxTrader API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-api-domain.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "timestamp": string (ISO 8601)
}
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-30 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "userType": "string (optional, 'individual' | 'institutional', default: 'individual')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "userType": "string",
      "isActive": true
    },
    "token": "jwt-token-string"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trader123",
    "email": "trader@example.com",
    "password": "password123",
    "userType": "individual"
  }'
```

---

### Login User
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "userType": "string",
      "isActive": true,
      "lastLogin": "2023-12-01T10:00:00.000Z",
      "tradingVolume": 0,
      "maxTradingVolume": 10000000
    },
    "token": "jwt-token-string"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "password123"
  }'
```

---

### Get User Profile
**GET** `/api/auth/profile`

Get current user profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "userType": "string",
      "isActive": true,
      "lastLogin": "2023-12-01T10:00:00.000Z",
      "tradingVolume": 0,
      "maxTradingVolume": 10000000,
      "createdAt": "2023-12-01T09:00:00.000Z"
    }
  }
}
```

---

### Update User Profile
**PUT** `/api/auth/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional, valid email)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "userType": "string",
      "isActive": true,
      "lastLogin": "2023-12-01T10:00:00.000Z",
      "tradingVolume": 0,
      "maxTradingVolume": 10000000,
      "createdAt": "2023-12-01T09:00:00.000Z"
    }
  }
}
```

---

## Forex Data Endpoints

### Get Latest Exchange Rates
**GET** `/api/forex/latest-rates`

Get the latest exchange rates for all currency pairs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "USDEUR",
      "latestRate": 0.9234,
      "sma3": 0.9231,
      "sma5": 0.9228,
      "sma15": 0.9225,
      "timestamp": "2023-12-01T10:00:00.000Z",
      "base": "USD",
      "target": "EUR"
    }
  ],
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/forex/latest-rates
```

---

### Get Available Currency Pairs
**GET** `/api/forex/available-pairs`

Get list of all available currency pairs.

**Response:**
```json
{
  "success": true,
  "data": [
    "USDEUR",
    "USDGBP",
    "USDJPY",
    "USDCAD",
    "USDAUD"
  ],
  "count": 5
}
```

---

### Get Historical Data
**GET** `/api/forex/historical/:pair`

Get historical data for a specific currency pair.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Parameters:**
- `pair` (path): Currency pair (e.g., "USDEUR")
- `limit` (query, optional): Number of records to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rate": 0.9234,
      "sma3": 0.9231,
      "sma5": 0.9228,
      "sma15": 0.9225,
      "timestamp": "2023-12-01T10:00:00.000Z"
    }
  ],
  "pair": "USDEUR",
  "count": 50
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:5000/api/forex/historical/USDEUR?limit=50
```

---

### Get Moving Averages
**GET** `/api/forex/moving-averages/:pair`

Get moving averages data for a specific currency pair.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Parameters:**
- `pair` (path): Currency pair (e.g., "USDEUR")
- `limit` (query, optional): Number of records to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rate": 0.9234,
      "sma3": 0.9231,
      "sma5": 0.9228,
      "sma15": 0.9225,
      "timestamp": "2023-12-01T10:00:00.000Z"
    }
  ],
  "pair": "USDEUR",
  "count": 30
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:5000/api/forex/moving-averages/USDEUR?limit=30
```

---

### Get Database Statistics
**GET** `/api/forex/stats`

Get database statistics and system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "forexDataPoints": 15000,
    "uniquePairs": 25,
    "pairs": [
      "USDEUR",
      "USDGBP",
      "USDJPY"
    ],
    "oldestRecord": "2023-11-01T00:00:00.000Z",
    "latestRecord": "2023-12-01T10:00:00.000Z"
  }
}
```

---

## System Endpoints

### Health Check
**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "message": "AlphaFxTrader API server is running",
  "version": "1.0.0"
}
```

---

### API Information
**GET** `/`

Get API information and available endpoints.

**Response:**
```json
{
  "message": "Welcome to AlphaFxTrader API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "forex": "/api/forex",
    "health": "/health"
  }
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Common Error Messages

### Authentication Errors
```json
{
  "success": false,
  "message": "Access token required"
}
```

```json
{
  "success": false,
  "message": "Invalid token"
}
```

```json
{
  "success": false,
  "message": "Token expired"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

### Data Errors
```json
{
  "success": false,
  "message": "Failed to fetch latest rates",
  "error": "Database connection error"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Data Update Frequency

- **Exchange Rates**: Updated every 1 minute
- **Moving Averages**: Calculated automatically with each data point
- **Historical Data**: Available for the last 30 days (configurable)

## Supported Currency Pairs

The API supports all major currency pairs available from the Exchange Rate API:
- USD/EUR, USD/GBP, USD/JPY, USD/CAD, USD/AUD
- EUR/GBP, EUR/JPY, EUR/CAD, EUR/AUD
- GBP/JPY, GBP/CAD, GBP/AUD
- And many more...

## WebSocket Support

WebSocket support is planned for future releases to provide real-time data streaming.

---

For more information, please refer to the main README.md file or contact the development team.
