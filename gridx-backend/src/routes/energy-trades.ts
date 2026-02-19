import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const router = Router();

// GET all trades
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM energy_trades ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// GET trades for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM energy_trades WHERE seller_id = $1 OR buyer_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user trades' });
  }
});

// POST create trade
router.post('/', async (req: Request, res: Response) => {
  const { sellerId, buyerId, energyKwh, pricePerKwh, txHash } = req.body;
  const id = uuidv4();
  const carbonSaved = energyKwh * 0.8; // kg CO2

  try {
    // Start transaction
    const client = await require('../db').getConnection();
    
    try {
      await client.query('BEGIN');

      // Create trade
      const tradeResult = await client.query(
        'INSERT INTO energy_trades (id, seller_id, buyer_id, energy_kwh, price_per_kwh, tx_hash, carbon_saved, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
        [id, sellerId, buyerId, energyKwh, pricePerKwh, txHash, carbonSaved]
      );

      // Update carbon wallet for buyer
      await client.query(
        'UPDATE carbon_wallet SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
        [carbonSaved, buyerId]
      );

      // Record carbon transaction
      const ctxId = uuidv4();
      await client.query(
        'INSERT INTO carbon_transactions (id, user_id, amount, tx_type, related_trade_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [ctxId, buyerId, carbonSaved, 'earned', id]
      );

      await client.query('COMMIT');
      res.json(tradeResult.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

export default router;
