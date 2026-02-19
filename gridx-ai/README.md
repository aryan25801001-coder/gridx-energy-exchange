# GridX AI Forecasting Service

This is the AI microservice for GridX that provides:
- **Demand Forecasting**: Predicts energy demand using exponential smoothing
- **Dynamic Pricing**: Calculates optimal energy prices based on supply/demand
- **Solar Forecasting**: Predicts solar generation based on time patterns
- **Market Analysis**: Provides insights on market conditions

## Setup

### Prerequisites
- Python 3.8+
- pip or poetry

### Installation

```bash
pip install -r requirements.txt
```

### Running the Service

```bash
python main.py
```

Server will start at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Demand Forecast
```
POST /api/forecast
Content-Type: application/json

{
  "houseId": "optional-id",
  "hours": 24
}
```

### Dynamic Pricing
```
POST /api/price
Content-Type: application/json

{
  "demand": 3.5
}
```

### Solar Generation Forecast
```
GET /api/solar-forecast
```

### Market Analysis
```
GET /api/market-analysis
```

## Features

- **Exponential Smoothing**: Smooth forecasting that responds to trends
- **Confidence Scores**: Reliability indicators for predictions
- **Hourly Breakdown**: Detailed hour-by-hour forecasts
- **Dynamic Pricing Model**: Supply-demand based pricing algorithm

## Integration

Backend calls this service via:
```
http://localhost:8000/api/forecast
http://localhost:8000/api/price
```

## Future Enhancements
- Machine Learning models (LSTM/Prophet)
- Real weather API integration
- Advanced pattern recognition
- Grid stability predictions
