import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const router = Router();

// GET all houses
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM houses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch houses' });
  }
});

// GET house by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM houses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'House not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch house' });
  }
});

// POST create house
router.post('/', async (req: Request, res: Response) => {
  const { userId, name, address, capacity, latitude, longitude } = req.body;
  const id = uuidv4();

  try {
    const result = await query(
      'INSERT INTO houses (id, user_id, name, address, capacity, latitude, longitude, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [id, userId, name, address, capacity, latitude, longitude]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create house' });
  }
});

export default router;
