import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all reminders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { circle } = req.query;
    let sql = 'SELECT * FROM circle_reminders';
    const params: any[] = [];
    if (circle && circle !== 'all') {
      params.push(circle);
      sql += ' WHERE circle = $1';
    }
    sql += ' ORDER BY date ASC';
    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      circle: row.circle,
      companyId: row.company_id,
      companyName: row.company_name,
      date: row.date,
      time: row.time,
      priority: row.priority,
      completed: row.completed
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new reminder
router.post('/', async (req: Request, res: Response) => {
  try {
    const r = req.body;
    const sql = `
      INSERT INTO circle_reminders (
        title, circle, company_id, company_name, date, time, priority, completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      r.title,
      r.circle,
      r.companyId || null,
      r.companyName || null,
      r.date,
      r.time || null,
      r.priority || 'medium',
      r.completed || false
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle reminder
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE circle_reminders SET completed = NOT completed WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reminder not found' });
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error toggling reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE reminder
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM circle_reminders WHERE id = $1', [id]);
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
