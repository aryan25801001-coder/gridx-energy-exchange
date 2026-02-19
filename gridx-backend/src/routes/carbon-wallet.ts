import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const router = Router();

// GET carbon wallet for user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM carbon_wallet WHERE user_id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// GET carbon transactions for user
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM carbon_transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT cw.*, u.name FROM carbon_wallet cw JOIN users u ON cw.user_id = u.id ORDER BY cw.balance DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
