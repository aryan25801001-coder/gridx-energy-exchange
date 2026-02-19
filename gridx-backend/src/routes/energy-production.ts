import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const router = Router();

// GET energy production for a house
router.get('/:houseId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM energy_production WHERE house_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [req.params.houseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch energy production' });
  }
});

// GET latest production for a house
router.get('/latest/:houseId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM energy_production WHERE house_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [req.params.houseId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No production data found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch latest production' });
  }
});

// POST new energy production record
router.post('/', async (req: Request, res: Response) => {
  const { houseId, production, temperature } = req.body;
  const id = uuidv4();

  try {
    const result = await query(
      'INSERT INTO energy_production (id, house_id, timestamp, production, temperature) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [id, houseId, production, temperature]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create energy production record' });
  }
});

export default router;
