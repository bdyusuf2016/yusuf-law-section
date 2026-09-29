import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { circle } = req.query;
    let sql = 'SELECT * FROM circle_tasks';
    const params: any[] = [];
    if (circle && circle !== 'all') {
      params.push(circle);
      sql += ' WHERE circle = $1';
    }
    sql += ' ORDER BY due_date ASC';
    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      circle: row.circle,
      companyId: row.company_id,
      companyName: row.company_name,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      completedAt: row.completed_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const t = req.body;
    const sql = `
      INSERT INTO circle_tasks (
        title, category, circle, company_id, company_name,
        due_date, priority, status, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      t.title,
      t.category || null,
      t.circle,
      t.companyId || null,
      t.companyName || null,
      t.dueDate || null,
      t.priority || 'medium',
      t.status || 'pending',
      t.assignedTo || null
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle task status
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const current = await query('SELECT status FROM circle_tasks WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const newStatus = current.rows[0].status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const result = await query(
      'UPDATE circle_tasks SET status = $1, completed_at = $2 WHERE id = $3 RETURNING *',
      [newStatus, completedAt, id]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM circle_tasks WHERE id = $1', [id]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
