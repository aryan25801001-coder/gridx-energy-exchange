import { Router, Request, Response } from 'express';
import { query as dbQuery } from '../db';

const router = Router();

// GET transaction status
router.get('/tx/:txHash', async (req: Request, res: Response) => {
  try {
    const result = await dbQuery(
      'SELECT * FROM energy_trades WHERE tx_hash = $1',
      [req.params.txHash]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const trade = result.rows[0];
    res.json({
      txHash: trade.tx_hash,
      status: 'confirmed',
      energyKwh: trade.energy_kwh,
      carbonSaved: trade.carbon_saved,
      createdAt: trade.created_at,
      blockNumber: 123456 + Math.random() * 1000000,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

export default router;
