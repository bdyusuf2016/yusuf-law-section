import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all hearing notices
router.get('/', async (req: Request, res: Response) => {
  try {
    const { circle } = req.query;
    let sql = 'SELECT * FROM hearing_notices';
    const params: any[] = [];
    if (circle && circle !== 'all') {
      params.push(circle);
      sql += ' WHERE circle = $1';
    }
    sql += ' ORDER BY hearing_date ASC';
    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      id: row.id,
      companyId: row.company_id,
      companyName: row.company_name,
      companyAddress: row.company_address,
      circle: row.circle,
      hearingDate: row.hearing_date,
      hearingTime: row.hearing_time,
      hearingRoom: row.hearing_room,
      hearingType: row.hearing_type,
      memoNo: row.memo_no,
      subject: row.subject,
      hearingAuthority: row.hearing_authority,
      officerARO: row.officer_aro,
      officerRO: row.officer_ro,
      createdAt: row.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new hearing notice
router.post('/', async (req: Request, res: Response) => {
  try {
    const n = req.body;
    const sql = `
      INSERT INTO hearing_notices (
        company_id, company_name, company_address, circle, hearing_date,
        hearing_time, hearing_room, hearing_type, memo_no, subject,
        hearing_authority, officer_aro, officer_ro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      n.companyId || null,
      n.companyName,
      n.companyAddress || null,
      n.circle,
      n.hearingDate,
      n.hearingTime || null,
      n.hearingRoom || null,
      n.hearingType || '১ম শুনানী',
      n.memoNo || null,
      n.subject || null,
      n.hearingAuthority || null,
      n.officerARO || null,
      n.officerRO || null
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE notice
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM hearing_notices WHERE id = $1', [id]);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
