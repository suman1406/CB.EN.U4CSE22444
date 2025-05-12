# Stock Analysis API

This API provides endpoints for analyzing stock data, including calculating average prices and correlations between stocks.

## Features

### 1. Average Stock Price Calculation
- **Endpoint**: `GET /stocks/:ticker?minutes=m&aggregation=average`
- **Description**: Calculates the average price of a stock over a specified time period
- **Parameters**:
  - `ticker`: Stock symbol
  - `minutes`: Time period in minutes
  - `aggregation`: Must be set to "average"
- **Response**: Returns average price and price history
- **Example Response**:
```json
{
  "averageStockPrice": 150.25,
  "priceHistory": [...]
}
```

### 2. Stock Correlation Analysis
- **Endpoint**: `GET /stockcorrelation?minutes=m&ticker=T1&ticker=T2`
- **Description**: Calculates the correlation between two stocks over a specified time period
- **Parameters**:
  - `minutes`: Time period in minutes
  - `ticker`: Two stock symbols (T1 and T2)
- **Response**: Returns correlation coefficient and price histories for both stocks
- **Example Response**:
```json
{
  "correlation": 0.85,
  "stocks": {
    "AAPL": {
      "averagePrice": 150.25,
      "priceHistory": [...]
    },
    "MSFT": {
      "averagePrice": 280.50,
      "priceHistory": [...]
    }
  }
}
```

### 3. List All Stocks
- **Endpoint**: `GET /stocks`
- **Description**: Retrieves a list of all available stocks
- **Response**: Returns an array of stock symbols

## Implementation Details

### Average Price Calculation
![Average Price Calculation](question1/Average.png)

The average price calculation uses a simple arithmetic mean of all price points within the specified time window.

### Correlation Calculation
![Correlation Calculation](question1/Correlation.png)

The correlation calculation uses Pearson's correlation coefficient with a closest-pairing algorithm to align price points from different stocks based on their timestamps.

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node question1/server.js
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid parameters
- Missing data
- API connection issues
- Server errors

All errors return appropriate HTTP status codes and descriptive error messages. 