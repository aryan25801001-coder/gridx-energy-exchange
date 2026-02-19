import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// GET forecast
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/forecast`, {
      params: req.query
    });
    res.json(response.data);
  } catch (err) {
    console.error('AI service error:', err);
    // Return mock data for demo
    res.json({
      predictedDemand: Math.random() * 5 + 2,
      confidence: 0.92,
      timestamp: new Date().toISOString()
    });
  }
});

// GET dynamic price
router.get('/price', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/price`, {
      params: req.query
    });
    res.json(response.data);
  } catch (err) {
    console.error('AI service error:', err);
    // Return mock price for demo
    const demand = parseFloat(req.query.demand as string) || 1;
    const basePrice = 5.0;
    const pricePerKwh = basePrice - (demand * 0.1);
    
    res.json({
      pricePerKwh: Math.max(3.5, pricePerKwh),
      demandLevel: demand > 5 ? 'High' : demand > 2 ? 'Medium' : 'Low',
      recommendation: demand > 5 ? 'Increase supply' : 'Normal supply',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
