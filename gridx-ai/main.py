from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import random
import numpy as np
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="GridX AI Forecasting Service")

# Enable CORS for backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy solar data for "training" or simulation
# Represents hourly solar production over 24 hours
HISTORICAL_SOLAR_PATTERN = [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  # 12am - 5am
    0.1, 0.5, 1.2, 2.5, 3.8, 4.5,  # 6am - 11am (Sunrise)
    5.0, 4.8, 4.2, 3.5, 2.1, 1.0,  # 12pm - 5pm (Peak & Sunset)
    0.2, 0.0, 0.0, 0.0, 0.0, 0.0   # 6pm - 11pm
]

@app.get("/")
async def root():
    return {"status": "online", "service": "GridX AI Forecasting"}

@app.get("/api/forecast")
async def get_forecast(houseId: str = None):
    """
    Simulates demand forecasting based on time of day.
    In a real app, this would use an LSTM or Prophet model.
    """
    current_hour = datetime.now().hour
    
    # Generate forecast for the next 6 hours
    forecast = []
    for i in range(1, 7):
        hour = (current_hour + i) % 24
        # Demand is usually inverse of production (higher at night/evening)
        base_demand = 1.5 + (0.5 * np.sin((hour - 18) * np.pi / 12) + 1)
        # Add some noise
        predicted_demand = max(0.2, base_demand + random.uniform(-0.3, 0.3))
        
        forecast.append({
            "hour": hour,
            "predictedDemandKwh": round(predicted_demand, 2),
            "confidence": round(0.85 + random.uniform(0.01, 0.1), 2)
        })
        
    return {
        "houseId": houseId,
        "currentHour": current_hour,
        "forecast": forecast,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/price")
async def get_dynamic_price(demand: float = Query(..., description="Current demand in kWh")):
    """
    Suggests a dynamic price based on supply/demand ratio.
    Higher demand = Higher price.
    """
    current_hour = datetime.now().hour
    current_production = HISTORICAL_SOLAR_PATTERN[current_hour]
    
    # Base price in ₹
    BASE_PRICE = 5.0
    
    # Calculate price multiplier based on demand vs simulation production
    # If production is high (noon), price drops. If demand is high, price rises.
    supply_factor = max(0.1, current_production)
    ratio = demand / supply_factor
    
    # Dynamic price calculation
    dynamic_price = BASE_PRICE * (1 + (0.1 * np.log1p(ratio)))
    
    # Clamp price between reasonable bounds
    final_price = round(max(3.5, min(8.5, dynamic_price)), 2)
    
    return {
        "demand": demand,
        "suggestedPricePerKwh": final_price,
        "demandLevel": "High" if demand > 4.0 else "Medium" if demand > 1.5 else "Low",
        "isPeakHour": 18 <= current_hour <= 22,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
